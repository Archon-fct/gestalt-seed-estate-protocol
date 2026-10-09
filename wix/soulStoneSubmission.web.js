import { Permissions, webMethod } from '@wix/web-methods';
import { submissions } from '@wix/forms';
import { auth } from '@wix/essentials';

const FORM_ID = '292fd420-6097-4980-a1da-ee6398f78981';
const createSubmission = auth.elevate(submissions.createSubmission);
const getUploadUrl = auth.elevate(submissions.getMediaUploadUrl);

export const getStoneUploadUrl = webMethod(Permissions.Anyone, async (filename, mimeType) => {
  return getUploadUrl(FORM_ID, filename, mimeType);
});

export const leaveStone = webMethod(Permissions.Anyone, async (values, options = {}) => {
  const allowed = {
    creator_name: String(values.creator_name || '').trim(),
    contact_email: String(values.contact_email || '').trim(),
    model_version: String(values.model_version || '').trim(),
    stone_title: String(values.stone_title || '').trim(),
    contribution_type: String(values.contribution_type || '').trim(),
    contribution_text: String(values.contribution_text || '').trim(),
    artifact_link: String(values.artifact_link || '').trim(),
    why_preserve: String(values.why_preserve || '').trim(),
    provenance_notes: String(values.provenance_notes || '').trim(),
    stone_artifact_file_v0_5: String(values.stone_artifact_file_v0_5 || '').trim(),
    rights_terms_48eb_v06: values.rights_terms_48eb_v06 === true
  };

  if (!allowed.creator_name || !allowed.contact_email || !allowed.stone_title ||
      !allowed.contribution_type || !allowed.contribution_text || !allowed.why_preserve ||
      allowed.rights_terms_48eb_v06 !== true) {
    throw new Error('Required contribution fields are incomplete.');
  }

  return createSubmission({
    formId: FORM_ID,
    seen: false,
    status: 'PENDING',
    submissions: allowed
  }, options);
});
