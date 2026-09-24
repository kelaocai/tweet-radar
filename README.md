<div align="center">

# X Signal Lab

**把 X 信息筛选变成一套可讨论、可复用、可改进的判断规则。**

面向普通读者、研究者与开发者的 X 内容判断标准、提示词和免费 Chrome 插件。

[快速安装](docs/INSTALLATION.md) · [判断规则库](prompts/) · [参与贡献](CONTRIBUTING.md) · [English](#english)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](extension/manifest.json)

</div>

> **定位**：插件只是一个免费、可选的使用入口。项目的核心是大家共同积累的内容采集边界、判断标准、提示词模板和案例。它不代表 X，也不代表任何模型服务商。

## 30 秒了解

X Signal Lab 的浏览器插件读取你当前打开的 X 页面里已经加载的帖子，将帖子文本和你写下的目标发送给 TypeSafe 的 Jev 进行结构化判断，再把概率显示为高亮。它不会自动搜索、滚动或打开帖子；用户可点击精排结果定位帖子。

- 不需要安装开发依赖或构建项目。
- 需要 Chrome/Chromium 浏览器和你自己的 TypeSafe API key；服务商的套餐、额度和收费以其官方页面为准。
- 插件本身免费开源；外部判断服务可能产生费用，套餐与额度以服务商为准。API key 保存在浏览器扩展本地存储中。**帖子文字、目标和判断主体会发送给 TypeSafe API**；请勿处理你无权外传的内容。
- 插件目前通过 Chrome 开发者模式侧载，尚未上架 Chrome Web Store。
- 这是辅助筛选，不是事实核验、投资建议或内容真实性保证。概率不是现实世界的准确率。

## 快速开始

1. 下载本仓库 ZIP 并解压，或运行 `git clone https://github.com/kelaocai/x-jev-curator.git`。
2. 打开 `chrome://extensions`，开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择解压后的仓库中的 `extension/` 目录。
4. 点击插件图标进入设置，填写目标、判断主体和自己的 TypeSafe API key，然后保存。
5. 打开 `https://x.com/` 的搜索结果或时间线，向下浏览；命中的帖子会显示概率和颜色标记。
6. 点击页面右下角“精排本页”，对最多 12 条候选进行两两比较并显示前三名。

完整说明见[安装指南](docs/INSTALLATION.md)。

## 工作原理

```text
你写下目标与读者画像 → 插件读取当前已加载的帖子 → Jev 判断相关性
→ 页面显示高亮 → 可选：对入围候选两两比较并排序
```

具体阈值、批次和每页上限可在插件设置中调整。更重要的是**你如何定义“有价值”**：目标、读者画像、排除项、证据要求和反例。我们希望这些判断标准能被复用、讨论和持续修订。详见[判断模型与边界](docs/JUDGMENT_MODEL.md)及[prompts/](prompts/)。

## 项目结构

```text
extension/                 Chrome 扩展（Manifest V3，无构建）
prompts/                   可复制、可改写的判断模板与规则
examples/                  脱敏的目标/画像/排除项示例
docs/                      安装、判断模型、隐私和发布清单
.github/ISSUE_TEMPLATE/    问题与规则提案模板
```

## 文档导航

- [安装指南：普通用户与开发者](docs/INSTALLATION.md)
- [判断模型、采集边界与提示词设计](docs/JUDGMENT_MODEL.md)
- [隐私与安全说明](SECURITY.md)
- [部署与发布清单](docs/RELEASE_CHECKLIST.md)
- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [更新记录](CHANGELOG.md)
- [路线图](ROADMAP.md)

## 路线图

- [x] 发布可侧载的 Chrome 扩展原型
- [x] 建立中文优先的判断规则与提示词目录
- [ ] 收集更多不同任务的高质量规则和反例
- [ ] 通过公开讨论迭代规则版本与评估方法
- [ ] 评估 Chrome Web Store 发布方式与维护成本

欢迎从[提出一条判断规则](https://github.com/kelaocai/x-jev-curator/issues/new?template=rule_proposal.yml)开始参与。

## 请我喝杯咖啡

如果这个开源项目对你有帮助，欢迎[请我喝杯咖啡（PayPal）](https://paypal.me/kelaocai)，支持后续维护与规则共建。谢谢！

---

## English

**X Signal Lab is a community library of X content curation criteria, prompts, and examples, with an optional free Chrome extension.** The extension reads posts already loaded in your X tab and sends their text, together with your goal and reader profile, to TypeSafe Jev for structured relevance judgments. It does not automatically crawl, auto-scroll, or open posts; clicking a ranked result navigates to that post. A TypeSafe API key is required; provider pricing and limits may apply. Review the [installation guide](docs/INSTALLATION.md), [judgment model](docs/JUDGMENT_MODEL.md), and [privacy notes](SECURITY.md) before use.

The extension is provided under the MIT License. Contributions to the rules library are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
