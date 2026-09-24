# 隐私与安全说明

## 数据流

- 扩展通过内容脚本读取 X 页面 DOM 中已加载的帖子文本、作者标识、链接及页面可见的互动数。
- 扩展后台将帖子文本、作者标识、可见互动计数，以及你设置的目标/判断主体和 API key 发往 `https://api.typesafe.ai/v1/systemone`。key 通过 HTTPS 请求头发送。
- API key、目标、判断主体以及最多 50 条本地目标历史保存在 Chrome `storage.local`。该存储不是本项目自行加密的保险库；本机账户或浏览器配置文件失陷时，不能视作密钥隔离边界。
- 插件不配置本项目自有服务器，也不主动向 X API 发起请求。服务商自己的留存、处理和计费规则受其政策约束，请查阅其官方条款。

请只处理你有权提交给第三方服务的数据。不要将敏感或受保密义务保护的帖子用于判断。不要在公开仓库提交 key、Cookie、用户数据、原始私信或可识别个人的信息。公开示例请用虚构内容或经授权并充分脱敏的材料。

## 报告安全问题

请不要在公开 issue 中发布可利用漏洞、真实凭证或个人数据。可使用 GitHub 仓库的 **Security → Advisories → Report a vulnerability** 私下联系维护者；若该入口不可用，请通过项目所有者 GitHub 个人页上的联系方式联络，并仅提供复现所需的最少信息。

## Scope

This repository contains a client-side browser extension. It sends page text and user-provided criteria to the configured TypeSafe API. The project does not operate a backend. Never publish secrets or personal data in issues or pull requests. Use GitHub's private vulnerability reporting when available.
