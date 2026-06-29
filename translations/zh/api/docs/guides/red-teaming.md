---
status: needs-review
sourceId: "988929988cc3"
sourceChecksum: "988929988cc3974ed33c359afe3f4bbee31d767ba13bfa7fdf90b4bf13302d5d"
sourceUrl: "https://developers.openai.com/api/docs/guides/red-teaming"
translatedAt: "2026-06-27T18:23:41.3718846+08:00"
translator: codex-gpt-5.5-xhigh
---

# Red teaming 红队测试

Red teaming 使用对抗性测试用例，帮助在部署前发现不安全、不可靠或违反政策的行为。它通过聚焦滥用场景、失败模式和普通质量测试可能暴露不出的高风险交互，对 evals 形成补充。

<strong>重要：</strong>只向 OpenAI Red Teaming 提交你拥有或已明确获授权测试的代码或其他资产。未经 OpenAI 明确书面许可，不要使用 OpenAI Red Teaming 分析或报告开源代码或任何第三方代码中的漏洞。

## 使用 Promptfoo 进行开源 red teaming

[Promptfoo](https://github.com/promptfoo/promptfoo) 是一个用于评估 prompts、agents 和 AI 应用的开源框架。它的 red teaming 工作流可帮助你生成对抗性测试用例、检查目标行为，并利用结果改进系统。

如需了解更广泛的开源方法，请参阅 Promptfoo 的 [LLM red teaming guide](https://www.promptfoo.dev/docs/red-team/)。

## 企业可用性

OpenAI Red Teaming 面向需要托管式 AI 应用和 agent red teaming 服务的企业客户开放。相比独立的本地工作流，企业工作流可以支持更广泛的协作、审查和报告需求。

## Red teaming 与 evals

使用 [evals](https://developers.openai.com/api/docs/guides/evals) 衡量 AI 系统是否按预期运行。使用 red teaming 探测该系统在对抗性、滥用性或意外输入下的行为。成熟的评估项目通常会同时使用二者。
