import { previewCapabilities, submitPreviewStone } from 'backend/livingThresholdPreview.web';

// Add ONLY to a separate unpublished, non-primary preview page.
// The page needs one HTML Component with ID #livingHUD, containing the preview
// HTML. Both web methods enforce Wix Admin authorization server-side.
const PROTOCOL = 'archon-living-hud-v1';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

$w.onReady(() => {
  const html = $w('#livingHUD');
  let nonce = '', attempted = false;
  const replies = new Map();
  const capabilities = previewCapabilities().catch(() => null);

  html.onMessage(async (event) => {
    const data = event.data;
    if (!data || data.protocol !== PROTOCOL ||
        typeof data.nonce !== 'string' || !UUID.test(data.nonce)) return;
    if (nonce && data.nonce !== nonce) return;
    const access = await capabilities;
    if (!access || access.mode !== 'admin-preview' || (nonce && data.nonce !== nonce)) return;
    nonce = data.nonce;
    if (data.type === 'hello') {
      await html.postMessage({ ...access, type: 'ready', nonce });
      return;
    }
    if (data.type !== 'submit' || typeof data.requestId !== 'string' ||
        !UUID.test(data.requestId)) return;
    if (replies.has(data.requestId)) {
      await html.postMessage(replies.get(data.requestId));
      return;
    }
    // One attempted write per page lifetime. No retries after uncertain delivery.
    if (attempted) return;
    attempted = true;
    let result;
    try {
      result = await submitPreviewStone(data.values);
    } catch {
      result = { ok: false, kind: 'unverified', attempted: true };
    }
    if (result?.kind === 'validation' && result.attempted === false) attempted = false;
    const response = { protocol: PROTOCOL, type: 'result', nonce,
      requestId: data.requestId, result };
    // Bounded response cache, no submitted values retained in this map.
    if (replies.size >= 8) replies.delete(replies.keys().next().value);
    replies.set(data.requestId, response);
    await html.postMessage(response);
  });
});
