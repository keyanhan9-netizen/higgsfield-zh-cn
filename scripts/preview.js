'use strict';
const frame = document.getElementById('fixture');
const status = document.getElementById('status');
let controller;
let pathname = '/ai/image';
function report(extra = '') {
  status.textContent = `${controller.enabled ? '中文开启' : '英文原文'} · 模拟路由 ${pathname}${extra}`;
}
function initialize() {
  if (controller || !frame.contentDocument?.getElementById('generation-controls')) return;
  const document = frame.contentDocument;
  const style = document.createElement('style');
  style.textContent = 'body{font:14px/1.8 system-ui,sans-serif;color:#253f35;padding:20px}nav{display:flex;gap:20px;margin-bottom:20px}a{color:#19684c}fieldset{border:1px solid #c5d7ce;border-radius:8px;padding:20px}button,input,textarea,select{font:inherit;border:1px solid #c5d7ce;border-radius:4px;margin:3px;padding:5px}input,textarea{background:#fff7db}pre,code{background:#f1f4f2}[data-user-content]{background:#eef4f1;padding:8px;margin:8px 0}';
  document.head.append(style);
  controller = HiggsfieldZhEngine.createTranslator({ document, rules:HiggsfieldZhDictionary.rules, getPathname:()=>pathname });
  controller.start();
  report(' · 黄色输入框保持英文');
}
frame.addEventListener('load', initialize);
initialize();
document.getElementById('chinese').addEventListener('click', () => { controller.setEnabled(true); report(); });
document.getElementById('english').addEventListener('click', () => { controller.setEnabled(false); report(); });
document.getElementById('insert').addEventListener('click', () => {
  const doc = frame.contentDocument;
  const button = doc.createElement('button');
  button.className = 'bg-primary';
  const wrapper = doc.createElement('div');
  wrapper.className = 'flex flex-col';
  const label = doc.createElement('div');
  label.textContent = 'Generate';
  wrapper.append(label);
  button.append(wrapper);
  doc.getElementById('generation-controls').prepend(button);
  report(' · 已动态插入 Generate 控件');
});
document.getElementById('route').addEventListener('click', () => {
  pathname = pathname === '/ai/image' ? '/community' : '/ai/image';
  controller.refresh();
  report();
});
