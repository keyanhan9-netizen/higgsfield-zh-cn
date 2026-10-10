/* Original UI dictionary. Brand/model names intentionally retain their spelling. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.HiggsfieldZhDictionary = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const controls = {
    'Generate': '生成', 'Generating': '正在生成', 'Generating...': '正在生成…',
    'Cancel': '取消', 'Retry': '重试', 'Auto': '自动', 'High': '高', 'Medium': '中', 'Low': '低'
  };
  const menu = {
    'Features': '功能', 'Models': '模型', 'New': '新', 'NEW': '新', 'top': '热门', 'TOP': '热门',
    'Create Image': '创建图片', 'Generate AI images': '生成 AI 图片',
    'Cinematic Cameras': '电影摄影机', 'Image generation with camera controls': '使用摄影机参数生成图片',
    'Canvas': '画布', 'Visual ideation meets repeatable AI workflows.': '将视觉构思转化为可重复使用的 AI 工作流。',
    'Soul Moodboard': 'Soul 灵感板', 'Turn your references into a focused moodboard': '将参考素材整理成主题灵感板',
    'Soul ID Character': 'Soul ID 角色', 'Create unique character': '创建独特角色',
    'AI Influencer': 'AI 网红', 'Create and manage your AI influencer': '创建和管理你的 AI 网红',
    'Photodump': '照片集', 'Generate Your Aesthetic': '生成你的专属风格',
    'Relight': '重新打光', 'Adjust lighting position, color, and brightness': '调整灯光位置、颜色和亮度',
    'Inpaint': '局部重绘', 'Select an area, describe the change': '选择区域并描述要修改的内容',
    'Image Upscale': '图片放大', 'Enhance image quality': '提升图片画质',
    'Face Swap': '换脸', 'Create Realistic Face Swaps': '生成逼真的换脸效果',
    'Character Swap': '角色替换', 'Create Realistic Character Swaps': '生成逼真的角色替换效果',
    'Next generation ultra-realistic fashion visuals': '新一代超写实时尚视觉',
    'Cinematic Film-Grade Aesthetic': '电影级视觉质感', 'Exceptional quality, precise edits': '出色画质与精准编辑',
    'Stunning everyday images, fast': '快速生成出色的日常图片',
    "Google's next-gen flagship image model": 'Google 新一代旗舰图片模型',
    'Logically consistent images with intelligent visual reasoning': '通过智能视觉推理生成逻辑一致的图片',
    'Best 4K image model ever': '出色的 4K 图片模型',
    'Next-gen image generation and editing by Black Forest Labs': 'Black Forest Labs 的新一代图片生成与编辑',
    'Photorealistic and expressive image generation': '生成写实且富有表现力的图片',
    'High-resolution image generation by xAI': 'xAI 高分辨率图片生成',
    'Speed-optimized detail': '兼顾速度与细节', 'Instant lifelike portraits': '快速生成逼真人像',
    'High-resolution upscaler': '高分辨率画质提升',
    'Create Video': '创建视频', 'Generate AI videos': '生成 AI 视频',
    'Cinema Studio': '电影工作室', 'Cinematic video with AI director': '使用 AI 导演制作电影感视频',
    'Faceless Studio': '无露脸工作室', 'Start a faceless channel in one click': '一键创建无露脸频道',
    'Create 3D scenes and turn them into videos': '创建 3D 场景并转化为视频',
    'Shorts Studio': '短视频工作室', 'Turn your footage into ready-made shorts': '将素材制作成可发布的短视频',
    'Higgsfield Explainer': 'Higgsfield 解说视频', 'Turn any topic into an explainer video': '将主题转化为解说视频',
    'Mixed Media': '混合媒介', 'Create mixed media projects': '创建混合媒介项目',
    'Edit Video': '编辑视频', 'Edit scenes, shots, elements': '编辑场景、镜头和元素',
    'Higgsfield Reframe': 'Higgsfield 重构画面', 'Reframe and resize videos to any aspect ratio': '重新构图并调整视频画面比例',
    'Click to Ad': '一键广告', 'Turn product URLs into video ads': '将商品链接转化为视频广告',
    'Change Color Palette': '调整配色', 'Adjust color palette, tones, and overall mood': '调整配色、色调和整体氛围',
    'Lipsync Studio': '口型同步工作室', 'Create Talking Clips': '创建人物说话片段',
    'Draw to Video': '绘图转视频', 'Sketch turns into a cinema': '将草图转化为电影画面',
    'Draw to Edit': '绘图编辑', 'Sketch directly on video frames to guide edits': '直接在视频帧上绘图以引导编辑',
    'Video Upscale': '视频放大', 'Enhance video quality': '提升视频画质',
    'Create cinematic videos up to 30 seconds': '制作最长 30 秒的电影感视频',
    'Transfer motion or swap objects from a reference video': '从参考视频迁移运动或替换物体',
    'Generate and edit video from any input': '使用多种输入生成和编辑视频',
    'Cinematic videos with audio': '生成带音频的电影感视频',
    'Transfer motion from video to image': '将视频运动迁移到图片',
    'Text, image, and video generation with synchronized audio': '通过文字、图片和视频生成同步音频的视频',
    'Create 2K videos from text, keyframes, or multimodal references': '通过文字、关键帧或多模态参考生成 2K 视频',
    'Create videos from text, keyframes, or multimodal references': '通过文字、关键帧或多模态参考生成视频',
    'Fast, affordable videos from text or an image': '使用文字或图片快速、低成本生成视频',
    'Cinematic videos with synchronized audio': '生成带同步音频的电影感视频',
    'Edit videos with text prompts': '使用文字提示词编辑视频', 'Advanced AI video with sound': '生成带声音的高级 AI 视频',
    "Alibaba's #1 ranked video and audio model": '阿里巴巴领先的视频与音频模型',
    'Fastest high-dynamic video': '快速生成高动态视频', 'VFX and camera control': '视觉特效与摄影机控制',
    'Text to Speech': '文字转语音', 'Generate speech from text': '将文字生成为语音',
    'Voice Change': '变声', 'Swap voices in any video': '替换视频中的声音',
    'Translate': '翻译', 'Translate and lip-sync your video into a new language': '翻译视频语言并同步口型',
    'Multi-speaker scenes with speech and ambience': '生成带语音和环境声的多人场景',
    'Expressive narration with stability and similarity controls': '可控制稳定性和相似度的生动旁白',
    'Fast expressive speech with stability and similarity controls': '快速生成可控制稳定性和相似度的生动语音',
    'Emotion and delivery control via inline tags': '通过行内标签控制情绪和表达',
    'Natural speech with voice, style, and emotion control': '可控制声音、风格和情绪的自然语音',
    'High-fidelity single-voice narration': '高保真单人旁白',
    'Multilingual speech across 30+ languages': '支持 30 多种语言的多语种语音'
  };
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
        'Assets': '素材', 'Search Higgsfield': '搜索 Higgsfield', 'Account menu': '账户菜单'
      }
    },
    {
      id: 'navigation-menus',
      selector: 'header [id$="-content-Create Image Tab"] p, header [id$="-content-Create Video Tab"] p, header [id$="-content-Audio Tab"] p',
      ownText: true,
      entries: menu
    },
    {
      id: 'header-accessibility',
      selector: 'header button[aria-label="Search Higgsfield"], header button[aria-label="搜索 Higgsfield"], header button[aria-label="Account menu"], header button[aria-label="账户菜单"]',
      ownText: true,
      entries: { 'Search Higgsfield': '搜索 Higgsfield', 'Account menu': '账户菜单' }
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
      entries: controls
    },
    {
      id: 'image-form-labels',
      paths: ['/ai/image'], ownText: true,
      selector: '#image-form [id="hf:image-form-submit"] > div.flex.flex-col > div:first-child, #image-form fieldset button.text-font-brand > div.flex.flex-col > span.text-caption-l > div.flex.items-center',
      entries: { 'Generate': '生成', 'Generating': '正在生成', 'Generating...': '正在生成…', 'Cancel': '取消', 'Retry': '重试', 'Auto': '自动', 'High': '高', 'Medium': '中', 'Low': '低' }
    },
    {
      id: 'image-accessibility', paths: ['/ai/image'], ownText: true, text: false, attributes: ['aria-label'],
      selector: '#image-form button[aria-label="References"], #image-form button[aria-label="参考素材"], #image-form button[aria-label="Elements"], #image-form button[aria-label="元素"], #image-form button[aria-label="Decrement"], #image-form button[aria-label="减少数量"], #image-form button[aria-label="Increment"], #image-form button[aria-label="增加数量"], #image-form button[aria-label="Scroll settings left"], #image-form button[aria-label="向左滚动设置"], #image-form button[aria-label="Scroll settings right"], #image-form button[aria-label="向右滚动设置"]',
      entries: { 'References': '参考素材', 'Elements': '元素', 'Decrement': '减少数量', 'Increment': '增加数量', 'Scroll settings left': '向左滚动设置', 'Scroll settings right': '向右滚动设置' }
    },
    {
      id: 'image-settings-popup',
      paths: ['/ai/image'], ownText: true,
      linkedFrom: '#image-form fieldset button.text-font-brand[aria-controls][aria-haspopup="listbox"]',
      scopeHeading: { selector: 'span.text-caption-l', values: ['Select quality', '选择质量'] },
      selector: 'span.text-caption-l, span.text-caption-s, div.flex.items-center.gap-1',
      entries: { 'High': '高', 'Medium': '中', 'Low': '低', 'Select quality': '选择质量', 'Fastest and cheapest': '最快且成本最低', 'Balanced visuals': '均衡画质', 'Best visual fidelity': '最佳画面保真度' }
    },
    {
      id: 'video-form-labels',
      paths: ['/ai/video'], ownText: true,
      selector: '#video-create-layout > div:first-child fieldset button[aria-controls], #video-create-layout > div:first-child fieldset button[aria-controls] span.text-sm-medium, #video-create-layout > div:first-child fieldset button[aria-controls] span.text-caption-l, #video-create-layout > div:first-child button span.text-q-caption-sm-medium, #video-create-layout > div:first-child label span.text-caption-m, #video-create-layout .q-tabs-tab-label',
      entries: { 'Duration': '时长', 'Ratio': '画面比例', 'Resolution': '分辨率', 'Bitrate': '码率', 'High': '高', 'Model': '模型', 'On': '开启', 'Off': '关闭', 'History': '历史记录', 'How it works': '使用说明' }
    },
    {
      id: 'video-settings-popup',
      paths: ['/ai/video'], ownText: true,
      linkedFrom: '#video-create-layout fieldset button[aria-controls][aria-label="Bitrate"], #video-create-layout fieldset button[aria-controls][aria-label="码率"]',
      selector: 'button > div > span.truncate.text-sm-medium, button > div > span.text-caption-m, span.truncate.text-sm-medium, span.text-caption-m',
      entries: { 'High': '高', 'Standard': '标准', 'Less compression · larger size': '压缩更少 · 文件更大', 'More compression · smaller size': '压缩更多 · 文件更小' }
    },
    {
      id: 'video-primary-actions', paths: ['/ai/video'], ownText: true,
      selector: '#video-create-layout > div:first-child button.bg-primary.text-btn-accent-text, #video-create-layout > div:first-child nav > div.interactive-tap.text-caption-l, #video-create-layout > div:first-child div.grid-cols-2.mb-4 > button[role="radio"]',
      entries: { 'Generate': '生成', 'Generating': '正在生成', 'Generating...': '正在生成…', 'Create Video': '创建视频', 'Edit Video': '编辑视频', 'Motion Control': '运动控制', 'References': '参考素材', 'Extend Video': '延长视频' }
    },
    {
      id: 'audio-form-labels',
      paths: ['/audio'], ownText: true,
      selector: 'main aside form .sticky.bottom-0 > button > span.text-lg.font-semibold, main aside form button span.text-xs-medium.text-qc-text-secondary, main aside form button > span.min-w-0.flex-1.truncate.text-left, main aside form button > span.truncate.text-xs.font-medium.leading-4.text-font-secondary, main aside form span.pointer-events-none.text-xxs-medium, main aside form label.text-sm-medium.text-font-secondary, main aside > div > div:first-child button.interactive-tap, #audio-feed-view-controls-bar button, #audio-feed-view-controls-bar button > span.px-1',
      entries: { 'Generate': '生成', 'Generating': '正在生成', 'Generating...': '正在生成…', 'Model': '模型', 'Text to Speech': '文字转语音', 'Voice Change': '变声', 'Translate': '翻译', 'Optional': '可选', 'Voice details': '声音描述', 'Advanced settings': '高级设置', 'Speed': '速度', 'Pitch': '音高', 'Volume': '音量', 'Decrease batch size': '减少批量数量', 'Increase batch size': '增加批量数量', 'History': '历史记录', 'How it works': '使用说明', 'Filters': '筛选' }
    },
    {
      id: 'audio-accessibility', paths: ['/audio'], ownText: true, text: false, attributes: ['aria-label'],
      selector: 'main aside form button[aria-label="Decrease batch size"], main aside form button[aria-label="减少批量数量"], main aside form button[aria-label="Increase batch size"], main aside form button[aria-label="增加批量数量"]',
      entries: { 'Decrease batch size': '减少批量数量', 'Increase batch size': '增加批量数量' }
    },
    {
      id: 'cinema-navigation', paths: ['/generate'], ownText: true,
      selector: 'main [class~="group/sidebar"] button[class~="group/top-action"] > span.truncate.text-sm-medium, main [class~="group/sidebar"] #folder-sidebar-button-higgscord > span.truncate, main [class~="group/sidebar"] p.text-q-caption-sm-medium.text-q-text-secondary, main [class~="group/sidebar"] button.size-6.text-q-text-secondary, main [class~="group/sidebar"] button.size-6.q-dropdown-trigger, main [class~="group/sidebar"] .sticky button.size-7.text-qc-text-secondary',
      entries: { 'Home': '首页', 'My generations': '我的生成', 'My elements': '我的元素', 'My favorites': '我的收藏', 'Community': '社区', 'Academy': '学院', 'New project': '新建项目', 'Projects': '项目', 'Search projects': '搜索项目', 'Sort projects': '项目排序', 'Collapse sidebar': '收起侧栏' }
    },
    {
      id: 'effects-controls', paths: ['/effects/use'], ownText: true,
      selector: 'main button.q-dropdown-trigger > span.flex.flex-col > span.text-q-caption-sm-medium, main button.q-button-marketing-primary, main [role="tablist"] > button.q-tabs-tab > span.q-tabs-tab-label',
      entries: { 'Resolution': '分辨率', 'Aspect Ratio': '画面比例', 'Generate': '生成', 'History': '历史记录', 'How it works': '使用说明' }
    },
    {
      id: 'layers-empty-state', paths: ['/layers'], ownText: true,
      selector: 'main button.q-button-marketing-primary > span.q-button-label-frame',
      entries: { 'Upload Media': '上传素材' }
    },
    {
      id: 'influencer-controls', paths: ['/ai-influencer-studio'], ownText: true,
      selector: 'main .ai-influencer-builder-mode-tabs button[role="tab"] > span.q-tabs-tab-content, main button.q-accordion-trigger > span.q-accordion-trigger-label',
      entries: { 'Create Influencer': '创建 AI 网红', 'Motion': '运动', 'Character type': '角色类型', 'Gender': '性别', 'Build': '体型', 'Hairstyle': '发型', 'Hair Color': '发色', 'Style': '风格', 'Ethnicity': '族裔', 'Age': '年龄', 'Skin color': '肤色', 'Height': '身高', 'Proportions': '比例', 'Head shape': '头型', 'Neck': '颈部', 'Eye shape': '眼型', 'Eye color': '眼睛颜色', 'Features': '五官', 'Facial hair': '面部毛发', 'Distinctive features': '显著特征', 'Accessories': '配饰' }
    }
  ];
  return { rules };
});
