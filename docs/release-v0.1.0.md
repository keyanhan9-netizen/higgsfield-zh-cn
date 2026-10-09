# Higgsfield 简体中文（非官方）v0.1.0

独立原创的 Chrome Manifest V3 界面汉化扩展，采用 MIT 许可，与 Higgsfield 无关联。

- 本地精确词典，限定导航、页脚链接和已观察的生成按钮文字。
- 中英文开关、动态 DOM 更新和路由变化支持，可恢复最新原文。
- 仅 storage 权限及 higgsfield.ai / www.higgsfield.ai 两个 HTTPS 域名。
- 不调用外部翻译或遥测，不读 cookies、令牌或付款数据。
- 36 项自动测试通过，原创夹具已在 Chrome 验证；真实站点只做首页及图片工具结构观察。

下载 ZIP 和 SHA-256 文件。解压后在 chrome://extensions 手动开启开发者模式，选择“加载已解压的扩展程序”，加载含 manifest.json 的目录，然后刷新 Higgsfield 页面。源码方式可直接加载 extension/。

未上架 Chrome 应用商店，未安装到用户浏览器，未全站注入实测。视频/其他生成路由、复杂弹出菜单、Shadow DOM、iframe 等尚未全面验证；提示词、作品、营销长文及账户/账单/支付业务内容不在翻译范围。详见 README、PRIVACY 与 docs/coverage.md。
