# 有依据的技术内容 / Evidence in technical posts

版本 / Version: 0.1.0 · 状态 / Status: 草案 / Draft

## 如何使用 / How to use

把下方目标和判断主体分别复制到扩展设置的“目标”和“判断主体”中，保存并启用自动判断。规则文字可修改。以下预期是作者编写的规则边界，不是模型实测结果。

Copy the goal and reader profile into the extension’s separate 目标 and 判断主体 fields, save, and enable automatic judgment. Adapt the text to your task. The expectations below are author-written boundaries, not measured model results.

## 目标

```text
找到有可检查依据的技术实践内容，优先阅读能帮助复现或定位问题的帖子。
```

## 判断主体

```text
重视实现细节和边界的技术读者。要求至少一个具体过程或可检查材料，并说明条件或限制；不以自信语气、名气或互动数代替证据。证据不足时留给人工复核，不推断真实性。
```

## Goal

```text
Find technical reports with inspectable evidence that can help reproduce a result or diagnose a problem.
```

## Reader profile

```text
A technical reader who values implementation details and limits. Look for a concrete process or inspectable material, plus conditions or limitations. Confidence, fame, and engagement are not evidence. Leave unclear claims for human review.
```

## 虚构用例 / Fictional examples

| 预期 / Expected | 样例 / Example |
| --- | --- |
| 优先阅读 / Read first | 列出配置、运行条件和失败输入，可进一步核查。 Lists configuration, conditions, and failed inputs for inspection. |
| 人工复核 / Review | 描述亲历过程，但未提供任何可核查材料。 Describes first-hand work but offers no inspectable material. |
| 降低优先级 / Lower priority | 仅以名气或点赞数证明技术结论。 Uses fame or likes as proof of a technical claim. |

## 评估与限制 / Evaluation and limits

先由两位读者按同一规则独立标注一小组经授权或虚构样例，记录分歧、误报和漏报，再对照模型判断修订规则。相关性不证明内容真实；扩展当前只显示匹配概率，不单独生成“人工复核”类别。

Have two readers independently label a small set of authorized or fictional examples. Record disagreements, false positives, and missed matches before revising the rule against model outputs. Relevance does not establish truth. The extension currently displays a match probability; it does not emit a separate “human review” category.

[提出改进 / Suggest an improvement](https://github.com/kelaocai/tweet-radar/issues/new?template=rule_proposal.yml)
