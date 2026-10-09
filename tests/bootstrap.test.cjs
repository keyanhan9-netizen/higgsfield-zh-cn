"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { JSDOM } = require("jsdom");
const { isSupportedLocation } = require("../extension/engine.js");

const contentSource = fs.readFileSync(path.join(__dirname, "../extension/content.js"), "utf8");
const popupSource = fs.readFileSync(path.join(__dirname, "../extension/popup.js"), "utf8");
const popupHtml = fs.readFileSync(path.join(__dirname, "../extension/popup.html"), "utf8");

function contentHarness(url = "https://higgsfield.ai/ai/image") {
  const calls = [];
  const getCallbacks = [];
  const storageListeners = [];
  let creations = 0;
  const chrome = {
    runtime: { lastError: undefined },
    storage: {
      local: { get(defaults, callback) { assert.equal(defaults.enabled, true); getCallbacks.push(callback); } },
      onChanged: { addListener(callback) { storageListeners.push(callback); } }
    }
  };
  const controller = {
    setEnabled(value) { calls.push(`set:${value}`); },
    start() { calls.push("start"); }
  };
  const context = vm.createContext({
    chrome,
    window: { location: new URL(url) },
    document: {},
    HiggsfieldZhEngine: {
      isSupportedLocation,
      createTranslator() { creations++; return controller; }
    },
    HiggsfieldZhDictionary: { rules: [] }
  });
  return {
    calls, getCallbacks, storageListeners, chrome,
    run() { vm.runInContext(contentSource, context); },
    get creations() { return creations; }
  };
}

test("content bootstrap runs once even when the script is injected twice", () => {
  const harness = contentHarness();
  harness.run();
  harness.run();
  assert.equal(harness.creations, 1);
  assert.equal(harness.getCallbacks.length, 1);
  assert.equal(harness.storageListeners.length, 1);
  harness.getCallbacks[0]({ enabled: true });
  assert.deepEqual(harness.calls, ["set:true", "start"]);
});

test("content bootstrap rejects an unrelated domain without reading storage", () => {
  const harness = contentHarness("https://example.com/");
  harness.run();
  assert.equal(harness.creations, 0);
  assert.equal(harness.getCallbacks.length, 0);
  assert.equal(harness.storageListeners.length, 0);
});

test("content bootstrap follows local storage changes from another tab only", () => {
  const harness = contentHarness();
  harness.run();
  harness.getCallbacks[0]({ enabled: true });
  harness.storageListeners[0]({ enabled: { newValue: false } }, "local");
  harness.storageListeners[0]({ enabled: { newValue: true } }, "local");
  harness.storageListeners[0]({ enabled: { newValue: false } }, "sync");
  harness.storageListeners[0]({ unrelated: { newValue: false } }, "local");
  assert.deepEqual(harness.calls, ["set:true", "start", "set:false", "set:true"]);
});

test("an early storage change wins over a stale initial get callback", () => {
  const harness = contentHarness();
  harness.run();
  harness.storageListeners[0]({ enabled: { newValue: false } }, "local");
  harness.getCallbacks[0]({ enabled: true });
  assert.deepEqual(harness.calls, ["set:false", "start"]);
});

test("a failed initial content storage read starts in English safely", () => {
  const harness = contentHarness();
  harness.run();
  harness.chrome.runtime.lastError = { message: "Synthetic storage read failure" };
  harness.getCallbacks[0](undefined);
  assert.deepEqual(harness.calls, ["set:false", "start"]);
});

function popupHarness(t) {
  const dom = new JSDOM(popupHtml, { url: "https://extension-fixture.invalid/popup.html", runScripts: "outside-only" });
  t.after(() => dom.window.close());
  const getCallbacks = [];
  const setCalls = [];
  const chrome = {
    runtime: { lastError: undefined },
    storage: { local: {
      get(defaults, callback) { assert.equal(defaults.enabled, true); getCallbacks.push(callback); },
      set(values, callback) { setCalls.push({ enabled: values.enabled, callback }); }
    } }
  };
  dom.window.chrome = chrome;
  dom.window.eval(popupSource);
  return {
    dom, chrome, getCallbacks, setCalls,
    checkbox: dom.window.document.getElementById("enabled"),
    status: dom.window.document.getElementById("status"),
    change(enabled) {
      const checkbox = dom.window.document.getElementById("enabled");
      checkbox.checked = enabled;
      checkbox.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    }
  };
}

test("popup loads the setting and persists a successful language switch", t => {
  const harness = popupHarness(t);
  assert.equal(harness.checkbox.disabled, true);
  harness.getCallbacks[0]({ enabled: true });
  assert.equal(harness.checkbox.checked, true);
  assert.equal(harness.checkbox.disabled, false);
  assert.equal(harness.status.textContent, "已启用简体中文");
  harness.change(false);
  assert.equal(harness.checkbox.disabled, true);
  assert.equal(harness.setCalls[0].enabled, false);
  harness.setCalls[0].callback();
  assert.equal(harness.checkbox.disabled, false);
  assert.equal(harness.status.textContent, "已切换为英文原文");
});

test("popup storage read failure leaves the switch disabled with a readable error", t => {
  const harness = popupHarness(t);
  harness.chrome.runtime.lastError = { message: "Synthetic storage read failure" };
  harness.getCallbacks[0](undefined);
  assert.equal(harness.checkbox.disabled, true);
  assert.match(harness.status.textContent, /读取失败/);
});

test("popup restores its previous setting after a save failure and permits a retry", t => {
  const harness = popupHarness(t);
  harness.getCallbacks[0]({ enabled: true });
  harness.change(false);
  harness.chrome.runtime.lastError = { message: "Synthetic storage write failure" };
  harness.setCalls[0].callback();
  assert.equal(harness.checkbox.checked, true);
  assert.equal(harness.checkbox.disabled, false);
  assert.match(harness.status.textContent, /保存失败/);
  harness.chrome.runtime.lastError = undefined;
  harness.change(false);
  harness.setCalls[1].callback();
  assert.equal(harness.checkbox.checked, false);
  assert.equal(harness.status.textContent, "已切换为英文原文");
});
