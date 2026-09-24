# 示例 | Examples

## Jev API 连通与响应格式检查 | Jev API smoke check

这个不依赖第三方 Python 包的示例会用一条虚构帖子向 TypeSafe API 发起一次请求，并检查返回值是否包含范围为 0 到 1 的 `Noul` 概率。

This dependency-free Python example makes one TypeSafe API request using a fictional post, then checks that the response contains a `Noul` probability from 0 to 1.

### 运行方式 | Run

1. 使用 Python 3.9 或更新版本。 | Use Python 3.9 or newer.
2. 在当前终端会话中设置 `TYPESAFE_API_KEY` 环境变量。不要把 key 写进脚本、提交到 Git，或发到公开 issue。 | Set `TYPESAFE_API_KEY` in your current shell session. Never put the key in the script, commit it, or post it in a public issue.
3. 在仓库根目录运行：`python3 examples/jev-smoke-check.py`。 | Run `python3 examples/jev-smoke-check.py` from the repository root.

预期输出格式如下；模型版本和概率会因请求而变化： | Expected output shape; the model version and probability can vary:

```text
Jev model: <model returned by TypeSafe>
Noul relevance probability: <number from 0.00 to 1.00>
```

该脚本只发送代码里写好的虚构示例，不会读取 X 页面或本地帖子。每次运行会发起一笔 API 请求，可能产生费用；先查看服务商当前价格和额度。它检查 API 连通性与响应格式，不代表扩展全部浏览器功能均已通过测试，也不证明判断结果真实准确。

The script sends only the fictional sample in its source; it does not read X pages or local posts. Each run makes one API request and may incur a charge; check the provider's current pricing and limits first. It checks connectivity and response shape, not all browser behavior or the truth of a judgment.

## 贡献示例 | Contributing examples

规则样例请优先放入 [`prompts/`](../prompts/)，并注明适用范围、版本与边界案例。只提交明确标注为虚构或脱敏授权的内容；不要提交 API key、真实私信、非公开数据或未经许可复制的长篇帖子内容。

Add reusable rules to [`prompts/`](../prompts/) with scope, version, and boundary cases. Submit only fictional or authorized, redacted content; never include API keys, private messages, non-public data, or long copied posts without permission.
