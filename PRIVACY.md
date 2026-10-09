# 隐私与权限说明

适用版本：0.1.0。

Higgsfield 简体中文界面扩展是独立、非官方的本地界面翻译项目，与 Higgsfield 及其运营方无关联。

## 运行范围

内容脚本仅在以下 HTTPS 地址中运行：

```text
https://higgsfield.ai/*
https://www.higgsfield.ai/*
```

没有全子域名通配符，不在其他网站运行，不注入 iframe。内容脚本会检查页面 DOM 中词典规则指定的控件，在精确匹配英文界面文字后修改对应文本，或适用控件的 `title`、`aria-label`。

Chrome 内容脚本具有访问匹配页面 DOM 的能力；限定选择器及保护规则属于本项目的实现约束。网站结构发生变化时，可能导致译文缺失，因此默认保留未明确匹配的文字。权限机制的背景可查阅 [Chrome 内容脚本文档](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)。

## 权限与本地设置

`manifest.json` 中唯一的 `permissions` 项是 `storage`。它用于在 `chrome.storage.local` 保存：

| 键 | 类型 | 用途 |
| --- | --- | --- |
| `enabled` | 布尔值 | 是否开启中文；未设置时默认为 `true` |

设置保存在当前浏览器的扩展本地存储中，不使用 `storage.sync`，不发送到服务器。切换后，已加载内容脚本的页面会接收本地设置变化。卸载扩展可移除其本地设置。

扩展不声明 `host_permissions`、`tabs`、`activeTab`、`scripting`、`cookies` 或其他附加权限。指定网站的内容脚本匹配范围仍会让 Chrome 显示相应的站点访问提示；没有 `host_permissions` 并不表示内容脚本无法访问这些页面。

可参阅 Chrome 官方的 [权限声明说明](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)与 [storage API 文档](https://developer.chrome.com/docs/extensions/reference/api/storage)。

## 不收集或传输数据

- 无遥测、分析统计、广告跟踪或错误上报服务。
- 无外部网络请求、远程代码或外部翻译服务。
- 不读取 cookies、身份令牌、付款或账单数据。
- 不收集、上传或持久保存页面文本、提示词、作品、浏览历史或账号信息。

为切回英文，扩展会在当前页面内存中保留它所修改的文本及上述属性的原文，以及对应节点信息；这些信息不会写入扩展存储或发送到外部。页面刷新或关闭后，这份内存状态随页面释放。

## 内容保护

翻译目标是站点的导航与控件文案。保护规则覆盖输入框、文本域、选择框、可编辑区域、代码、已知提示词与用户内容标记、文件名标记，以及 `translate="no"` 或 `data-hf-zh-ignore` 标记的区域。生成控件使用 `ownText: true`，仅处理限定子元素的直接文本，避免递归进入上传预览、文件名或模型名。扩展不修改输入值、占位文字、`alt`、HTML 结构或 URL。

保护依赖明确的标签、结构和标记，不能保证自动识别所有未知用户区域。首版仅覆盖有限的已观察控件；网站结构改版需要重新验证。若发现异常，可在弹窗切回英文，或停用扩展后刷新页面。

本项目没有执行付费生成、读取浏览器账号、修改用户作品或操作付款流程的功能。站点本身的隐私政策及用户与站点之间的数据交互不属于扩展的处理范围。

## 开发与问题反馈

`npm ci` 会在开发者主动执行时获取测试工具依赖；这与安装包中的扩展运行行为不同。自动化测试使用原创合成夹具，不需要账号或真实用户内容。

公开问题报告和贡献时，请遵守 [贡献指南](CONTRIBUTING.md)中的脱敏要求。不要附带真实提示词、作品、完整网页 DOM、浏览器数据、cookies、令牌或账单。
