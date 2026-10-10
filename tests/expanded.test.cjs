"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");
const { createTranslator } = require("../extension/engine.js");
const { rules } = require("../extension/dictionary.js");

const fixture = fs.readFileSync(path.join(__dirname, "fixtures/expanded-interface.html"), "utf8");
const settle = () => new Promise(resolve => setTimeout(resolve, 100));

function setup(t, pathname = "/ai/image", selectedRules = rules) {
  const dom = new JSDOM(fixture, { url: `https://higgsfield.ai${pathname}` });
  const translator = createTranslator({ document: dom.window.document, rules: selectedRules });
  t.after(() => { translator.destroy(); dom.window.close(); });
  const document = dom.window.document;
  return { dom, document, translator, byId: id => document.getElementById(id) };
}

test("production navigation menu labels translate while model names and unrelated panels remain original", t => {
  const { translator, byId } = setup(t);
  translator.start();
  assert.equal(byId("menu-features").textContent, "功能");
  assert.equal(byId("menu-create-image").textContent, "创建图片");
  assert.equal(byId("menu-description").textContent, "生成 AI 图片");
  assert.equal(byId("menu-model").textContent, "GPT Image 2");
  assert.equal(byId("menu-number").textContent, "4096 × 4096");
  assert.equal(byId("unrelated-menu-label").textContent, "Features");
  assert.equal(byId("menu-protected").textContent, "Create Image");
  assert.equal(byId("menu-input").value, "Create Image");
  assert.equal(byId("header-search").getAttribute("aria-label"), "搜索 Higgsfield");
});

test("production image settings translate only the popup linked by an approved control", t => {
  const { translator, byId } = setup(t);
  translator.start();
  assert.equal(byId("popup-quality-title").textContent, "选择质量");
  assert.equal(byId("popup-high").firstChild.data, "高");
  assert.equal(byId("popup-high").title, "高");
  assert.equal(byId("popup-high").getAttribute("aria-label"), "高");
  assert.equal(byId("popup-quality-description").textContent, "最佳画面保真度");
  assert.equal(byId("popup-auto").textContent, "Auto", "only the verified quality choices are covered");
  for (const id of ["popup-b-high", "unrelated-high", "invalid-role-high"]) assert.equal(byId(id).textContent, "High", id);
  for (const id of ["popup-b-quality-title", "unrelated-quality"]) assert.equal(byId(id).textContent, "Select quality", id);
  assert.equal(byId("image-setting-label").firstChild.data, "高");
  assert.equal(byId("image-decrement").getAttribute("aria-label"), "减少数量");
  assert.equal(byId("image-increment").getAttribute("aria-label"), "增加数量");
  assert.equal(byId("image-generic-button").textContent, "High");
  assert.equal(byId("image-generic-label").textContent, "High");
});

test("removing aria-controls restores text and attributes in the former linked popup", async t => {
  const { translator, byId } = setup(t);
  translator.start();
  byId("image-trigger").removeAttribute("aria-controls");
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("popup-high").title, "High");
  assert.equal(byId("popup-high").getAttribute("aria-label"), "High");
  assert.equal(byId("popup-quality-title").textContent, "Select quality");
});

test("changing aria-controls dynamically restores the old popup and translates the new one", async t => {
  const { translator, byId } = setup(t);
  translator.start();
  byId("image-trigger").setAttribute("aria-controls", "image-popup-b");
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("popup-high").title, "High");
  assert.equal(byId("popup-b-high").textContent, "高");
  assert.equal(byId("popup-b-high").title, "高");
  byId("image-trigger").setAttribute("aria-controls", "image-popup-a");
  await settle();
  assert.equal(byId("popup-b-high").textContent, "High");
  assert.equal(byId("popup-high").firstChild.data, "高");
});

