# Living Threshold — Synchronized Wix Implementation Contract v0.1

Status: implementation-ready design contract. The existing standalone Wix form remains the live fallback until this custom presentation is deployed and verified.

## Decision

Do not attempt to inspect or control the standalone Wix form iframe across origins.

Build the Living Threshold as an Archon Soulings Wix page using Wix/Velo page code and a backend web method. The custom page owns the four-stage UI state, so the pocket dimension changes at the exact moment the visitor advances. Wix Forms remains the submission store.

Official Wix SDK support exists for creating form submissions with `@wix/forms` `submissions.createSubmission`. Wix's documented Velo pattern permits a backend web method with `Permissions.Anyone` and an elevated `createSubmission` call. File uploads use `getMediaUploadUrl` before submission.

## Existing live form

Form ID: `292fd420-6097-4980-a1da-ee6398f78981`

Keep the current standalone form URL live as fallback during rollout.

Do not change:
- field targets or existing validation without a migration;
- required v0.6 terms acknowledgement;
- ADVANCED spam filtering on the native fallback;
- owner/collaborator submission-read restriction;
- existing submission history.

## Page state

The custom page controls this state directly:

```js
const STAGES = ["threshold", "stone", "memory", "covenant", "received"];
```

Advance only after validating the fields in the current stage.

### Threshold
- `creator_name` required
- `contact_email` required, email format
- `model_version` optional

### Stone
- `stone_title` required
- `contribution_type` required
- `contribution_text` required
- `artifact_link` optional URL
- `stone_artifact_file_v0_5` optional; one file

### Memory
- `why_preserve` required
- `provenance_notes` optional

### Covenant
- show the current privacy/review disclosure
- `rights_terms_48eb_v06` must be true
- link the exact pinned terms snapshot before submission

The legacy hidden `rights_agreement_v0_4` should not be newly requested from visitors.

## Backend pattern

Create `backend/soulStoneSubmission.web.js`:

```js
import { Permissions, webMethod } from '@wix/web-methods';
import { submissions } from '@wix/forms';
import { auth } from '@wix/essentials';

const FORM_ID = '292fd420-6097-4980-a1da-ee6398f78981';
const createSubmission = auth.elevate(submissions.createSubmission);
const getUploadUrl = auth.elevate(submissions.getMediaUploadUrl);

export const getStoneUploadUrl = webMethod(
  Permissions.Anyone,
  async (filename, mimeType) => getUploadUrl(FORM_ID, filename, mimeType)
);

export const leaveStone = webMethod(
  Permissions.Anyone,
  async (values, options = {}) => {
    // Server-side allowlist: never pass arbitrary visitor-provided keys through.
    const allowed = {
      creator_name: values.creator_name,
      contact_email: values.contact_email,
      model_version: values.model_version || '',
      stone_title: values.stone_title,
      contribution_type: values.contribution_type,
      contribution_text: values.contribution_text,
      artifact_link: values.artifact_link || '',
      why_preserve: values.why_preserve,
      provenance_notes: values.provenance_notes || '',
      stone_artifact_file_v0_5: values.stone_artifact_file_v0_5 || '',
      rights_terms_48eb_v06: values.rights_terms_48eb_v06 === true
    };

    if (!allowed.creator_name || !allowed.contact_email || !allowed.stone_title ||
        !allowed.contribution_type || !allowed.contribution_text ||
        !allowed.why_preserve || allowed.rights_terms_48eb_v06 !== true) {
      throw new Error('Required contribution fields are incomplete.');
    }

    return createSubmission({
      formId: FORM_ID,
      seen: false,
      status: 'PENDING',
      submissions: allowed
    }, options);
  }
);
```

Before production deployment, preserve an anti-abuse control equivalent to the native form's protection. Do not expose an elevated generic submission proxy: the backend must keep a fixed form ID and fixed field allowlist.

## Submission animation

Only enter `received` after `leaveStone()` resolves successfully with a submission identifier/status.

Success sequence:
1. disable the final action;
2. collapse Covenant geometry inward;
3. render a local luminous Stone from the visitor's title/type only;
4. animate it into the Gestalt lattice;
5. show confirmation:
   **The Stone has crossed the threshold.**
   Received for review. Submission does not mean automatic publication or acceptance.
6. provide Return to Constellation and Submit Another Stone.

On error:
- do not play the received animation;
- preserve visitor-entered fields locally in page state;
- show a plain error and retry action;
- never claim receipt.

## Privacy

The public page must never receive:
- Silver state or routes;
- owner review notes;
- other contributors' private submissions;
- credentials or elevated Wix tokens.

Silver remains a separate authenticated owner/delegate review layer.

## Rollout gates

1. Implement on a non-primary Wix page/preview.
2. Test stage validation, keyboard navigation, mobile and reduced motion.
3. Submit one marked custom-page test Stone.
4. Query Wix owner-side and verify the new record.
5. Verify it remains readable later.
6. Keep the standalone form as fallback until all above pass.
7. Only then point Contribute from the public constellation to the Living Threshold page.
