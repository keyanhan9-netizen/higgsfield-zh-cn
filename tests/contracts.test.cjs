"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");
const { createTranslator } = require("../extension/engine.js");
const { rules } = require("../extension/dictionary.js");

const extension = path.join(__dirname, "../extension");
const manifest = JSON.parse(fs.readFileSync(path.join(extension, "manifest.json"), "utf8"));

test("manifest grants only local preference storage and exact HTTPS content targets", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.equal(manifest.host_permissions, undefined);
  assert.equal(manifest.optional_permissions, undefined);
  assert.equal(manifest.optional_host_permissions, undefined);
  assert.equal(manifest.content_scripts.length, 1);
  const content = manifest.content_scripts[0];
  assert.deepEqual(content.matches, ["https://higgsfield.ai/*", "https://www.higgsfield.ai/*"]);
  assert.equal(content.all_frames, false);
  assert.equal(content.world, "ISOLATED");
  assert.deepEqual(content.js, ["dictionary.js", "engine.js", "content.js"]);
  assert.match(manifest.content_security_policy.extension_pages, /connect-src 'none'/);
});

test("shipped extension scripts contain no network, credential, or page storage APIs", () => {
  for (const file of ["engine.js", "dictionary.js", "content.js", "popup.js"]) {
    const source = fs.readFileSync(path.join(extension, file), "utf8");
    assert.doesNotMatch(source, /\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(|\bWebSocket\s*\(|\bEventSource\s*\(|document\s*\.\s*cookie\b|chrome\s*\.\s*cookies\b|\blocalStorage\b|\bsessionStorage\b/, file);
  }
});

test("the production dictionary uses scoped selectors and explicit tool paths", () => {
  assert.ok(rules.length > 0);
  const ids = new Set();
  for (const rule of rules) {
    assert.equal(typeof rule.id, "string");
    assert.equal(ids.has(rule.id), false, `duplicate rule: ${rule.id}`);
    ids.add(rule.id);
    for (const selector of rule.selector.split(",")) {
      assert.match(selector.trim(), /^(header\s|footer\s|main\s+fieldset\s)/, rule.id);
    }
    assert.ok(Object.keys(rule.entries).length > 0);
    for (const [english, chinese] of Object.entries(rule.entries)) {
      assert.equal(typeof chinese, "string");
      assert.ok(english.length > 0 && chinese.length > 0);
      assert.equal(english, english.trim());
      assert.equal(chinese, chinese.trim());
    }
    if (rule.selector.includes("main")) {
      assert.deepEqual(rule.paths, ["/ai/image", "/ai/video", "/generate"]);
      assert.equal(rule.ownText, true, "tool controls translate only the selected element's direct text");
      for (const selector of rule.selector.split(",")) {
        assert.match(selector.trim(), /\bbutton\.[^>]+>.+>.+/, "generation labels require the observed structure");
      }
    }
  }
});

test("production dictionary and engine integrate on the original fixture", t => {
  const html = fs.readFileSync(path.join(__dirname, "fixtures/higgsfield-interface.html"), "utf8");
  const dom = new JSDOM(html, { url: "https://higgsfield.ai/ai/image" });
  const translator = createTranslator({ document: dom.window.document, rules });
  t.after(() => { translator.destroy(); dom.window.close(); });
  translator.start();
  assert.equal(dom.window.document.getElementById("nav-image").textContent, "图片");
  assert.equal(dom.window.document.getElementById("nav-video").textContent, "  视频  ");
  assert.equal(dom.window.document.getElementById("production-generate-text").firstChild.data, "生成");
  assert.equal(dom.window.document.getElementById("production-auto-text").firstChild.data, "自动");
  assert.equal(dom.window.document.getElementById("production-generate-text").title, "生成");
  assert.equal(dom.window.document.getElementById("generate").textContent, "Generate");
  assert.equal(dom.window.document.getElementById("cancel").textContent, "Cancel");
  assert.equal(dom.window.document.getElementById("quality").textContent, "Quality");
  assert.equal(dom.window.document.getElementById("duration").textContent, "Duration");
  for (const id of ["generic-file-name", "marked-file-name", "unmarked-file-name", "auto-marked-file-name", "auto-unmarked-file-name"]) {
    assert.equal(dom.window.document.getElementById(id).textContent, "High", id);
  }
  assert.equal(dom.window.document.getElementById("production-credit").textContent, "12 credits");
  assert.equal(dom.window.document.getElementById("footer-privacy").textContent, "隐私政策");
  assert.equal(dom.window.document.getElementById("profile-link").textContent, "Image");
  assert.equal(dom.window.document.getElementById("prompt").value, "Generate");
  assert.equal(dom.window.document.getElementById("user-prose").textContent, "Generate");
});

test("production control scope translates a dynamic label without translating nested filenames", async t => {
  const html = fs.readFileSync(path.join(__dirname, "fixtures/higgsfield-interface.html"), "utf8");
  const dom = new JSDOM(html, { url: "https://higgsfield.ai/ai/video" });
  const translator = createTranslator({ document: dom.window.document, rules });
  t.after(() => { translator.destroy(); dom.window.close(); });
  translator.start();
  const label = dom.window.document.getElementById("production-generate-text");
  label.firstChild.data = "Cancel";
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(label.firstChild.data, "取消");
  assert.equal(label.querySelector("#unmarked-file-name").textContent, "High");
  assert.equal(label.querySelector("#marked-file-name").textContent, "High");
  translator.setEnabled(false);
  assert.equal(label.firstChild.data, "Cancel");
  assert.equal(label.title, "Generate");
});
