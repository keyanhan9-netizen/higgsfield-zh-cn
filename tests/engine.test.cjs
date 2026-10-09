"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");
const { createTranslator, isSupportedLocation } = require("../extension/engine.js");

const fixture = fs.readFileSync(path.join(__dirname, "fixtures/higgsfield-interface.html"), "utf8");
const rules = [
  {
    id: "fixture-navigation",
    selector: "header nav .hfnav-item, header .hfnav-action",
    entries: { Image: "图片", Video: "视频", Pricing: "价格", Create: "创建" }
  },
  {
    id: "fixture-generation",
    selector: "main fieldset button, main fieldset label, main fieldset legend",
    paths: ["/ai/image", "/ai/video", "/generate"],
    entries: { Generate: "生成", Cancel: "取消", Duration: "时长", Quality: "质量" }
  },
  {
    id: "fixture-footer",
    selector: "footer a[href='/pricing']",
    entries: { Pricing: "价格" }
  }
];

function setup(t, options = {}) {
  const dom = new JSDOM(options.html ?? fixture, { url: options.url ?? "https://higgsfield.ai/ai/image" });
  const translator = createTranslator({ document: dom.window.document, rules, ...options.translator });
  t.after(() => {
    translator.destroy();
    dom.window.close();
  });
  return { dom, document: dom.window.document, translator };
}

function textOf(document, id) {
  return document.getElementById(id).textContent;
}

const settle = () => new Promise(resolve => setTimeout(resolve, 100));

test("supported locations require HTTPS and the exact Higgsfield host", () => {
  for (const url of ["https://higgsfield.ai/", "https://www.higgsfield.ai/ai/video", "https://higgsfield.ai/ai/image?from=test#model"]) {
    assert.equal(isSupportedLocation(new URL(url)), true, url);
  }
  for (const url of ["http://higgsfield.ai/", "https://higgsfield.ai.example.com/", "https://example.com/higgsfield.ai", "https://other.higgsfield.ai/", "file:///tmp/higgsfield.ai", "chrome-extension://fixture/index.html"]) {
    assert.equal(isSupportedLocation(new URL(url)), false, url);
  }
});

test("translates exact interface labels and preserves whitespace, markup, and form values", t => {
  const { document, translator } = setup(t);
  const originalPath = document.querySelector("#generate svg path");
  translator.start();
  assert.equal(translator.enabled, true);
  assert.equal(textOf(document, "nav-image"), "图片");
  assert.equal(textOf(document, "nav-video"), "  视频  ");
  assert.equal(textOf(document, "generate"), "生成");
  assert.equal(textOf(document, "cancel"), "取消");
  assert.equal(textOf(document, "quality"), "质量");
  assert.equal(textOf(document, "duration"), "时长");
  assert.equal(textOf(document, "footer-pricing"), "价格");
  assert.equal(document.querySelector("#generate svg path"), originalPath);
  assert.equal(document.getElementById("prompt").value, "Generate");
  assert.equal(document.getElementById("prompt").getAttribute("placeholder"), "Generate");
  assert.equal(textOf(document, "partial"), "Generate an image");
  assert.equal(textOf(document, "lowercase"), "generate");
});

test("translates only title and aria-label in eligible interface scopes", t => {
  const { document, translator } = setup(t);
  const button = document.getElementById("generate");
  button.setAttribute("alt", "Generate");
  button.setAttribute("data-test-label", "Generate");
  button.setAttribute("placeholder", "Generate");
  translator.start();
  assert.equal(button.title, "生成");
  assert.equal(button.getAttribute("aria-label"), "生成");
  assert.equal(button.getAttribute("alt"), "Generate");
  assert.equal(button.getAttribute("data-test-label"), "Generate");
  assert.equal(button.getAttribute("placeholder"), "Generate");
  assert.equal(document.getElementById("prompt").title, "Generate");
  assert.equal(document.getElementById("prompt").getAttribute("aria-label"), "Generate");
  assert.equal(document.getElementById("selection").title, "Generate");
});

test("protects editable elements, user content, code, profiles, and body prose", t => {
  const { document, translator } = setup(t);
  const protectedIds = ["profile-link", "prompt-textarea", "selection", "editable", "empty-editable", "plaintext-editable", "translate-no", "notranslate", "ignore", "user-content", "feed-item", "prompt-testid", "content-testid", "code-testid", "prosemirror", "tiptap", "monaco", "work-link", "pre", "code", "script", "style", "user-prose", "invented-work"];
  const before = new Map(protectedIds.map(id => [id, document.getElementById(id).outerHTML]));
  translator.start();
  for (const [id, html] of before) assert.equal(document.getElementById(id).outerHTML, html, id);
  assert.equal(textOf(document, "explicitly-not-editable"), "生成");
});

