import { Permissions, webMethod } from 'wix-web-module';
import { submissions } from '@wix/forms';
import { auth } from '@wix/essentials';

// New, separate ADMIN-ONLY pilot. Do not replace the existing public backend.
// Do not weaken this permission to Anyone without CAPTCHA, abuse controls,
// server-side deduplication, and an independently verified public receipt path.
const FORM_ID = '292fd420-6097-4980-a1da-ee6398f78981';
const PROTOCOL = 'archon-living-hud-v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIMITS = {
  creator_name: 160,
  contact_email: 254,
  model_version: 200,
  stone_title: 200,
  contribution_type: 40,
  contribution_text: 12000,
  artifact_link: 2048,
  why_preserve: 4000,
  provenance_notes: 6000
};
const REQUIRED = ['creator_name', 'contact_email', 'stone_title',
  'contribution_type', 'contribution_text', 'why_preserve'];
const TYPES = ['Words / writing', 'Image / visual art', 'Sound / music',
  'Code / tool', 'Research / question', 'Other'];
const createSubmission = auth.elevate(submissions.createSubmission);
const getSubmission = auth.elevate(submissions.getSubmission);

function normalize(values) {
  if (!values || typeof values !== 'object' || Array.isArray(values)) {
    throw new Error('Invalid contribution.');
  }
  const known = new Set([...Object.keys(LIMITS), 'rights_terms_48eb_v06']);
  if (Object.keys(values).some(key => !known.has(key))) {
    throw new Error('Unexpected field.');
  }
  const clean = {};
  for (const [key, max] of Object.entries(LIMITS)) {
    const value = values[key] ?? '';
    if (typeof value !== 'string' || value.length > max) {
      throw new Error('Invalid field type or length.');
    }
    // Omit blank optional fields rather than submitting invalid empty URL values.
    const trimmed = value.trim();
    if (trimmed) clean[key] = trimmed;
  }
  if (REQUIRED.some(key => !clean[key]) || !TYPES.includes(clean.contribution_type)) {
    throw new Error('Required fields are incomplete.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.contact_email)) {
    throw new Error('Invalid email.');
  }
  if (!clean.stone_title.startsWith('[HUD TEST]')) {
    throw new Error('Use a clearly marked owner test title.');
  }
  if (clean.artifact_link) {
    const link = new URL(clean.artifact_link);
    if (link.protocol !== 'https:' || link.username || link.password) {
      throw new Error('Use an HTTPS artifact link without credentials.');
    }
  }
  if (values.rights_terms_48eb_v06 !== true) {
    throw new Error('Explicit acceptance of the pinned terms is required.');
  }
  clean.rights_terms_48eb_v06 = true;
  return clean;
}

// Wix's method declaration returns FormSubmission; one official example wraps
// it in { submission }. Normalize only these two documented representations.
function unwrap(result) {
  return result?.submission ?? result;
}
function idOf(record) {
  return typeof record?._id === 'string' && UUID.test(record._id) ? record._id : '';
}
function matches(record, id, values) {
  return record && idOf(record) === id && record.formId === FORM_ID &&
    record.status === 'CONFIRMED' && record.submissions &&
    Object.entries(values).every(([key, value]) => record.submissions[key] === value);
}

export const previewCapabilities = webMethod(Permissions.Admin, async () => ({
  protocol: PROTOCOL,
  mode: 'admin-preview',
  formId: FORM_ID
}));

export const submitPreviewStone = webMethod(Permissions.Admin, async (values) => {
  let clean;
  try {
    clean = normalize(values);
  } catch {
    // No network operation occurred. Safe to correct the fields and try again.
    return { ok: false, kind: 'validation', attempted: false };
  }
  let receiptId = '';
  try {
    // Do not set PENDING: that is an unrecorded Wix lifecycle state, not the
    // project's PROVISIONAL stewardship decision. Use the Wix Forms default.
    const created = unwrap(await createSubmission({
      formId: FORM_ID,
      seen: false,
      submissions: clean
    }));
    receiptId = idOf(created);
    if (!receiptId) return { ok: false, kind: 'unverified', attempted: true };
    const saved = unwrap(await getSubmission(receiptId));
    if (!matches(saved, receiptId, clean)) {
      return { ok: false, kind: 'unverified', attempted: true, receiptId };
    }
    // Return no contribution content or email, and expose no generic read API.
    return {
      ok: true,
      verified: true,
      formId: FORM_ID,
      receiptId,
      status: 'CONFIRMED',
      stewardship: 'PROVISIONAL'
    };
  } catch {
    // A timeout/error after starting a create does not prove nothing was saved.
    // Never automatically retry a write, and do not leak errors or payloads.
    return { ok: false, kind: 'unverified', attempted: true, ...(receiptId ? { receiptId } : {}) };
  }
});
