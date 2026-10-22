"""Browser UI regression tests, using local HTML only. No website navigation.
Requires Python Playwright and Chromium. Every network request is blocked.
These tests do not establish live Wix integration or an installed preview page.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'hud/preview/index.html').read_text()
checks=[]
errors=[]
def check(name,condition):
    assert condition,name
    checks.append(name)
    print('PASS',name)
def fill(page):
    page.locator('#contribute').click()
    page.locator('[name=creator_name]').fill('HUD test')
    page.locator('[name=contact_email]').fill('test@example.invalid')
    page.locator('#next').click()
    page.locator('[name=stone_title]').fill('[HUD TEST] Original test fragment')
    page.locator('[name=contribution_type]').select_option('Words / writing')
    page.locator('[name=contribution_text]').fill('A small original test sentence.')
    page.locator('#next').click()
    page.locator('[name=why_preserve]').fill('Verify the preview without contacting Wix.')
    page.locator('#next').click()
    page.locator('[name=rights_terms_48eb_v06]').check()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
    def load(width=1440,height=1000):
        page=context.new_page()
        page.set_viewport_size({'width':width,'height':height})
        page.route('**/*',lambda r:r.abort())
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('dialog',lambda d:d.accept())
        page.set_content(HTML,wait_until='load')
        return page
    page=load()
    check('six public project nodes',page.locator('[data-node]').count()==6)
    page.locator('[data-node=gestalt]').click()
    check('Gestalt actions have real destinations',page.locator('#projectActions a').count()==2)
    page.keyboard.press('Escape')
    check('modal focus returns to trigger',page.locator('[data-node=gestalt]').evaluate('(e)=>document.activeElement===e'))
    page.locator('#still').click()
    check('Stillness disables pseudo-element motion',page.locator('.nexus').evaluate('(e)=>getComputedStyle(e,"::before").animationName')=='none')
    page.locator('#contribute').click()
    page.locator('#next').click()
    check('blank identity cannot advance',page.locator('#threshold').get_attribute('data-stage')=='0')
    page.locator('[data-step="3"]').click()
    check('stage shortcuts cannot bypass required fields',page.locator('#threshold').get_attribute('data-stage')=='0')
    page.locator('#toNexus').click()
    fill(page)
    check('review contains entries','Original test fragment' in page.locator('#review').inner_text())
    check('standalone cannot claim a submission',page.locator('#submit').is_disabled())
    check('no success displayed in disconnected preview',page.locator('#success').is_hidden())
    page.locator('#previous').click();page.locator('#next').click()
    check('back and forward retain entered values',page.locator('[name=creator_name]').input_value()=='HUD test')
    page.locator('#toNexus').click();page.locator('#contribute').click()
    check('return to nexus retains draft in memory',page.locator('[name=stone_title]').input_value().startswith('[HUD TEST]'))
    with page.expect_download() as info:page.locator('#saveDraft').click()
    saved=json.loads(Path(info.value.path()).read_text())
    check('export is unsubmitted with consent reset',saved['submitted'] is False and saved['values']['rights_terms_48eb_v06'] is False)
    page.evaluate("document.querySelector('[name=contribution_text]').value='<img src=x onerror=alert(1)>';review()")
    check('review escapes malicious markup',page.locator('#review img').count()==0)
    page.locator('[data-step="1"]').click()
    page.locator('[name=artifact_link]').fill('javascript:alert(1)');page.locator('#next').click()
    check('unsafe artifact URL cannot advance',page.locator('#threshold').get_attribute('data-stage')=='1')
    page.locator('#clear').click()
    check('explicit clear removes identity and consent',page.locator('[name=contact_email]').input_value()=='' and not page.locator('[name=rights_terms_48eb_v06]').is_checked())
    page.evaluate("window.dispatchEvent(new MessageEvent('message',{source:window,origin:'https://www.archonsoulings.com',data:{protocol:PROTOCOL,nonce,type:'ready',mode:'admin-preview',formId:FORM_ID}}))")
    check('self-spoofed ready message rejected',page.evaluate('bridgeReady') is False)
    check('keyboard focus stays inside modal',page.locator('#threshold').evaluate('(e)=>e.contains(document.activeElement)'))
    page.close()
    for width,height in [(320,700),(390,844),(768,1024),(1440,1000)]:
        page=load(width,height)
        check(f'{width}px no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth'))
        boxes=[page.locator(f'.n{i}').bounding_box() for i in range(1,7)]
        overlap=False
        for i,a in enumerate(boxes):
            for b in boxes[i+1:]:
                if a['x']<b['x']+b['width'] and a['x']+a['width']>b['x'] and a['y']<b['y']+b['height'] and a['y']+a['height']>b['y']:overlap=True
        check(f'{width}px orb targets do not overlap',not overlap)
        if width==1440:page.screenshot(path=str(ROOT/'preview-desktop.png'),full_page=True)
        if width==390:
            page.screenshot(path=str(ROOT/'preview-mobile.png'),full_page=True)
            fill(page)
            page.screenshot(path=str(ROOT/'threshold-mobile.png'))
            page.locator('#submit').scroll_into_view_if_needed()
            check('mobile review scrolls to submit',page.locator('#submit').is_visible())
        page.emulate_media(reduced_motion='reduce')
        check(f'{width}px reduced motion honored',page.locator('.nexus').evaluate('(e)=>getComputedStyle(e,"::before").animationName')=='none')
        page.close()
    check('no JavaScript runtime errors',not errors)
    browser.close()
(ROOT/'tests/browser-results.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'network':'Local HTML via set_content; external requests blocked. No Wix APIs or live submission invoked.'},indent=2))
print(f'{len(checks)} browser UI checks passed. No live Wix submission was made.')