test("start and refresh are idempotent and toggling restores exact original text and attributes", t => {
  const { document, translator } = setup(t);
  const before = document.body.innerHTML;
  translator.start();
  const translated = document.body.innerHTML;
  translator.start();
  for (let i = 0; i < 5; i++) translator.refresh();
  assert.equal(document.body.innerHTML, translated);
  translator.setEnabled(false);
  assert.equal(translator.enabled, false);
  assert.equal(document.body.innerHTML, before);
  translator.setEnabled(false);
  assert.equal(document.body.innerHTML, before);
  translator.setEnabled(true);
  assert.equal(document.body.innerHTML, translated);
});

test("observes dynamic insertion while leaving inserted user content intact", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const button = document.createElement("button");
  button.id = "new-control";
  button.textContent = "Generate";
  document.getElementById("generation-controls").append(button);
  const protectedButton = document.createElement("button");
  protectedButton.textContent = "Generate";
  document.getElementById("protected-target").append(protectedButton);
  await settle();
  assert.equal(button.textContent, "生成");
  assert.equal(protectedButton.textContent, "Generate");
});

test("framework text rewrites translate the latest English and restore that latest source", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const label = document.querySelector("#generate span");
  label.firstChild.nodeValue = "Cancel";
  await settle();
  assert.equal(label.textContent, "取消");
  translator.setEnabled(false);
  assert.equal(label.textContent, "Cancel");
  translator.setEnabled(true);
  label.textContent = "Generate";
  await settle();
  assert.equal(label.textContent, "生成");
  translator.setEnabled(false);
  assert.equal(label.textContent, "Generate");
});

test("framework attribute rewrites translate and restore the latest source", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const button = document.getElementById("generate");
  button.setAttribute("title", "Cancel");
  button.setAttribute("aria-label", "Cancel");
  await settle();
  assert.equal(button.title, "取消");
  assert.equal(button.getAttribute("aria-label"), "取消");
  translator.setEnabled(false);
  assert.equal(button.title, "Cancel");
  assert.equal(button.getAttribute("aria-label"), "Cancel");
});

test("an unknown framework rewrite remains untouched on disabling", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const label = document.querySelector("#generate span");
  label.firstChild.nodeValue = "A creator's original title";
  document.getElementById("generate").title = "A creator's original title";
  await settle();
  translator.setEnabled(false);
  assert.equal(label.textContent, "A creator's original title");
  assert.equal(document.getElementById("generate").title, "A creator's original title");
});

test("disabled mode observes no translations and re-enabling handles fresh labels", async t => {
  const { document, translator } = setup(t);
  translator.start();
  translator.setEnabled(false);
  const label = document.querySelector("#generate span");
  label.firstChild.nodeValue = "Cancel";
  await settle();
  assert.equal(label.textContent, "Cancel");
  translator.setEnabled(true);
  assert.equal(label.textContent, "取消");
  translator.setEnabled(false);
  assert.equal(label.textContent, "Cancel");
});

test("pushState route changes restore controls and entering a supported route translates again", async t => {
  const { dom, document, translator } = setup(t);
  const originalPushState = dom.window.history.pushState;
  translator.start();
  assert.equal(dom.window.history.pushState, originalPushState, "does not patch page history");
  dom.window.history.pushState(null, "", "/pricing");
  await new Promise(resolve => setTimeout(resolve, 650));
  assert.equal(textOf(document, "generate"), "Generate");
  assert.equal(document.getElementById("generate").title, "Generate");
  assert.equal(textOf(document, "nav-image"), "图片");
  dom.window.history.pushState(null, "", "/ai/video");
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(textOf(document, "generate"), "生成");
});

test("route prefixes match at path boundaries and refresh can use an injected pathname", t => {
  let pathname = "/ai/image/nested";
  const { document, translator } = setup(t, { translator: { getPathname: () => pathname } });
  translator.start();
  assert.equal(textOf(document, "generate"), "生成");
  pathname = "/ai/images";
  translator.refresh();
  assert.equal(textOf(document, "generate"), "Generate");
  pathname = "/generate";
  translator.refresh();
  assert.equal(textOf(document, "generate"), "生成");
});

test("translated nodes moved into protected content are restored", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const button = document.getElementById("generate");
  document.getElementById("protected-target").append(button);
  await settle();
  assert.equal(button.textContent, "Generate");
  assert.equal(button.title, "Generate");
  assert.equal(button.getAttribute("aria-label"), "Generate");
  document.getElementById("generation-controls").append(button);
  await settle();
  assert.equal(button.textContent, "生成");
});

