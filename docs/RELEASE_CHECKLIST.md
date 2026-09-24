# 部署与发布清单

适用于维护者发布 GitHub 版本以及未来可能提交 Chrome Web Store 的准备流程。

## 每次 GitHub 发布前

- [ ] 修改 `extension/` 后确认 Manifest V3 的文件路径、权限和服务端域名与实际功能一致。
- [ ] 在全新 Chrome/Chromium 配置中手动加载 `extension/`，验证选项页、保存、禁用、内容高亮和错误提示。
- [ ] 验证不同长度目标、缺失 key、服务端限流/错误时的行为；确认不会把凭证放进控制台日志或提交内容。
- [ ] 更新 `CHANGELOG.md`、README 中的限制、版本号和路线图。
- [ ] 扫描提交差异：API key、token、Cookie、个人路径、内部域名、真实帖子文本、缓存文件、截图元数据均不得出现。
- [ ] 检查权限变更并在 PR 中说明理由；检查新增外部请求、数据类型和依赖。
- [ ] 核对 MIT License 和第三方素材/依赖许可。
- [ ] 运行 `python3 scripts/package_extension.py`，检查 `dist/tweet-radar-extension.zip` 的文件白名单、版本和 `SHA256SUMS.txt`；将这两个文件作为 Release 附件上传。
- [ ] 创建版本标签（例如 `v0.1.0`），推送后在 GitHub Releases 发布简要中英说明。
- [ ] 从 GitHub 下载发布源码压缩包，按普通用户安装指南做一次手动安装核对。

## 若申请 Chrome Web Store 发布

- [ ] 注册并完成 Chrome Web Store Developer Dashboard 要求的开发者验证。
- [ ] 按 Dashboard 当前要求打包扩展目录中的文件；不要打包仓库的文档、密钥或开发资料。
- [ ] 准备准确的名称、说明、图标、截图、支持网址和隐私政策网址。
- [ ] 逐项解释 `storage` 与 `https://api.typesafe.ai/*` 权限，并准确描述数据收集、传输、使用、保留及删除方式。
- [ ] 在表单中声明向 TypeSafe API 传输的页面文本、用户目标/画像与 API key；确认这些声明符合当前商店政策和服务条款。
- [ ] 使用最小权限，检查商店要求的隐私、数据使用和单一用途政策；不确定时先核对最新官方政策。
- [ ] 上传前重新审查产物、版本号和源代码；按需提交审核并跟进审核反馈。

> 发布到 Chrome Web Store 不会自动发生。本仓库目前的安装方式是开发者模式加载已解压目录。

## 演示站点

GitHub Pages 从 `main` 分支的 `/docs` 发布。`index.html`、`site.css` 和 `demo.js` 构成静态页面。演示帖子和分数为预设，不能作为 Jev 实测结果宣传；页面不接收 API key、不请求模型。
