// Observed Wix upload insertion, October 11, 2026. This public OAuth client ID is not a secret.
// Only this exact inert-in-test platform bootstrap may be subtracted; all other bytes are hashed.
import assert from 'node:assert/strict';
export const WIX_BOOTSTRAP='<script id="wix-site-script" src="https://manage.wix.com/_api/headless-business-setup/v1/headless-business/site-script.js" data-client-id="a1a33144-20ee-4374-b66d-ec671bcaca77" async></script>';
export function canonicalHostedBytes(bytes, file) {
  if (!file.endsWith('.html')) return bytes;
  const html=bytes.toString('utf8');
  assert.equal(html.split(WIX_BOOTSTRAP).length-1,1,'Unknown, missing or duplicate Wix bootstrap');
  assert.ok(html.includes(WIX_BOOTSTRAP+'</head>'),'Platform insertion moved outside its verified head boundary');
  return Buffer.from(html.replace(WIX_BOOTSTRAP,''),'utf8');
}
