<div align="center">

# 推文雷达 · Tweet Radar

**在 X/Twitter 里，按自己的标准发现值得读的推文。**

面向普通读者、研究者与开发者的 X/Twitter 内容判断标准、提示词和免费 Chrome 插件。

[快速安装](docs/INSTALLATION.md) · [判断规则库](prompts/) · [参与贡献](CONTRIBUTING.md) · [English README](README.en.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](extension/manifest.json)

</div>

![推文雷达在 X 搜索页中标记帖子的使用场景示意图](docs/images/tweet-radar-in-use.png)

*这张图展示插件在 X 信息流中的使用场景。画面由 Image 2.5 制作，帖子和评分为示意，并非插件运行截图；当前按钮名称与角标样式见下文。*

> **定位**：插件只是一个免费、可选的使用入口。项目的核心是大家共同积累的内容采集边界、判断标准、提示词模板和案例。它不代表 X，也不代表任何模型服务商。

## 30 秒了解

推文雷达浏览器插件会读取你当前打开的 X 页面里已经加载的帖子，将帖子文本和你写下的目标发送给 TypeSafe 的 Jev 进行结构化判断，再把概率显示为高亮。它不会自动搜索、滚动或打开帖子；用户可点击最佳匹配结果定位帖子。

- 不需要安装开发依赖或构建项目。
- 需要 Chrome/Chromium 浏览器和你自己的 TypeSafe API key；服务商的套餐、额度和收费以其官方页面为准。
- 插件本身免费开源；外部判断服务可能产生费用，套餐与额度以服务商为准。API key 保存在浏览器扩展本地存储中。**帖子文字、目标和判断主体会发送给 TypeSafe API**；请勿处理你无权外传的内容。
- 插件目前通过 Chrome 开发者模式侧载，尚未上架 Chrome Web Store。
- 这是辅助筛选，不是事实核验、投资建议或内容真实性保证。概率不是现实世界的准确率。

## 快速开始

1. 下载本仓库 ZIP 并解压，或运行 `git clone https://github.com/kelaocai/tweet-radar.git`。
2. 打开 `chrome://extensions`，开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”，选择解压后的仓库中的 `extension/` 目录。
4. 点击插件图标进入设置，填写目标、判断主体和自己的 TypeSafe API key，勾选“启用自动判断”，然后保存。
5. 打开 `https://x.com/` 的搜索结果或时间线，向下浏览；已加载的帖子会自动判断，右上角以图标、百分比和颜色显示结果。
6. 页面右下角面板可“设置规则”或“检查新帖”；点击 × 可收起，再点击雷达按钮展开。当前页面有至少 2 条入围候选时，可选“最佳匹配前三”：对最多 12 条候选两两比较，推荐最多 3 条并提供跳转链接。该操作会额外消耗 API tokens，不会重排 X 页面。

完整说明见[安装指南](docs/INSTALLATION.md)。

## 项目效果与操作说明

顶部场景图及以下操作图由 Image 2.5 制作，均非插件实际运行截图。其中“真实帖子案例”取自下方注明的公开来源；其他帖子内容、版式、86% 置信度和界面状态仅用于解释功能，不代表真实模型评分。

### 1. 设置目标与判断主体

先写明要找什么、谁在阅读以及什么内容应被排除，再填入自己的 TypeSafe API key。图中“启用自动判断”尚未勾选；确认勾选并点击“保存”后，扩展会在 X 页面持续判断新加载的帖子。目标、判断主体和帖子文本会发送到 TypeSafe API，请勿处理无权外传的内容。

![推文雷达设置顺序示意图：目标、判断主体、API key、启用自动判断并保存](docs/images/tweet-radar-setup-guide.png)

### 2. 看懂页面上的标记与面板

打开 X 搜索结果或时间线后，扩展只读取页面已经加载的帖子。绿色、黄色、灰色角标分别提示相关程度，角标里的百分比是模型给出的判断值。“检查新帖”只检查尚未处理的已加载帖子；自动判断开启时，滚动加载的新帖也会自动进入判断。面板可收起、重新展开。

“最佳匹配前三”是可选的额外比较：达到入围阈值的候选至少有 2 条时才可用，会推荐最多 3 条并提供跳转入口，不会改变 X 页面的帖子顺序。图中的 86% 仅为示意。

![推文雷达当前面板与图标加百分比角标的功能示意图](docs/images/tweet-radar-overview-v2.png)

### 3. 真实帖子案例：从内容提炼判断线索

案例取自 [X 上的一条公开帖子](https://x.com/goan999999/status/2101657121746198981)。作者提到自己接入 Jev 后的 token 消耗变化。配图拆解了可用于设计筛选规则的线索：工具组合、作者自述的量化结果、后续操作信息。该自述未经独立核实；筛选不等于事实核验，也不代表插件实际评分。

![真实公开帖子案例拆解示意图](docs/images/tweet-radar-case-study.png)

### 4. 清空与恢复研判

点击“清空研判并关闭自动判断”，当前目标和判断主体会存入历史，页面标记会清除，自动判断同时关闭。点击历史记录的“恢复”，会填回这组设置并重新开启自动判断；已打开的 X 页面会按恢复后的规则重新处理已加载帖子。API key 保存在本机设置中，不会写入历史记录。恢复后可能产生新的 API 用量。

![清空研判关闭自动判断、恢复历史重新开启自动判断的操作示意图](docs/images/tweet-radar-clear-restore.png)

## 工作原理

```text
你写下目标与读者画像 → 插件读取当前已加载的帖子 → Jev 判断相关性
→ 页面显示图标、百分比与颜色标记 → 可选：两两比较候选并推荐最多 3 条
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

欢迎从[提出一条判断规则](https://github.com/kelaocai/tweet-radar/issues/new?template=rule_proposal.yml)开始参与。

## 请我喝杯咖啡

如果这个开源项目对你有帮助，欢迎通过 PayPal 或支付宝支持后续维护与规则共建，谢谢！

- [通过 PayPal 请我喝杯咖啡](https://paypal.me/kelaocai)

也可以使用支付宝扫码支持：

<p align="center">
  <img src="assets/alipay-coffee.jpg" alt="支付宝收款码" width="320">
</p>

---

## English

Tweet Radar is a community library of content curation criteria and prompts, with an optional free Chrome extension for X. Read the [English guide](README.en.md) for installation, a translation of the current Chinese UI labels, privacy and API cost notes, and ways to contribute.
