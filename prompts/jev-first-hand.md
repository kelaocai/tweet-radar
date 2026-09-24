# Jev 一手实战 / Jev in practice

版本 / Version: 0.1.0 · 状态 / Status: 草案 / Draft

## 如何使用 / How to use

把下方目标和判断主体分别复制到扩展设置的“目标”和“判断主体”中，保存并启用自动判断。规则文字可修改。以下预期是作者编写的规则边界，不是模型实测结果。

Copy the goal and reader profile into the extension’s separate 目标 and 判断主体 fields, save, and enable automatic judgment. Adapt the text to your task. The expectations below are author-written boundaries, not measured model results.

## 目标

```text
找到 Jev / TypeSafe AI 的一手集成经验，帮助开发者判断哪些任务值得实际尝试。
```

## 判断主体

```text
需要可复用代码、输入输出样例或明确失败边界的开发者。优先有具体任务、实现过程和限制的内容；降低纯发布转发、无方法的速度宣称和推广帖的权重。
```

## Goal

```text
Find first-hand Jev / TypeSafe AI integration reports that help developers decide what to try.
```

## Reader profile

```text
A developer looking for reusable code, input/output examples, or clear failure boundaries. Prioritize a concrete task, implementation details, and limitations. Downrank announcement reposts, speed claims without a method, and promotions.
```

## 虚构用例 / Fictional examples

| 预期 / Expected | 样例 / Example |
| --- | --- |
| 优先阅读 / Read first | 公开具体分类任务、请求配置和失败输入。 A concrete classification task, request configuration, and failed inputs. |
| 人工复核 / Review | 声称快十倍，未说明基线与方法。 Claims a 10× speedup without a baseline or method. |
| 降低优先级 / Lower priority | 只转发新品发布页和推广链接。 Only reposts a launch page and a promotional link. |

## 评估与限制 / Evaluation and limits

先由两位读者按同一规则独立标注一小组经授权或虚构样例，记录分歧、误报和漏报，再对照模型判断修订规则。相关性不证明内容真实；扩展当前只显示匹配概率，不单独生成“人工复核”类别。

Have two readers independently label a small set of authorized or fictional examples. Record disagreements, false positives, and missed matches before revising the rule against model outputs. Relevance does not establish truth. The extension currently displays a match probability; it does not emit a separate “human review” category.

[提出改进 / Suggest an improvement](https://github.com/kelaocai/tweet-radar/issues/new?template=rule_proposal.yml)
