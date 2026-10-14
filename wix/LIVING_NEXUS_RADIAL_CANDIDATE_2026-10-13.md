# Radial navigation increment — 2026-10-13

Status: SOURCE CANDIDATE ONLY. Not visually accepted, Wix-installed or published.

Continues PR #13 baseline 2aff514a95ad39e9972383b2f02f07c05baa503c.
PR #11 was observed at ff60be322fc700d74fa31a0d87f8fa2723d47274.
The element.js and shell.css blobs match between those baselines. The compiler
has intervening changes and is NOT reconciled by this increment; retain that
explicit merge/build gate. Renderer and source-lock files are unchanged here.

Changes: initially collapsed Explore; native modal navigation dialog; six primary
commands; secondary world ring with Back; shared public Guide/Search APIs; existing
Thread dialog; Stillness, Silence and Sessions booking entrance in both states.
Route change, hidden/offscreen state and disconnect close navigation. No timed
animation callbacks, new storage keys, sensors, private content or model calls.
About describes existing six worlds and local public journey semantics only.

Verification: compiled JavaScript parses, git diff --check passes. Twelve existing
compiler/auric integrity tests and seven Node route-bridge tests passed locally.
These are inherited checks, not evidence that the new dialog works in a browser.
Initial pytest invocation lacked pytest; rerun with existing test dependencies
passed. No GitHub Actions dispatched and all commits use [skip ci].

Blocked verification: cloud browser explicitly rejected file:// local review
navigation under its URL security policy. No alternate browser route was attempted.
Keyboard/modal focus, touch, open/close, Guide/Search, layout at 390/820/1280,
reduced motion, physical Safari and visual comparison remain NOT VERIFIED.
No production page, homepage, native booking/form, Studio or owner key changed.

Next: arrange a permitted HTTP(S) review of the exact reconciled candidate, add
and execute navigation interaction regression coverage, inspect all target sizes,
then continue material-flow refinement. Keep production promotion on hold until
existing visual/device and Wix rollback gates pass. The approved reference ZIP
and its images remain private; none are included in this public repository.
