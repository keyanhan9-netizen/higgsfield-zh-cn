(function () {
  'use strict';
  const KEY = '__higgsfieldZhController';
  if (!HiggsfieldZhEngine.isSupportedLocation(window.location) || globalThis[KEY]) return;
  const controller = HiggsfieldZhEngine.createTranslator({
    document, rules: HiggsfieldZhDictionary.rules
  });
  globalThis[KEY] = controller;
  let changedDuringLoad = false;
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && Object.prototype.hasOwnProperty.call(changes, 'enabled')) {
      changedDuringLoad = true;
      controller.setEnabled(changes.enabled.newValue !== false);
    }
  });
  chrome.storage.local.get({ enabled: true }, preferences => {
    // Consume any API error without printing page data. Keep conservative default.
    const failed = Boolean(chrome.runtime.lastError);
    if (!changedDuringLoad) controller.setEnabled(!failed && preferences.enabled !== false);
    controller.start();
  });
})();
