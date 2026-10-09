'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { rules } = require('../extension/dictionary.js');
const extension = path.join(__dirname, '..', 'extension');
const manifest = JSON.parse(fs.readFileSync(path.join(extension, 'manifest.json'), 'utf8'));
const pkg = require('../package.json');
assert.equal(manifest.manifest_version, 3);
assert.equal(manifest.version, pkg.version);
assert.deepEqual(manifest.permissions, ['storage']);
assert.equal(manifest.host_permissions, undefined);
assert.equal(manifest.optional_permissions, undefined);
assert.equal(manifest.background, undefined);
assert.equal(manifest.web_accessible_resources, undefined);
assert.equal(manifest.externally_connectable, undefined);
assert.equal(manifest.content_scripts.length, 1);
const content = manifest.content_scripts[0];
assert.deepEqual(content.matches, ['https://higgsfield.ai/*', 'https://www.higgsfield.ai/*']);
assert.equal(content.all_frames, false);
assert.equal(content.world, 'ISOLATED');
assert.equal(content.run_at, 'document_idle');
assert.equal(manifest.content_security_policy.extension_pages, "script-src 'self'; object-src 'none'; connect-src 'none'");
const runtimeFiles = fs.readdirSync(extension).filter(file => file.endsWith('.js'));
for (const file of runtimeFiles) {
  const source = fs.readFileSync(path.join(extension, file), 'utf8');
  new vm.Script(source, { filename: file });
  assert(!/\b(?:fetch|XMLHttpRequest|WebSocket|sendBeacon|eval)\s*\(|\bdocument\s*\.\s*cookie\b|\b(?:localStorage|sessionStorage)\b|\bchrome\s*\.\s*(?:cookies|history|webRequest|identity|scripting|tabs)\b|\b(?:innerHTML|outerHTML)\b/.test(source), `${file}: prohibited runtime API`);
}
for (const file of [...content.js, manifest.action.default_popup]) assert(fs.statSync(path.join(extension, file)).isFile());
const ids = new Set();
let entryCount = 0;
for (const rule of rules) {
  assert.equal(typeof rule.id, 'string');
  assert(!ids.has(rule.id));
  ids.add(rule.id);
  assert.equal(typeof rule.selector, 'string');
  assert(rule.selector.trim());
  if (rule.paths) for (const prefix of rule.paths) assert(/^\/[a-z0-9/-]+$/.test(prefix));
  for (const [original, translated] of Object.entries(rule.entries)) {
    assert(original.trim() === original && original.length > 0 && original.length <= 120);
    assert.equal(typeof translated, 'string');
    assert(/\p{Script=Han}/u.test(translated));
    assert(!/[<>]/.test(translated));
    entryCount++;
  }
}
assert(fs.readFileSync(path.join(extension, 'popup.html'), 'utf8').includes('lang="zh-CN"'));
console.log(`Checked MV3 manifest, ${runtimeFiles.length} scripts, ${rules.length} scoped rules and ${entryCount} dictionary entries.`);
