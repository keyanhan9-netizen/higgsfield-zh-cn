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
    'data-prompt', 'data-testid', 'data-file-name', 'data-filename', 'aria-controls', 'aria-haspopup', 'id'
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
    let linkedScopes = new Map();

    function blocked(element) {
      return !element || Boolean(element.closest(PROTECTED));
    }

    function ruleFor(element) {
      if (blocked(element)) return undefined;
      return activeRules.find(rule => {
        if (rule.linkedFrom && !linkedScopes.get(rule)?.some(scope => scope.contains(element))) return false;
        return rule.ownText ? element.matches(rule.selector) : element.closest(rule.selector);
      });
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
        if (restoreAll || !node.isConnected || !rule || rule.text === false || translatedValue(record.original, rule) !== record.translated) restoreText(node, record);
        else if (node.data !== record.translated) texts.delete(node);
      }
      for (const [element, map] of attributes) {
        for (const [name, record] of map) {
          const rule = ruleFor(element);
          if (restoreAll || !element.isConnected || !rule || !(rule.attributes || ATTRIBUTES).includes(name) || translatedValue(record.original, rule) !== record.translated) restoreAttribute(element, name, record, map);
          else if (element.getAttribute(name) !== record.translated) map.delete(name);
        }
        if (!map.size) attributes.delete(element);
      }
    }

    function translateElement(element, seen) {
      if (blocked(element)) return;
      const rule = ruleFor(element);
      if (!rule) return;
      for (const name of rule.attributes || ATTRIBUTES) {
        if (!ATTRIBUTES.includes(name)) continue;
        const current = element.getAttribute(name);
        if (current === null || attributes.get(element)?.has(name)) continue;
        const translated = translatedValue(current, rule);
        if (translated !== undefined && translated !== current) {
          if (!attributes.has(element)) attributes.set(element, new Map());
          attributes.get(element).set(name, { original: current, translated });
          element.setAttribute(name, translated);
        }
      }
      if (rule.text === false) return;
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
      // Once removal has been delivered, this document observer cannot see
      // later writes to detached nodes. Release originals before that gap.
      if (mutations.some(mutation => mutation.type === 'childList' && mutation.removedNodes.length)) {
        for (const [node, record] of texts) if (!node.isConnected) restoreText(node, record);
        for (const [element, map] of attributes) {
          if (element.isConnected) continue;
          for (const [name, record] of map) restoreAttribute(element, name, record, map);
          attributes.delete(element);
        }
      }
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
      // Portals are reached only through known UI controls. Their IDs are never
      // assumed, and unrelated dialogs/menu items remain outside the rule.
      linkedScopes = new Map();
      for (const rule of activeRules) {
        if (!rule.linkedFrom) continue;
        const scopes = [];
        for (const control of document.querySelectorAll(rule.linkedFrom)) {
          if (blocked(control)) continue;
          for (const id of (control.getAttribute('aria-controls') || '').split(/\s+/).filter(Boolean)) {
            const scope = document.getElementById(id);
            if (!scope || !scope.matches('[role="dialog"], [role="listbox"], [role="menu"]')) continue;
            if (rule.scopeHeading && !Array.from(scope.querySelectorAll(rule.scopeHeading.selector)).some(heading => {
              if (blocked(heading)) return false;
              const text = Array.from(heading.childNodes).filter(node => node.nodeType === 3).map(node => node.data).join('').trim();
              return rule.scopeHeading.values.includes(text);
            })) continue;
            scopes.push(scope);
          }
        }
        linkedScopes.set(rule, scopes);
      }
      reconcile(!enabled);
      if (enabled) {
        const seen = new Set();
        for (const rule of activeRules) {
          const scopes = rule.linkedFrom ? linkedScopes.get(rule) : [document];
          for (const scope of scopes) {
            for (const element of scope.querySelectorAll(rule.selector)) translateElement(element, seen);
          }
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
