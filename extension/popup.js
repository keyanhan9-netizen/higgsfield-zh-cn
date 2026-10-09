(function () {
  'use strict';
  const checkbox = document.getElementById('enabled');
  const status = document.getElementById('status');
  function render(enabled) {
    checkbox.checked = enabled;
    status.textContent = enabled ? '已启用简体中文' : '已切换为英文原文';
  }
  chrome.storage.local.get({ enabled: true }, preferences => {
    if (chrome.runtime.lastError) { status.textContent = '设置读取失败，请重新打开扩展。'; return; }
    render(preferences.enabled !== false);
    checkbox.disabled = false;
  });
  checkbox.addEventListener('change', () => {
    const enabled = checkbox.checked;
    checkbox.disabled = true;
    chrome.storage.local.set({ enabled }, () => {
      if (chrome.runtime.lastError) {
        checkbox.checked = !enabled;
        status.textContent = '设置保存失败，请重试。';
      } else render(enabled);
      checkbox.disabled = false;
    });
  });
})();
