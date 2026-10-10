# Higgsfield 简体中文界面扩展

为 [Higgsfield](https://higgsfield.ai/) 的部分界面提供简体中文翻译。独立、非官方项目，与 Higgsfield 及其运营方无关联，未获得其认可或背书。Higgsfield 名称及相关商标归其权利人所有。

当前版本为 **0.2.0**，采用 Chrome Manifest V3。使用扩展内置词典，在页面中翻译明确匹配的导航和控件文字，包括适用控件的 `title` 和 `aria-label`；不翻译用户提示词、作品或代码。品牌与模型名称保留原文。

## 功能与范围

- 在扩展弹窗中切换中文／英文；首次使用默认开启中文。
- 监听动态界面更新及路由变化，处理后续出现的已收录控件。
- 切回英文时还原扩展改写过的文字；重复处理不会叠加翻译。
- 仅作用于 `https://higgsfield.ai/*` 和 `https://www.higgsfield.ai/*`，不覆盖其他子域名或网站。
- 只使用本地精确词典，不调用外部翻译服务，不包含遥测。

0.2.0 扩展了图片／视频／音频导航菜单、图片质量菜单、视频主要操作与码率菜单、音频部分固定控件、Cinema Studio 侧栏、特效参数、编辑页空状态及 AI 网红参数标题。仅在限定选择器和路由内替换精确文案，未收录的内容会保留原文。目前仍未达到全站完整汉化；具体已验证和剩余界面见 [覆盖说明](docs/coverage.md)。

## 安装

源码公开不代表已经上架 Chrome 应用商店。本项目当前按“加载已解压的扩展程序”方式安装。

1. 获取本仓库源码，或从 [发布页](https://github.com/keyanhan9-netizen/higgsfield-zh-cn/releases/latest) 下载 `higgsfield-zh-cn-v0.2.0.zip`。
2. 解压文件。使用源码时，扩展目录是仓库中的 `extension/`；使用安装包时，选择解压后直接包含 `manifest.json` 的目录。
3. 在 Chrome 地址栏打开 `chrome://extensions`。
4. 由你自行开启右上角“开发者模式”。
5. 点击“加载已解压的扩展程序”，选择上一步的扩展目录。
6. 打开或刷新 Higgsfield 页面，点击扩展图标，在弹窗中切换语言。可将扩展固定到工具栏，便于操作。

安装和开发者模式需要你在浏览器中手动操作；项目不会自动安装扩展或更改浏览器设置。已经打开的页面在扩展安装或重新加载后需要刷新，才能获得内容脚本。之后，弹窗开关会通过本地设置变化通知已加载的 Higgsfield 页面。

更新源码或安装包后，在 `chrome://extensions` 中点击本扩展的“重新加载”，再刷新 Higgsfield 页面。卸载可在同一页面点击“移除”。

## 权限与隐私

扩展仅声明 `storage` 权限，用 `chrome.storage.local` 保存一个 `enabled` 布尔值。未设置时默认开启中文。内容脚本的匹配范围限定为上述两个 Higgsfield HTTPS 域名。

不声明 `host_permissions`、`tabs`、`activeTab`、`scripting` 或 `cookies` 权限；没有全子域名匹配、外部网络请求、远程代码、翻译接口或遥测。内容脚本为了识别界面控件会检查匹配页面的 DOM，但不会收集、上传或持久保存页面内容，也不读取 cookies、令牌或付款数据。

保护规则覆盖输入框、文本域、选择框、可编辑内容、代码、已知用户内容及文件名标记，以及 `translate="no"` 或 `data-hf-zh-ignore` 标记的区域。生成控件规则只处理指定子元素的直接文本，不遍历任意按钮或上传预览。扩展不改写 `value`、`placeholder`、`alt`、HTML 结构或 URL。保护依赖明确的结构与标记，不能自动识别所有未知用户内容；网站改版后需重新验证。

详细说明见 [PRIVACY.md](PRIVACY.md)。Chrome 官方文档解释了 [内容脚本的作用范围](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)、[权限声明](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)及 [storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)。

## 本地开发与验证

需要满足 `^22.22.2 || ^24.15.0 || >=26.0.0` 的 Node.js，推荐 Node.js 26。扩展本身无运行时依赖；开发测试使用 jsdom。

```sh
npm ci
npm test
npm run check
npm run package
```

`npm test` 运行基于原创合成 DOM 夹具的自动化测试，验证动态更新、中英文还原、重复执行和输入内容保护等行为。`npm run check` 执行项目静态检查。`npm run package` 生成：

```text
dist/higgsfield-zh-cn-v0.2.0.zip
dist/higgsfield-zh-cn-v0.2.0.zip.sha256
```

安装包以 `manifest.json` 为根，包含 7 个扩展文件及 `LICENSE`，不需要把整个源码仓库加载进 Chrome。打包使用 Node.js 内置功能，无外部打包工具或第三方打包依赖；ZIP 采用存储模式（不压缩），固定条目顺序和时间戳，相同源文件生成相同安装包。旁边的 `.sha256` 文件记录安装包校验值。开发依赖下载属于本地开发环境的操作，扩展运行时不访问 npm 或其他服务。

真实网站结构观察、夹具验证及实际浏览器安装是不同的验证步骤。本轮只读检查多个页面的固定控件，并在 Chrome 中验证正式引擎与原创扩展页面夹具。本版尚未通过实际 Chrome 扩展加载和全站注入实测。自动化测试的通过不能证明所有 Higgsfield 页面均被覆盖，详情见 [验证记录](docs/validation.md)。

## 词典维护

词典位于 [`extension/dictionary.js`](extension/dictionary.js)，采用 UMD 格式导出 `{ rules }`。每条规则包含：

| 字段 | 用途 |
| --- | --- |
| `id` | 唯一且稳定的规则标识 |
| `selector` | 限定界面控件的 CSS 选择器 |
| `ownText` | 可选；为 `true` 时只翻译目标元素的直接文本，不递归其子元素 |
| `paths` | 可选的路由前缀数组，按路径边界匹配，进一步收窄适用页面 |
| `linkedFrom` | 可选；只在已知触发控件 `aria-controls` 指向的 dialog/listbox/menu 中应用选择器 |
| `scopeHeading` | 可选；还需匹配指定的固定菜单标题，防止将素材弹窗误认成设置菜单 |
| `attributes` | 可选；例如仅允许 `['aria-label']`，不改写同按钮的文件名 tooltip |
| `text` | 可选；为 `false` 时只处理允许的属性，保留直接文本 |
| `entries` | 英文原文到简体中文的精确映射 |

例如，以下是说明格式的合成示例：

```js
{
  id: "example-control",
  selector: "main fieldset button.bg-primary > div.flex.flex-col > div:first-child",
  ownText: true,
  paths: ["/ai/image"],
  entries: { "Generate": "生成" }
}
```

`paths` 只检查 URL 的路径部分：`/ai/image` 可匹配自身及 `/ai/image/…`，不会匹配 `/ai/image-extra`，查询参数不参与匹配。生成控件使用 `ownText: true`，仅翻译观察到的文本容器，不覆盖任意 `fieldset` 按钮或标签。

新增翻译时，先确认文字来自站点界面，再选择足够窄的控件范围；不要为了覆盖更多词而扫描整页或扩大域名权限。每项改动都应添加正常翻译和保护区域的夹具用例。具体流程见 [贡献指南](CONTRIBUTING.md)。

## 常见问题

**部分文字仍是英文。** 这是预期行为：可能尚未收录，也可能位于保护区域、未观察页面、Shadow DOM、iframe 或复杂弹出菜单中。请按贡献指南提供脱敏的控件结构和文字，不要提交账号数据、提示词或作品。

**开关切换后没有变化。** 确认页面域名在支持范围内；安装或重新加载扩展后先刷新网页。只有词典命中的控件会改变。站点结构更新也可能让旧选择器失效。

**网页更新后翻译异常。** 先在扩展弹窗中切回英文，必要时停用扩展并刷新页面，然后提交带版本和脱敏步骤的问题报告。

## 许可

本项目原创代码及文档按 [MIT 许可](LICENSE)公开。该许可不授予任何 Higgsfield 商标、网站素材或用户作品的权利。
