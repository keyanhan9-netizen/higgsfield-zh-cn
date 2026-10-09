/* Original UI dictionary. Brand/model names intentionally retain their spelling. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HiggsfieldZhDictionary = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const rules = [
    {
      id: 'global-navigation',
      selector: 'header nav .hfnav-item, header .hfnav-action, header a[href="/asset/all"]',
      entries: {
        'Explore': '探索', 'Image': '图片', 'Video': '视频', 'Audio': '音频',
        'New': '新', 'NEW': '新', 'top': '热门', 'Top': '热门', 'TOP': '热门',
        'AI Influencer': 'AI 网红', 'ChatGPT Plugin': 'ChatGPT 插件',
        'Ads Studio': '广告工作室', 'Effects': '特效', 'Cinema Studio': '电影工作室',
        'Contests': '创作比赛', 'Marketing Studio': '营销工作室',
        'Supercomputer': '超级计算机', 'Edit': '编辑', 'Academy': '学院',
        'Community': '社区', 'Plugins': '插件', 'Canvas': '画布',
        'Originals': '原创', 'Pricing': '价格方案', 'Enterprise': '企业服务',
        'Assets': '素材'
      }
    },
    {
      id: 'footer-links',
      selector: 'footer a[href="/creator-hub/help-center"], footer a[href="/cookie-notice"], footer a[href="/terms-of-use-agreement"], footer a[href="/privacy-policy"]',
      entries: { 'Help center': '帮助中心', 'Cookie Notice': 'Cookie 声明', 'Terms': '使用条款', 'Privacy': '隐私政策' }
    },
    {
      id: 'generation-controls',
      // Observed text containers only: never recurse through arbitrary buttons,
      // upload previews, filenames, model names or form labels.
      selector: 'main fieldset button.bg-primary > div.flex.flex-col > div:first-child, main fieldset button.text-font-brand.text-caption-l > div.flex.flex-col > span.text-caption-l > div.flex',
      ownText: true,
      paths: ['/ai/image', '/ai/video', '/generate'],
      entries: {
        'Generate': '生成', 'Generating': '正在生成', 'Generating...': '正在生成…',
        'Cancel': '取消', 'Retry': '重试', 'Auto': '自动', 'High': '高',
        'Medium': '中', 'Low': '低'
      }
    }
  ];
  return { rules };
});
