'use strict';
const frame = document.getElementById('fixture');
const route = document.getElementById('route');
const status = document.getElementById('status');
let controller;
const pathFor = { 'image-form':'/ai/image', 'video-create-layout':'/ai/video', 'audio-form':'/audio', 'audio-feed-view-controls-bar':'/audio', 'effects-fixture':'/effects/use', 'layers-empty-fixture':'/layers', 'influencer-fixture':'/ai-influencer-studio', 'cinema-sidebar':'/generate', 'image-popup-a':'/ai/image', 'image-popup-b':'/hidden', 'video-popup':'/ai/video' };
function report(message = '') { status.textContent = `${controller.enabled ? '中文开启' : '英文原文'} · ${route.value} · 输入值、作品名与型号保持原文${message}`; }
function displayRoute() {
  const doc = frame.contentDocument;
  for (const [id, pathname] of Object.entries(pathFor)) doc.getElementById(id).hidden = route.value !== pathname;
  doc.querySelector('main > aside').hidden = route.value !== '/audio';
  controller.refresh(); report();
}
function initialize() {
  if (controller || !frame.contentDocument?.getElementById('image-form')) return;
  const doc = frame.contentDocument;
  const style = doc.createElement('style');
  style.textContent = 'body{font:15px/1.7 system-ui,sans-serif;color:#254437;padding:20px}header{padding-bottom:14px;border-bottom:1px solid #d3e0da}header p{display:inline-block;margin:8px 14px 8px 0}a{color:#20654b}form,section,[role=listbox],[role=dialog]{padding:15px;margin:16px 0;border:1px solid #c4d7cd;border-radius:10px}button,input,textarea{font:inherit;padding:7px;margin:4px;border:1px solid #b7ccc1;border-radius:6px;background:white}input,textarea{background:#fff3c5}button div,button span{display:inline-block}button span+span{margin-left:8px}[data-user-content]{background:#eaf2ee;padding:6px}#unrelated-header-panel,#unrelated-settings,#invalid-role-popup{display:none}header button:empty:after{content:attr(aria-label)}span.text-caption-l{margin-right:12px}span.text-caption-s{display:block;color:#507061}[hidden]{display:none!important}';
  doc.head.append(style);
  controller = HiggsfieldZhEngine.createTranslator({document:doc,rules:HiggsfieldZhDictionary.rules,getPathname:()=>route.value});
  controller.start(); displayRoute();
}
frame.addEventListener('load',initialize); initialize();
document.getElementById('chinese').addEventListener('click',()=>{controller.setEnabled(true);report();});
document.getElementById('english').addEventListener('click',()=>{controller.setEnabled(false);report();});
document.getElementById('refresh').addEventListener('click',()=>{for(let i=0;i<5;i++)controller.refresh();report(' · 已重复执行 5 次');});
document.getElementById('insert').addEventListener('click',()=>{const span=frame.contentDocument.createElement('span');span.className='text-caption-s';span.textContent='Balanced visuals';frame.contentDocument.getElementById('image-popup-a').append(span);report(' · 已插入动态说明');});
route.addEventListener('change',displayRoute);
