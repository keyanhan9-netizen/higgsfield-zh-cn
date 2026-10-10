# 覆盖与验证范围

适用版本：0.2.0。页面结构观察日期：2026-10-09、2026-10-10。

本记录只保留脱敏的路径、标签、类名和短界面文案。没有提交网页 HTML 原件、截图原件、账号信息、提示词、作品或付费素材。

## 真实页面只读观察

通过可用浏览器只读检查了全局导航及 Image、Video、Audio 三个展开菜单的公共功能文案和模型说明，并观察图像、视频、音频、Cinema Studio、特效、编辑页空状态及 AI 网红页面的固定控件。另到达素材页和 Ads Studio，观察范围限于下表。未进行付费生成、上传文件或修改用户作品。

| 范围 | 真实观察结果 | 覆盖依据及限制 |
| --- | --- | --- |
| 全局导航 | `.hfnav-item`、`.hfnav-action` 与资产入口链接 | 在明确导航控件内做精确词典匹配 |
| Image、Video、Audio 导航展开菜单 | 公共功能名、功能说明、模型分组标题和模型说明 | 限定到 `header` 内相应菜单的文字 `p`，使用 `ownText: true`；模型型号保留 |
| `/ai/image` | `#image-form` 中的质量、Auto、生成文字，以及 References、Elements 等控件的 `aria-label`；已观察质量菜单 | 主表单及文本容器限定选择器；质量菜单通过触发按钮的 `aria-controls` 关联，并核对质量标题，不扫描任意 portal |
| `/ai/video` | `#video-create-layout` 左侧首个 `div` 的固定导航、References／Extend Video 单选项、Duration／Ratio／Resolution／Bitrate 标签、High 及直接 Generate 文本 | 限定到已观察控件；码率 portal 使用 Bitrate 控件的 `aria-controls` 关联，模型名和输入内容保留 |
| `/audio` | 若干主要模式、固定标签、生成按钮和视图控件 | 限定到表单及已观察文字容器；并未覆盖整个表单，Script、Batch size、上传器等仍有保守遗漏 |
| `/generate` | 真实页面为 Cinema Studio 的固定侧栏；观察到 Home、My generations、My elements、My favorites、Community、Academy、Projects、New project 及三个辅助按钮标签 | 可将固定侧栏控件限定到下述窄作用域；项目列表、项目内容及私人区域未读取 |
| `/effects/use` | Resolution、Aspect Ratio、Generate、History、How it works 等静态参数和页签 | 仅限已观察控件自己的文字，不读取效果作品或提示词 |
| `/layers` | 空状态的 Upload Media 按钮 | 只翻译该按钮文字，未上传媒体或观察作品编辑流程 |
| `/ai-influencer-studio` | 模式页签及 Character type、Gender、Build 等静态参数标题 | 限定到模式页签和参数标题；不翻译用户内容或生成结果 |
| `/asset/all` | 已确认到达素材页，标题为 Assets；已知 `header nav .hfnav-item` 公共导航可访问 | 私人图库不得读取；内部工具栏未验证，不能据此新增图库或素材条目翻译 |
| `/ads-studio` | 已确认页面到达，标题为 Ads Studio；已知公共导航可访问 | 内部标签未确认，不推测生成、上传或广告作品区域的规则 |
| 模型型号 | 已观察的型号及版本名称 | 保留原文；仅收录公共功能文案和说明 |

这些观察用于约束词典规则，不代表新版扩展已加载或完成全站实测。0.2.0 的真实浏览器扩展加载受到 `chrome://extensions` 页面控制限制，尚未完成；没有将词典观察或本地夹具验证表述为本版安装、注入或全站通过。

素材页的完整可访问性树读取被自动审批拒绝，原因是先读取全树再过滤仍可能接触私人图库、作品、提示词或文件名。该读取未继续；随后只检查已知公共导航，不保存原始页面材料。

图像生成规则不覆盖任意 `fieldset button` 或 `label`，也不递归进入这些按钮的后代内容。路由规则按路径边界匹配，只检查路径，查询参数不参与判断；例如 `/ai/image` 不会误匹配 `/ai/image-extra`。

## Cinema Studio 固定侧栏作用域

真实观察确认侧栏根含 `group/sidebar` 类；建议用 `main [class~="group/sidebar"]` 限定作用域，再只处理固定控件自己的文字或属性。以下均为公开的界面短文案；没有读取项目条目、作品、提示词、上传文件名或账号数据。