test("removing a popup scope restores detached labels and reinsertion translates them again", async t => {
  const { document, translator, byId } = setup(t);
  translator.start();
  const popup = byId("image-popup-a");
  const label = byId("popup-high");
  popup.remove();
  await settle();
  assert.equal(label.firstChild.data, "High");
  assert.equal(label.title, "High");
  document.body.append(popup);
  await settle();
  assert.equal(label.firstChild.data, "高");
  assert.equal(label.title, "高");
});

test("changing a popup id or role invalidates its translation scope", async t => {
  const { translator, byId } = setup(t);
  translator.start();
  const popup = byId("image-popup-a");
  const label = byId("popup-high");
  popup.id = "renamed-original-popup";
  await settle();
  assert.equal(label.firstChild.data, "High");
  popup.id = "image-popup-a";
  await settle();
  assert.equal(label.firstChild.data, "高");
  popup.setAttribute("role", "region");
  await settle();
  assert.equal(label.firstChild.data, "High");
  popup.setAttribute("role", "menu");
  await settle();
  assert.equal(label.firstChild.data, "高");
});

test("an image trigger losing its approved haspopup type immediately restores linked labels", async t => {
  const { translator, byId } = setup(t);
  translator.start();
  byId("image-trigger").setAttribute("aria-haspopup", "dialog");
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "High");
  byId("image-trigger").setAttribute("aria-haspopup", "listbox");
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "高");
});

test("a linked control moved into protected user content cannot keep its popup translated", async t => {
  const { document, translator, byId } = setup(t);
  translator.start();
  const trigger = byId("image-trigger");
  const protectedArea = document.createElement("section");
  protectedArea.setAttribute("data-user-content", "");
  document.querySelector("#image-form fieldset").append(protectedArea);
  protectedArea.append(trigger);
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("image-setting-label").firstChild.data, "High");
});

test("linked image popups preserve inputs, filenames, user content, code, model names, and numbers", t => {
  const { translator, byId } = setup(t);
  const protectedIds = ["image-prompt", "image-prompt-textarea", "image-file-name", "image-nested-file", "popup-nested-file", "popup-marked-file", "popup-data-file", "popup-user-content", "popup-editor", "popup-code", "popup-model", "popup-number", "popup-input", "popup-textarea"];
  const before = new Map(protectedIds.map(id => [id, byId(id).outerHTML]));
  translator.start();
  for (const [id, html] of before) assert.equal(byId(id).outerHTML, html, id);
});

test("a formerly safe popup becoming user content is restored and remains protected", async t => {
  const { translator, byId } = setup(t);
  translator.start();
  byId("image-popup-a").setAttribute("data-user-content", "");
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("popup-high").title, "High");
  byId("image-popup-a").removeAttribute("data-user-content");
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "高");
});

test("linked image translations restore on a route change and never activate on a sibling route", async t => {
  const { dom, translator, byId } = setup(t);
  translator.start();
  dom.window.history.pushState(null, "", "/ai/images");
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("image-setting-label").firstChild.data, "High");
  assert.equal(byId("expanded-nav-image").textContent, "图片");
  dom.window.history.pushState(null, "", "/ai/image");
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(byId("popup-high").firstChild.data, "高");
});

test("language switching and repeated refresh restore portal labels exactly", t => {
  const { document, translator, byId } = setup(t);
  const before = document.body.innerHTML;
  translator.start();
  const translated = document.body.innerHTML;
  for (let i = 0; i < 5; i++) translator.refresh();
  assert.equal(document.body.innerHTML, translated);
  translator.setEnabled(false);
  assert.equal(document.body.innerHTML, before);
  translator.setEnabled(true);
  assert.equal(document.body.innerHTML, translated);
  assert.equal(byId("unrelated-high").textContent, "High");
});

