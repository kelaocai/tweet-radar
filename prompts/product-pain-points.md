# 寻找产品需求 / Find product needs

版本 / Version: 0.1.0 · 状态 / Status: 草案 / Draft

## 如何使用 / How to use

把下方目标和判断主体分别复制到扩展设置的“目标”和“判断主体”中，保存并启用自动判断。规则文字可修改。以下预期是作者编写的规则边界，不是模型实测结果。

Copy the goal and reader profile into the extension’s separate 目标 and 判断主体 fields, save, and enable automatic judgment. Adapt the text to your task. The expectations below are author-written boundaries, not measured model results.

## 目标

```text
找到个人或团队反复遇到的内容整理问题，用来设计后续用户访谈。
```

## 判断主体

```text
在研究信息整理工具的独立开发者。优先有实际场景、重复频率和当前替代做法的求助；排除泛泛抱怨、无场景的功能愿望和促销。不把点赞量当需求验证。
```

## Goal

```text
Find recurring content-organization problems to investigate in user interviews.
```

## Reader profile

```text
An independent developer researching information tools. Prioritize an actual situation, frequency, and current workaround. Exclude vague complaints, context-free wishlists, and promotions. Likes are not demand validation.
```

## 虚构用例 / Fictional examples

| 预期 / Expected | 样例 / Example |
| --- | --- |
| 优先阅读 / Read first | 描述每周整理收藏的步骤、频率和现有替代方案。 Describes a weekly bookmark workflow, frequency, and current workaround. |
| 人工复核 / Review | 说“整理信息太累了”，没有具体任务。 Says organizing information is tiring, without a concrete task. |
| 降低优先级 / Lower priority | 推广收藏工具并附优惠码。 Promotes a bookmark tool with a discount code. |

## 评估与限制 / Evaluation and limits

先由两位读者按同一规则独立标注一小组经授权或虚构样例，记录分歧、误报和漏报，再对照模型判断修订规则。相关性不证明内容真实；扩展当前只显示匹配概率，不单独生成“人工复核”类别。

Have two readers independently label a small set of authorized or fictional examples. Record disagreements, false positives, and missed matches before revising the rule against model outputs. Relevance does not establish truth. The extension currently displays a match probability; it does not emit a separate “human review” category.

[提出改进 / Suggest an improvement](https://github.com/kelaocai/tweet-radar/issues/new?template=rule_proposal.yml)