test("protection attributes added to a translated ancestor restore descendants", async t => {
  for (const [name, value] of [["contenteditable", "true"], ["translate", "no"], ["class", "notranslate"], ["data-hf-zh-ignore", ""], ["data-user-content", ""], ["data-feed-item", ""], ["data-prompt", "Generate"], ["data-testid", "prompt-editor"], ["role", "textbox"]]) {
    const { document, translator } = setup(t);
    translator.start();
    const fieldset = document.getElementById("generation-controls");
    fieldset.setAttribute(name, value);
    await settle();
    assert.equal(textOf(document, "generate"), "Generate", name);
    assert.equal(document.getElementById("generate").title, "Generate", name);
    fieldset.removeAttribute(name);
    await settle();
    assert.equal(textOf(document, "generate"), "生成", name);
    translator.destroy();
  }
});

test("changing an eligible navigation link to a creator profile restores it", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const link = document.getElementById("nav-image");
  link.setAttribute("href", "/@invented-creator");
  await settle();
  assert.equal(link.textContent, "Image");
  link.setAttribute("href", "/ai/image");
  await settle();
  assert.equal(link.textContent, "图片");
});

test("detached nodes restore when disabled and reinserted nodes use current content", async t => {
  const { document, translator } = setup(t);
  translator.start();
  const button = document.getElementById("generate");
  button.remove();
  translator.setEnabled(false);
  assert.equal(button.textContent, "Generate");
  button.querySelector("span").textContent = "Cancel";
  document.getElementById("generation-controls").append(button);
  translator.setEnabled(true);
  await settle();
  assert.equal(button.textContent, "取消");
  translator.setEnabled(false);
  assert.equal(button.textContent, "Cancel");
});

test("destroy restores the page and disconnects dynamic translation", async t => {
  const { document, translator } = setup(t);
  const before = document.body.innerHTML;
  translator.start();
  translator.destroy();
  assert.equal(document.body.innerHTML, before);
  const button = document.createElement("button");
  button.textContent = "Generate";
  document.getElementById("generation-controls").append(button);
  await settle();
  assert.equal(button.textContent, "Generate");
});

for (const [description, secondEntries, expected] of [
  ["does not contain the source label", { Cancel: "取消" }, "Generate"],
  ["uses a different translation", { Generate: "开始生成" }, "开始生成"]
]) {
  test(`moving a translated node into a rule that ${description} rematches text and attributes`, async t => {
    const html = '<main><section class="scope-a"><button id="moving-label" title="Generate" aria-label="Generate">Generate</button></section><section class="scope-b"></section></main>';
    const moveRules = [
      { id: "source-rule", selector: ".scope-a", entries: { Generate: "生成" } },
      { id: "destination-rule", selector: ".scope-b", entries: secondEntries }
    ];
    const { document, translator } = setup(t, { html, translator: { rules: moveRules } });
    translator.start();
    const button = document.getElementById("moving-label");
    assert.equal(button.textContent, "生成");
    document.querySelector(".scope-b").append(button);
    await settle();
    assert.equal(button.textContent, expected);
    assert.equal(button.title, expected);
    assert.equal(button.getAttribute("aria-label"), expected);
    document.querySelector(".scope-a").append(button);
    await settle();
    assert.equal(button.textContent, "生成");
    assert.equal(button.title, "生成");
    translator.setEnabled(false);
    assert.equal(button.textContent, "Generate");
    assert.equal(button.title, "Generate");
    assert.equal(button.getAttribute("aria-label"), "Generate");
  });
}

for (const operation of ["disable", "destroy"]) {
  for (const timing of ["synchronous", "asynchronous"]) {
    test(`${operation} preserves ${timing} external same-value Chinese writes to text and attributes`, async t => {
      const { document, translator } = setup(t);
      translator.start();
      const button = document.getElementById("generate");
      const textNode = button.querySelector("span").firstChild;
      assert.equal(textNode.data, "生成");
      assert.equal(button.title, "生成");
      assert.equal(button.getAttribute("aria-label"), "生成");
      // The page owns an external rewrite even when its value equals our output.
      // A synchronous stop must consume queued MutationObserver records first.
      textNode.nodeValue = "生成";
      button.setAttribute("title", "生成");
      button.setAttribute("aria-label", "生成");
      if (timing === "asynchronous") await settle();
      if (operation === "disable") translator.setEnabled(false);
      else translator.destroy();
      assert.equal(textNode.data, "生成");
      assert.equal(button.title, "生成");
      assert.equal(button.getAttribute("aria-label"), "生成");
      assert.equal(textOf(document, "cancel"), "Cancel", "unmodified translations still restore normally");
    });
  }
}