test("production video labels and only their linked dialog translate on the video route", t => {
  const { translator, byId } = setup(t, "/ai/video");
  translator.start();
  assert.equal(byId("video-trigger").firstChild.data, "码率");
  assert.equal(byId("video-trigger").getAttribute("aria-label"), "码率");
  assert.equal(byId("video-mode").textContent, "模型");
  assert.equal(byId("video-setting-high").textContent, "高");
  assert.equal(byId("video-resolution").textContent, "分辨率");
  assert.equal(byId("video-reference-help").textContent, "Image, Video or Audio");
  assert.equal(byId("video-prompt-label").textContent, "Prompt");
  assert.equal(byId("video-duration-label").textContent, "时长");
  assert.equal(byId("video-history").textContent, "历史记录");
  assert.equal(byId("video-popup-bitrate").textContent, "Bitrate", "unverified generic labels remain original");
  assert.equal(byId("video-popup-high").textContent, "高");
  assert.equal(byId("video-popup-standard").textContent, "标准");
  assert.equal(byId("video-popup-description").textContent, "压缩更多 · 文件更小");
  assert.equal(byId("video-popup-cancel").textContent, "Cancel");
  assert.equal(byId("video-popup-duration").textContent, "Duration");
  for (const id of ["video-unmarked-file", "video-generic-div", "video-generic-span"]) assert.equal(byId(id).textContent, "High", id);
  assert.equal(byId("video-prompt").value, "Generate");
  assert.equal(byId("video-prompt-textarea").value, "Create Video");
  assert.equal(byId("video-work-caption").textContent, "Resolution");
  assert.equal(byId("video-popup-model").textContent, "Example Video Model");
  assert.equal(byId("video-popup-number").textContent, "720p");
  assert.equal(byId("video-popup-work").textContent, "Duration");
  assert.equal(byId("popup-high").firstChild.data, "High");
});

test("production audio labels translate without translating scripts, filenames, user content, or model names", t => {
  const { translator, byId } = setup(t, "/audio");
  const protectedIds = ["audio-unmarked-file", "audio-model", "audio-number", "audio-file-name", "audio-work", "audio-prompt", "audio-script", "audio-editor"];
  const before = new Map(protectedIds.map(id => [id, byId(id).outerHTML]));
  translator.start();
  assert.equal(byId("audio-mode").textContent, "变声");
  assert.equal(byId("audio-generate-label").textContent, "生成");
  assert.equal(byId("audio-advanced").textContent, "高级设置");
  assert.equal(byId("audio-voice-details").textContent, "声音描述");
  assert.equal(byId("audio-optional").textContent, "可选");
  assert.equal(byId("audio-script-label").textContent, "Script");
  assert.equal(byId("audio-batch-label").textContent, "Batch size");
  assert.equal(byId("audio-speed-label").textContent, "速度");
  assert.equal(byId("audio-decrease").getAttribute("aria-label"), "减少批量数量");
  assert.equal(byId("audio-history").textContent, "历史记录");
  for (const [id, html] of before) assert.equal(byId(id).outerHTML, html, id);
  assert.equal(byId("video-mode").textContent, "Model");
  assert.equal(byId("popup-high").firstChild.data, "High");
});

test("production effects controls translate direct labels without touching numeric settings or nested filenames", t => {
  const { translator, byId } = setup(t, "/effects/use");
  translator.start();
  assert.equal(byId("effects-resolution").textContent, "分辨率");
  assert.equal(byId("effects-ratio").textContent, "画面比例");
  assert.equal(byId("effects-generate").firstChild.data, "生成");
  assert.equal(byId("effects-number").textContent, "1080p");
  assert.equal(byId("effects-ratio-number").textContent, "16:9");
  assert.equal(byId("effects-unmarked-file").textContent, "High");
});

test("linked scopes accept whitespace-separated IDs but reject unrelated and invalid-role targets", t => {
  const { translator, byId } = setup(t);
  byId("image-trigger").setAttribute("aria-controls", "  image-popup-a\timage-popup-b\ninvalid-role-popup  missing-popup  ");
  translator.start();
  assert.equal(byId("popup-high").firstChild.data, "高");
  assert.equal(byId("popup-b-high").textContent, "高");
  assert.equal(byId("invalid-role-high").textContent, "High");
  assert.equal(byId("unrelated-high").textContent, "High");
});

