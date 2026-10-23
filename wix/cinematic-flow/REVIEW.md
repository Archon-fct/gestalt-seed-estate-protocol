# Archon Soulings continuous crossings and free app foundation

2026-10-23. Review only; production unchanged.

Preview: https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/living-nexus/flow-20261023/index.html

## Implemented

The exact deployed visual12 component removed the previous iframe before the next world was ready. The isolated candidate stops the outgoing runtime but retains its frozen view, loads the next world beneath it, then fades the outgoing layer over 260 ms. No two active render loops are intentionally retained. Rapid selections retain the last visible world; stale ready callbacks are ignored. Stillness, reduced motion and hidden state skip the fade. Existing world documents, route destinations and journey systems are unchanged.

The review shell adds browser history synchronization, a standalone app manifest, provisional geometric icons, and narrowly scoped offline shell caching. App download target: Archon Soulings free; separate Nox Nocturne $4.99. This is a web-app foundation, not a native signed app or store submission. Installation and offline use are not verified. Service/booking prices remain unchanged.

## Evidence

- Node syntax check passed.
- Five Node lifecycle tests passed: retained outgoing frame, rapid selection/stale callback, Stillness/system reduced motion, mid-blend Stillness and disposal. These are mocked lifecycle tests, not visual browser tests.
- Hosted Chromium: constellation and Explore menu rendered; keyboard Enter opened Aura Dynamics; Sessions opened; browser Back restored Nexus after fixing attribute/history synchronization; Stillness skipped the crossing; settled iframe count was one; desktop overflow check false.
- Saved-file comparison: index.html, sw.js and manifest.json match authored content after stripping host injection. Reversing the two candidate replacements yields the unchanged production-serving component byte-for-byte as text.
- Host omitted .webmanifest from saved files; corrected to manifest.json and read back successfully.

## Not verified / unresolved

Actual 260 ms blend fluidity, comprehensive accessibility, phone/iPad responsive matrix, physical Safari, dynamic system reduced-motion switching, installability and offline caching remain unverified. Browser environment temporarily disappeared and then recovered during inspection. The Sessions in-frame Stillness control retained its old unchecked accessibility state while the outer control was enabled; the existing bridge applies the still body class, but inner control synchronization requires further repair/testing. No universal Stillness pass is claimed.

Only crossings within the hosted Living Nexus are changed. Full Wix page transitions (checkout, blog, shop), Gestalt chamber PR15 and the canonical desktop expansion are not modified. Owner acceptance of the new crossings remains open.

## Source / reproduction / rollback

Base GitHub commit: 8811d7788b80eb0768fa7b927432b9cfc165cfa8 (PR16).
Exact hosted component baseline SHA-256: 9ccac269d891b362431ea74cf524afd958aeb2436e68dfb03222a66d04290276.
Baseline URL: https://headless-mfewrcffiie-archonsoulings-140e.wix-site-host.com/living-nexus/v08/archon-living-nexus.js?v=20261020-visual12
Download it as live-nexus.js, verify the SHA-256, then run build.py from the repository root and node --test wix/cinematic-flow/flow.test.cjs. patch.json holds exact guarded before/after source edits; the build preserves all bundled world documents.
Latest review upload: ee936a93-a514-4a4b-8de1-80964ed73705.
All writes are under living-nexus/flow-20261023/. No production asset replaced. Rollback: stop using this preview. Any later deletion must target only this directory. No private data or credentials added; offline cache excludes booking/account/shop requests.

Next: validate rendered crossings and repair the inner/outer Stillness control synchronization, then run phone/iPad/Safari and app installation/offline checks before broader site integration or native app packaging.
