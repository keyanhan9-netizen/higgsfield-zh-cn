/* Exact, scoped and reversible DOM localization. No page HTML or form values are read. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HiggsfieldZhEngine = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const PROTECTED = [
    'input', 'textarea', 'select', 'option', 'pre', 'code', 'script', 'style',
    'noscript', 'svg', 'math', 'iframe', '[contenteditable]:not([contenteditable="false"])',
    '.uploaded-file-name', '[data-file-name]', '[data-filename]',
    '[role="textbox"]', '[translate="no"]', '.notranslate', '[data-hf-zh-ignore]',
    '[data-user-content]', '[data-feed-item]', '[data-feed-hover-selection]',
    '[data-prompt]', '[data-testid*="prompt" i]', '[data-testid*="user-content" i]',
    '[data-testid*="editor" i]', '[data-testid*="code" i]',
    '[data-testid*="payment" i]', '[data-testid*="billing" i]',
    '.ProseMirror', '.tiptap', '.monaco-editor', '.cm-editor',
    'a[href*="/@"]', 'a[href*="/projects/"]'
  ].join(',');
  const ATTRIBUTES = ['title', 'aria-label'];
  const OBSERVED = [
    ...ATTRIBUTES, 'class', 'role', 'href', 'contenteditable', 'translate',
    'data-hf-zh-ignore', 'data-user-content', 'data-feed-item', 'data-feed-hover-selection',
    'data-prompt', 'data-testid', 'data-file-name', 'data-filename'
  ];

  function isSupportedLocation(location) {
    return location.protocol === 'https:' && ['higgsfield.ai', 'www.higgsfield.ai'].includes(location.hostname);
  }

  function createTranslator({ document, rules, getPathname = () => document.location.pathname }) {
    const window = document.defaultView;
    const texts = new Map();
    const attributes = new Map();
    let enabled = true;
    let running = false;
    let observer;
    let pending;
    let routeTimer;
    let pathname = getPathname();
    let activeRules = [];

    function blocked(element) {
      return !element || Boolean(element.closest(PROTECTED));
    }

    function ruleFor(element) {
      if (blocked(element)) return undefined;
      return activeRules.find(rule => rule.ownText ? element.matches(rule.selector) : element.closest(rule.selector));
    }

    function translatedValue(value, rule) {
      // No substring/fuzzy replacements: cost numbers, names and prompts stay untouched.
      const trimmed = value.trim();
      if (!Object.prototype.hasOwnProperty.call(rule.entries, trimmed)) return undefined;
      return value.slice(0, value.indexOf(trimmed)) + rule.entries[trimmed] + value.slice(value.indexOf(trimmed) + trimmed.length);
    }

    function restoreText(node, record) {
      if (node.data === record.translated) node.data = record.original;
      texts.delete(node);
    }

    function restoreAttribute(element, name, record, map) {
      if (element.getAttribute(name) === record.translated) element.setAttribute(name, record.original);
      map.delete(name);
    }

    function reconcile(restoreAll = false) {
      for (const [node, record] of texts) {
        const rule = ruleFor(node.parentElement);
        if (restoreAll || !node.isConnected || !rule || translatedValue(record.original, rule) !== record.translated) restoreText(node, record);
        else if (node.data !== record.translated) texts.delete(node);
      }
      for (const [element, map] of attributes) {
        for (const [name, record] of map) {
          const rule = ruleFor(element);
          if (restoreAll || !element.isConnected || !rule || translatedValue(record.original, rule) !== record.translated) restoreAttribute(element, name, record, map);
          else if (element.getAttribute(name) !== record.translated) map.delete(name);
        }
        if (!map.size) attributes.delete(element);
      }
    }

    function translateElement(element, seen) {
      if (blocked(element)) return;
      const rule = ruleFor(element);
      if (!rule) return;
      for (const name of ATTRIBUTES) {
        const current = element.getAttribute(name);
        if (current === null || attributes.get(element)?.has(name)) continue;
        const translated = translatedValue(current, rule);
        if (translated !== undefined && translated !== current) {
          if (!attributes.has(element)) attributes.set(element, new Map());
          attributes.get(element).set(name, { original: current, translated });
          element.setAttribute(name, translated);
        }
      }
      for (const child of element.childNodes) {
        if (child.nodeType === 1 && !rule.ownText) translateElement(child, seen);
        else if (child.nodeType === 3 && !seen.has(child)) {
          seen.add(child);
          if (texts.has(child)) continue;
          const original = child.data;
          const translated = translatedValue(original, rule);
          if (translated !== undefined && translated !== original) {
            texts.set(child, { original, translated });
            child.data = translated;
          }
        }
      }
    }

    function invalidateExternalWrites(mutations) {
      // Our writes happen while disconnected. A page write owns its new value,
      // even if the value happens to equal our previous Chinese translation.
      for (const mutation of mutations) {
        if (mutation.type === 'characterData') texts.delete(mutation.target);
        else if (mutation.type === 'attributes') {
          const map = attributes.get(mutation.target);
          map?.delete(mutation.attributeName);
          if (map && !map.size) attributes.delete(mutation.target);
        }
      }
    }

    function schedule(mutations) {
      invalidateExternalWrites(mutations);
      if (!running || pending !== undefined) return;
      pending = window.setTimeout(() => { pending = undefined; refresh(); }, 40);
    }

    function refresh() {
      if (observer) {
        invalidateExternalWrites(observer.takeRecords());
        observer.disconnect();
      }
      // A pathname change can remove a control from a previously valid UI scope.
      pathname = getPathname();
      activeRules = rules.filter(rule => !rule.paths || rule.paths.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/')));
      reconcile(!enabled);
      if (enabled) {
        const seen = new Set();
        for (const rule of activeRules) {
          for (const element of document.querySelectorAll(rule.selector)) translateElement(element, seen);
        }
      }
      if (running) observer.observe(document.documentElement, {
        subtree: true, childList: true, characterData: true,
        attributes: true, attributeFilter: OBSERVED
      });
    }

    function setEnabled(value) {
      enabled = value === true;
      refresh();
    }

    function routeChanged() {
      if (getPathname() !== pathname) refresh();
    }

    function start() {
      if (running) return;
      running = true;
      observer = new window.MutationObserver(schedule);
      window.addEventListener('popstate', routeChanged);
      window.addEventListener('hashchange', routeChanged);
      // pushState/replaceState do not fire popstate; inspect pathname only.
      // No history patching, page state access or URL transmission.
      routeTimer = window.setInterval(routeChanged, 500);
      refresh();
    }

    function destroy() {
      running = false;
      if (observer) invalidateExternalWrites(observer.takeRecords());
      observer?.disconnect();
      window.clearTimeout(pending);
      pending = undefined;
      window.clearInterval(routeTimer);
      window.removeEventListener('popstate', routeChanged);
      window.removeEventListener('hashchange', routeChanged);
      reconcile(true);
    }

    return { start, setEnabled, refresh, destroy, get enabled() { return enabled; } };
  }
  return { createTranslator, isSupportedLocation };
});