test("a linked image popup with an unrelated heading never translates same-name quality words", async t => {
  const { translator, byId } = setup(t);
  byId("popup-quality-title").firstChild.data = "Select aspect ratio";
  translator.start();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("popup-high").title, "High");
  byId("popup-quality-title").firstChild.data = "Select quality";
  await settle();
  assert.equal(byId("popup-quality-title").textContent, "选择质量");
  assert.equal(byId("popup-high").firstChild.data, "高");
  byId("popup-quality-title").firstChild.data = "Select aspect ratio";
  await settle();
  assert.equal(byId("popup-quality-title").textContent, "Select aspect ratio");
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(byId("popup-high").title, "High");
});

test("a protected user heading cannot authorize an image quality popup", t => {
  const { document, translator, byId } = setup(t);
  byId("popup-quality-title").remove();
  const fakeHeading = document.createElement("span");
  fakeHeading.className = "text-caption-l";
  fakeHeading.setAttribute("data-user-content", "");
  fakeHeading.textContent = "Select quality";
  byId("image-popup-a").append(fakeHeading);
  translator.start();
  assert.equal(byId("popup-high").firstChild.data, "High");
  assert.equal(fakeHeading.textContent, "Select quality");
});

test("a popup detached briefly releases translations before the page rewrites the same Chinese value", async t => {
  const { document, translator, byId } = setup(t);
  translator.start();
  const popup = byId("image-popup-a");
  const label = byId("popup-high");
  assert.equal(label.firstChild.data, "高");
  popup.remove();
  // Let the removal MutationObserver callback run, without waiting for debounce.
  await Promise.resolve();
  label.firstChild.data = "高";
  label.setAttribute("title", "高");
  label.setAttribute("aria-label", "高");
  document.body.append(popup);
  await settle();
  translator.setEnabled(false);
  assert.equal(label.firstChild.data, "高");
  assert.equal(label.title, "高");
  assert.equal(label.getAttribute("aria-label"), "高");
});

test("production layers empty-state translation preserves nested filenames and unverified actions", t => {
  const { translator, byId } = setup(t, "/layers");
  translator.start();
  assert.equal(byId("layers-upload-label").firstChild.data, "上传素材");
  assert.equal(byId("layers-file-name").textContent, "High");
  assert.equal(byId("influencer-recreate").textContent, "Recreate");
  assert.equal(byId("effects-resolution").textContent, "Resolution");
  translator.setEnabled(false);
  assert.equal(byId("layers-upload-label").firstChild.data, "Upload Media");
});

test("production influencer tabs and parameter headers translate without changing counts or content", t => {
  const { translator, byId } = setup(t, "/ai-influencer-studio");
  translator.start();
  assert.equal(byId("influencer-create-label").textContent, "创建 AI 网红");
  assert.equal(byId("influencer-motion-label").textContent, "运动");
  assert.equal(byId("influencer-gender").firstChild.data, "性别");
  assert.equal(byId("influencer-hair").firstChild.data, "发色");
  assert.equal(byId("influencer-option-count").textContent, " · 5");
  assert.equal(byId("influencer-file-name").textContent, "High");
  assert.equal(byId("influencer-work-title").textContent, "Gender");
  assert.equal(byId("influencer-prompt").value, "Create Influencer");
  assert.equal(byId("influencer-recreate").textContent, "Recreate");
  assert.equal(byId("layers-upload-label").firstChild.data, "Upload Media");
});

test("production cinema navigation labels translate while project names and search values stay original", t => {
  const { translator, byId } = setup(t, "/generate");
  translator.start();
  assert.equal(byId("cinema-home").textContent, "首页");
  assert.equal(byId("cinema-generations").textContent, "我的生成");
  assert.equal(byId("cinema-project-heading").textContent, "项目");
  assert.equal(byId("cinema-project-title").textContent, "Projects");
  assert.equal(byId("cinema-search").value, "Home");
  assert.equal(byId("cinema-search").getAttribute("placeholder"), "Search projects");
});

