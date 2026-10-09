# 0.1.0 验证记录

日期：2026-10-09。运行环境：Node.js 26.4.0、jsdom 30.1.2。

- `npm test`：36 项通过，0 项失败。
- `npm run check`：MV3、唯一 storage 权限、两个明确 HTTPS 域名、无网络/凭据 API、脚本语法及 3 条规则的 39 个词条检查通过。
- `npm run package`：8 个白名单文件（包括 LICENSE），生成可复现的 ZIP 与 SHA-256。
- `unzip -t dist/higgsfield-zh-cn-v0.1.0.zip`：8 个文件全部通过。

自动化验证涵盖动态插入、框架文本/属性回写、跨规则和路由变化、重复启动/刷新、切换还原、脱离/重新插入节点、编辑器/输入值/代码/作品/文件名保护、storage 初始化竞态与跨页面更新、读写失败处理，以及同步/异步的同值外部修改。

## Chrome 原创夹具验证

另通过 Chrome 打开本地原创夹具，加载正式 `dictionary.js` 与 `engine.js`，验证：

1. 导航显示中文，已观察结构的生成控件显示“生成”和“自动”。
2. 切到 English 后还原，切回中文后重新翻译。
3. 动态插入的 Generate 按钮自动变为“生成”。
4. 模拟路由进入 `/community` 时生成控件恢复英文，返回 `/ai/image` 时重新变为中文。
5. 输入框、文本域、用户作品及嵌套文件名仍保留合成英文原文。

可复现预览：运行 `node scripts/serve-preview.cjs`，打开 `http://127.0.0.1:8765/scripts/preview.html`。服务仅绑定本机回环地址；完成后按 Ctrl+C 停止。预览通过传入模拟路由检查引擎，未使用 Chrome 扩展 API，不代表安装或注入测试。

真实站点仅做只读结构观察；具体路径及剩余覆盖限制见 [coverage.md](coverage.md)。没有安装扩展、改变用户浏览器设置或进行全站实测。
