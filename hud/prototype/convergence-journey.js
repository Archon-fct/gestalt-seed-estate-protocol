/* Convergence inquiry journey 0.1.
 * A local preparation tool, not a booking, payment, submission or delivery service.
 * No network calls, persistent storage, identity creation or analytics.
 * The existing Convergence renderer, path identities and controllers remain authoritative.
 */
(() => {
  'use strict';
  const primary = document.querySelector('#primary');
  const other = document.querySelector('#other');
  const gates = [...document.querySelectorAll('.gate[data-gate]')];
  if (!primary || !other || gates.length !== 4) return;

  const CONTACT = 'Drew@ArchonSoulings.com';
  const paths = Object.freeze({
    attend: {label: 'Attend', subject: 'Workshop attendance inquiry',
      question: 'What would you like to learn or practice?',
      placeholder: 'A topic or question is enough. Please omit sensitive personal history.',
      context: 'Connections & Aura Dynamics · $99 current project offer. Date, availability, delivery format and cancellation terms require confirmation before payment.'},
    host: {label: 'Host', subject: 'Workshop hosting inquiry',
      question: 'Who is the gathering for, and approximately how many people?',
      placeholder: 'Describe the audience and the kind of gathering you would like to host.',
      context: 'Discuss audience, space, timing, accessibility, responsibilities and a written quote. The participant offer is not a hosting quote.'},
    teach: {label: 'Invite', subject: 'Speaking or teaching invitation',
      question: 'What should the audience take away?',
      placeholder: 'Describe the event and its teaching or speaking objective.',
      context: 'Discuss the topic, audience, format, preparation and a written quote. No availability or speaking fee is confirmed here.'},
    collab: {label: 'Collaborate', subject: 'Creative collaboration inquiry',
      question: 'What small piece of work could we make together?',
      placeholder: 'Describe the proposed scope and any questions about rights or responsibilities.',
      context: 'Agree on scope, ownership, attribution, compensation, consent and public/private boundaries before work begins. An inquiry is not a Stone submission or a rights assignment.'}
  });
  const draftByPath = new Map();
  let selected = null;
  let prepared = '';
  let opener = null;
  let objectUrl = null;

  const dialog = document.createElement('dialog');
  dialog.id = 'convergenceInquiry';
  dialog.className = 'convergence-sheet';
  dialog.setAttribute('aria-labelledby', 'inquiryTitle');
  dialog.setAttribute('aria-describedby', 'inquiryPrivacy');
  // Fixed interface markup only. User content is assigned with value/textContent.
  dialog.innerHTML = `
    <div class="sheet-heading"><h2 id="inquiryTitle">Prepare an inquiry</h2><button class="pill" id="inquiryClose" type="button" aria-label="Close inquiry and return to the Convergence">Close</button></div>
    <p id="inquiryContext"></p>
    <p id="inquiryPrivacy">This draft stays in this page's memory. It is not sent or saved automatically. Export or open an email only when ready. Please do not include client records or sensitive personal information.</p>
    <form id="inquiryForm" method="dialog" autocomplete="off">
      <label for="inquiryGoal" id="inquiryGoalLabel">What would you like to explore?</label>
      <textarea id="inquiryGoal" name="goal" spellcheck="false" rows="3" required maxlength="600"></textarea>
      <label for="inquiryTiming">Preferred timing and time zone <span>(optional)</span></label>
      <input id="inquiryTiming" name="timing" spellcheck="false" type="text" maxlength="120" placeholder="Approximate dates and time zone; not a reservation">
      <label for="inquiryFormat">Format or general location <span>(optional)</span></label>
      <input id="inquiryFormat" name="format" spellcheck="false" type="text" maxlength="160" placeholder="Online, or a city / venue type; no home address needed">
      <label class="sheet-consent" for="inquiryConsent"><input id="inquiryConsent" name="consent" type="checkbox" required><span>I understand this prepares an inquiry, not a booking, payment or contribution.</span></label>
      <button class="pill" type="submit" id="reviewInquiry">Review inquiry</button>
    </form>
    <section id="inquiryReview" aria-labelledby="inquiryReviewTitle" hidden>
      <h3 id="inquiryReviewTitle" tabindex="-1">Review before sharing</h3>
      <pre id="inquiryText"></pre>
      <p id="inquiryEmailHint">Opening an email app does not send this inquiry. Review the recipient and message there before sending.</p>
      <div class="actions"><a class="pill" id="emailInquiry">Open email draft</a><button class="pill" id="exportInquiry" type="button">Export inquiry (.txt)</button><button class="pill" id="editInquiry" type="button">Edit</button></div>
    </section>
    <p id="inquiryStatus" role="status" aria-live="polite" aria-atomic="true"></p>
    <details class="sheet-next"><summary>What happens next?</summary><p>Send the inquiry yourself when ready. Wait for a personal reply confirming fit, dates, price and terms. This page cannot check whether an email was sent or received, reserve a place or take payment.</p><p>Keep a copy of any agreed details and the official receipt after purchasing through a confirmed checkout.</p><button class="pill" id="exportFollowup" type="button">Export follow-up notes (.txt)</button><p><a href="./aura-dynamics.html">Explore the existing Aura Dynamics practice</a></p></details>
    <div class="actions"><button class="pill" id="dissolveInquiry" type="button">Let this draft dissolve</button></div>
    <p class="sheet-small">Closing keeps this unsent draft only while this page remains open. Dissolve clears the selected draft from this page, not any file already exported or email already copied. No email app? Contact <a href="mailto:Drew@ArchonSoulings.com">Drew@ArchonSoulings.com</a>.</p>`;
  document.body.append(dialog);
  const $ = id => dialog.querySelector('#' + id);
  const form = $('inquiryForm');
  const inputs = {goal: $('inquiryGoal'), timing: $('inquiryTiming'), format: $('inquiryFormat')};
  const limits = {goal: 600, timing: 120, format: 160};
  const consent = $('inquiryConsent');
  const review = $('inquiryReview');
  const email = $('emailInquiry');
  const status = text => { $('inquiryStatus').textContent = text; };
  const clean = value => String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  const encode = text => encodeURIComponent(String(text).toWellFormed?.() ?? String(text).replace(/[\uD800-\uDFFF]/g, '\uFFFD'));
  const emailUrl = (subject, body = '') => 'mailto:' + CONTACT + '?subject=' + encode(subject) + (body ? '&body=' + encode(body) : '');
  const supportsDialog = () => typeof dialog.showModal === 'function';

  function invalidateReview() {
    dialog.classList.remove('is-reviewing');
    prepared = '';
    $('inquiryText').textContent = '';
    email.removeAttribute('href');
    review.hidden = true;
    form.hidden = false;
  }
  function remember() {
    if (!selected) return;
    draftByPath.set(selected, {goal: inputs.goal.value, timing: inputs.timing.value,
      format: inputs.format.value, consent: consent.checked});
  }
  function loadDraft() {
    invalidateReview();
    const d = draftByPath.get(selected) || {};
    Object.entries(inputs).forEach(([key, input]) => {input.value = d[key] || ''; input.setCustomValidity('');});
    consent.checked = Boolean(d.consent);
    status('Not sent · not reserved · no payment taken.');
  }
  function select(key) {
    if (!Object.hasOwn(paths, key)) return;
    remember();
    selected = key;
    primary.href = emailUrl(paths[key].subject);
    primary.setAttribute('aria-haspopup', supportsDialog() ? 'dialog' : 'false');
    primary.setAttribute('aria-controls', dialog.id);
    gates.forEach(gate => gate.setAttribute('aria-pressed', String(gate.dataset.gate === key)));
    loadDraft();
  }
  gates.forEach(gate => {
    gate.setAttribute('aria-pressed', 'false');
    gate.addEventListener('click', () => select(gate.dataset.gate));
  });
  primary.setAttribute('href', '#field');
  primary.addEventListener('click', event => {
    if (!selected) {event.preventDefault(); gates[0].focus(); return;}
    if (!supportsDialog()) return; // Real email fallback; no inert dialog.
    event.preventDefault();
    if (dialog.open) return;
    const spec = paths[selected];
    $('inquiryTitle').textContent = spec.label + ' · Prepare an inquiry';
    $('inquiryContext').textContent = spec.context;
    $('inquiryGoalLabel').textContent = spec.question;
    inputs.goal.placeholder = spec.placeholder;
    opener = primary;
    loadDraft();
    dialog.showModal();
    inputs.goal.focus();
  });
  $('inquiryClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    remember();
    invalidateReview();
    if (opener?.isConnected) opener.focus();
  });
  other.addEventListener('click', () => {
    remember();
    selected = null;
    primary.textContent = 'Continue';
    primary.setAttribute('href', '#field');
    primary.removeAttribute('aria-haspopup');
    primary.removeAttribute('aria-controls');
    gates.forEach(gate => gate.setAttribute('aria-pressed', 'false'));
    invalidateReview();
    gates[0].focus();
  });
  form.addEventListener('input', () => {
    Object.values(inputs).forEach(input => input.setCustomValidity(''));
    invalidateReview();
    remember();
    status('Unsent draft updated. Review before sharing.');
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!selected) return;
    for (const [key, input] of Object.entries(inputs)) {
      const value = clean(input.value);
      input.setCustomValidity(value.length > limits[key] ? `Use ${limits[key]} characters or fewer.` :
        key === 'goal' && !value ? 'Please describe the inquiry briefly.' : '');
    }
    if (!form.reportValidity()) return;
    remember();
    const spec = paths[selected];
    prepared = ['ARCHON SOULINGS — ' + spec.label.toUpperCase() + ' INQUIRY',
      'Status: UNSENT DRAFT. Not a reservation, payment, contribution or confirmed agreement.', '',
      spec.question, clean(inputs.goal.value), '',
      'Preferred timing / time zone: ' + (clean(inputs.timing.value) || 'To discuss'),
      'Format / general location: ' + (clean(inputs.format.value) || 'To discuss'), '',
      'Please confirm fit, availability, price, delivery details and cancellation terms before any payment.',
      selected === 'collab' ? 'Please agree scope, ownership, attribution and compensation before work begins.' : '',
      '', 'Recipient: ' + CONTACT].filter((line, i, arr) => line || arr[i - 1] !== '').join('\n');
    $('inquiryText').textContent = prepared;
    const fullUrl = emailUrl(spec.subject, prepared);
    // Keep the entire exported draft. Never silently truncate a long encoded email URI.
    const tooLong = fullUrl.length > 1800;
    email.href = tooLong ? emailUrl(spec.subject) : fullUrl;
    $('inquiryEmailHint').textContent = tooLong
      ? 'This draft is long. Export it first, then attach or paste it into the email app. The email link includes the subject only. Nothing has been sent.'
      : 'Opening an email app does not send this inquiry. Review the recipient and message there before sending.';
    form.hidden = true;
    review.hidden = false;
    dialog.classList.add('is-reviewing');
    status('Ready for your review. Nothing has been sent or reserved.');
    $('inquiryReviewTitle').focus();
  });
  $('editInquiry').addEventListener('click', () => {invalidateReview(); status('Unsent draft · editing.'); inputs.goal.focus();});
  email.addEventListener('click', event => {
    if (!prepared || !consent.checked || !email.hasAttribute('href')) {event.preventDefault(); return;}
    status('Your email app may open. This page cannot confirm sending or delivery.');
  });
  function releaseObjectUrl() {
    if (objectUrl) {URL.revokeObjectURL(objectUrl); objectUrl = null;}
  }
  function exportText(text, filename) {
    try {
      releaseObjectUrl();
      objectUrl = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      const created = objectUrl;
      setTimeout(() => {if (objectUrl === created) releaseObjectUrl();}, 30000);
      status('Export requested. Your device may ask where to save it. No inquiry has been sent.');
    } catch {
      status('Export is unavailable in this browser. Copy the reviewed text instead; nothing has been sent.');
    }
  }
  $('exportInquiry').addEventListener('click', () => {
    if (prepared && consent.checked) exportText(prepared, `archon-${selected}-inquiry.txt`);
  });
  $('exportFollowup').addEventListener('click', () => {
    if (!selected) return;
    exportText(['ARCHON SOULINGS — ' + paths[selected].label.toUpperCase() + ' FOLLOW-UP NOTES',
      'Blank personal organizer. Not proof of attendance, payment, certification or agreement.', '',
      'Inquiry sent by me on:', 'Reply / agreed next step:', 'Confirmed date, time and time zone:',
      'Confirmed format / location:', 'Agreed price and cancellation terms:', 'Official receipt location:',
      'Questions to bring:', 'What I practiced or learned:', 'One next step:', '',
      'Keep these notes privately. Nothing in this file is uploaded by the Convergence.',
      'Contact: ' + CONTACT, 'THARAVEL ~ KOSMATHRA'].join('\n'), `archon-${selected}-follow-up.txt`);
  });
  $('dissolveInquiry').addEventListener('click', () => {
    if (selected) draftByPath.delete(selected);
    form.reset();
    Object.values(inputs).forEach(input => {input.value = ''; input.setCustomValidity('');});
    consent.checked = false;
    invalidateReview();
    releaseObjectUrl();
    status('This draft has dissolved from this page. Previously exported files and copied emails are not deleted.');
    inputs.goal.focus();
  });
  function clearPageMemory() {
    draftByPath.clear();
    form.reset();
    Object.values(inputs).forEach(input => {input.value = ''; input.setCustomValidity('');});
    consent.checked = false;
    invalidateReview();
    releaseObjectUrl();
    status('Unsent drafts cleared after leaving this page.');
  }
  window.addEventListener('pagehide', clearPageMemory);
  window.addEventListener('pageshow', event => {if (event.persisted) clearPageMemory();});
})();