| 控件原文 | 建议译文 | 已观察的根内选择器 |
| --- | --- | --- |
| Home、My generations、My elements、My favorites、Community、Academy | 首页、我的生成、我的元素、我的收藏、社区、学院 | `button[class~="group/top-action"] > span.truncate.text-sm-medium` |
| Projects | 项目 | `p.text-q-caption-sm-medium.text-q-text-secondary` |
| New project | 新建项目 | `#folder-sidebar-button-higgscord > span.truncate` |
| Search projects | 搜索项目 | `button.size-6.text-q-text-secondary`；文字在 `aria-label` |
| Sort projects | 项目排序 | `button.size-6.q-dropdown-trigger`；文字在 `aria-label` |
| Collapse sidebar | 收起侧栏 | `.sticky button.size-7.text-qc-text-secondary`；文字在 `aria-label` |

使用 `paths: ["/generate"]` 和 `ownText: true` 收窄范围。前六个导航按钮还含图标节点，只应翻译其文字 `span`，不应递归整按钮。辅助按钮无可见文字，仅处理自身符合词典的 `title` 或 `aria-label`。不要把会被翻译的英文属性值作为持久选择器，也不要使用动态的 `base-ui` 标识。Cinema Studio 品牌名保留原文。

上述表格记录真实观察依据及已采用的窄规则；最终已启用的规则以 `extension/dictionary.js` 为准，验证状态见 [validation.md](validation.md)。

## 自动化验证

测试使用 jsdom 及项目原创的合成 DOM，不包含下载的站点 DOM 或用户数据。应验证的核心行为包括：

- 只有指定选择器、路由及精确英文词典匹配时才翻译。
- 动态增加或更新控件后，异步观察器能处理已收录文案。
- 中英文开关可以还原扩展修改的文字。
- 重复执行保持稳定，不重复或叠加替换。
- 路由变化会重新检查规则适用范围。
- 输入框、可编辑内容、已知用户内容与文件名标记、代码及显式忽略区域保持原样。
- `ownText: true` 只翻译指定元素的直接文本，子元素、任意按钮及上传预览不因生成规则被递归翻译。
- 只有适用控件的 `title`、`aria-label` 可以翻译；输入值、占位文字、`alt`、URL、HTML 结构及未命中的文本保持原样。

本版当前自动化测试已确认 61 项通过、0 项失败，Chrome 原创多页面预览另验证了 7 个模拟工具页面。具体行为及验证环境见 [validation.md](validation.md)。测试通过代表原创夹具中的行为符合预期，不等于真实网站全部界面均受覆盖；本版没有完成真实扩展加载和注入验证。

## 尚未覆盖或实测

| 界面或场景 | 状态 |
| --- | --- |
| 所有模型的完整设置、未观察的生成路由 | 未覆盖，不能由少量型号的静态观察推定全站适配 |
| 音频 Script、Batch size、上传器及其他未收录文字 | 保守遗漏；已覆盖部分按钮不代表整组控件全部汉化 |
| Cinema Studio 项目列表与项目私人区域 | 未读取，不纳入翻译范围 |
| 素材页私人图库、素材条目和内部工具栏 | 私人内容不得读取；工具栏未验证 |
| Ads Studio 内部标签与广告作品区域 | 仅到达页面，内部标签未确认 |
| 作品相关弹窗和未观察的 portal | 不覆盖；仅质量、码率两个已观察关联菜单有窄规则 |
| Shadow DOM、iframe | 不覆盖 |
| 营销长文 | 不翻译 |
| 账户、账单及支付业务内容 | 不收录、不翻译；全局导航仍按导航规则处理 |
| 提示词、用户作品、代码、可编辑区域及文件名 | 已知结构与标记受保护；未知用户区域不能保证自动识别 |
| 后续网站改版或新控件 | 需重新观察及添加夹具，不能假定兼容 |

0.2.0 扩展了常用页面的固定控件覆盖，仍未达到全站 100% 汉化。新功能、完整模型设置、作品区域及其弹窗均不能视为已覆盖。

保护规则与收窄的选择器共同限制翻译范围，不能据此假定全站用户内容都会被自动识别。维护者新增覆盖时，应补充只读观察日期、最小结构描述与对应测试；真实页面没有访问权限或需要登录时，注明限制并继续使用原创合成夹具，不声称已完成实测。