test("generic audio voice names and unmarked user text never inherit static label translations", t => {
  const { translator, byId } = setup(t, "/audio");
  const originalVoice = byId("audio-user-voice-name").outerHTML;
  const originalText = byId("audio-user-unmarked-text").outerHTML;
  translator.start();
  assert.equal(byId("audio-generate-label").textContent, "生成", "the known control translates as a positive check");
  assert.equal(byId("audio-user-voice-name").outerHTML, originalVoice);
  assert.equal(byId("audio-user-unmarked-text").outerHTML, originalText);
  for (let i = 0; i < 3; i++) translator.refresh();
  translator.setEnabled(false);
  translator.setEnabled(true);
  assert.equal(byId("audio-user-voice-name").textContent, "Happy");
  assert.equal(byId("audio-user-unmarked-text").textContent, "Generate");
});

test("video primary actions translate their direct labels while filenames and user-content copies stay original", async t => {
  const { dom, translator, byId } = setup(t, "/ai/video");
  const userContent = byId("video-actions-user-content").outerHTML;
  translator.start();
  assert.equal(byId("video-tab-create").textContent, "创建视频");
  assert.equal(byId("video-tab-edit").textContent, "编辑视频");
  assert.equal(byId("video-tab-motion").textContent, "运动控制");
  assert.equal(byId("video-radio-references").textContent, "参考素材");
  assert.equal(byId("video-radio-extend").textContent, "延长视频");
  assert.equal(byId("video-primary-generate").firstChild.data, "生成");
  assert.equal(byId("video-primary-file-name").textContent, "High");
  assert.equal(byId("video-actions-user-content").outerHTML, userContent);
  dom.window.history.pushState(null, "", "/audio");
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  await settle();
  assert.equal(byId("video-tab-create").textContent, "Create Video");
  assert.equal(byId("video-radio-references").textContent, "References");
  assert.equal(byId("video-primary-generate").firstChild.data, "Generate");
  assert.equal(byId("video-primary-file-name").textContent, "High");
  assert.equal(byId("video-actions-user-content").outerHTML, userContent);
});

test("image and audio accessibility rules change only approved aria labels and never upload titles or filenames", t => {
  for (const pathname of ["/ai/image", "/audio"]) {
    const { translator, byId } = setup(t, pathname);
    const uploads = new Map(["image-upload-user-name", "audio-upload-user-name"].map(id => [id, byId(id).outerHTML]));
    const approved = pathname === "/ai/image"
      ? [["image-references", "References", "参考素材"], ["image-decrement", "Decrement", "减少数量"]]
      : [["audio-decrease", "Decrease batch size", "减少批量数量"]];
    function verifyOriginalContent() {
      for (const [id, html] of uploads) assert.equal(byId(id).outerHTML, html, `${pathname}: ${id}`);
      for (const [id, english] of approved) {
        assert.equal(byId(id).title, english, `${id} title`);
        assert.equal(byId(id).textContent, english, `${id} direct text`);
      }
    }
    translator.start();
    for (const [id, , chinese] of approved) assert.equal(byId(id).getAttribute("aria-label"), chinese);
    verifyOriginalContent();
    for (let i = 0; i < 3; i++) translator.refresh();
    for (const [id, , chinese] of approved) assert.equal(byId(id).getAttribute("aria-label"), chinese);
    verifyOriginalContent();
    translator.setEnabled(false);
    for (const [id, english] of approved) assert.equal(byId(id).getAttribute("aria-label"), english);
    verifyOriginalContent();
    translator.setEnabled(true);
    for (const [id, , chinese] of approved) assert.equal(byId(id).getAttribute("aria-label"), chinese);
    verifyOriginalContent();
  }
});
