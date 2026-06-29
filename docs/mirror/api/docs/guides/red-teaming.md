---
title: "Red teaming 红队测试"
description: "Learn how red teaming fits into AI evaluation, including Promptfoo open source and OpenAI Red Teaming for enterprise teams."
outline: deep
---

# Red teaming 红队测试

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/guides/red-teaming](https://developers.openai.com/api/docs/guides/red-teaming)
- Markdown 来源：[https://developers.openai.com/api/docs/guides/red-teaming.md](https://developers.openai.com/api/docs/guides/red-teaming.md)
- 抓取时间：2026-06-27T05:54:07.505Z
- Checksum：`988929988cc3974ed33c359afe3f4bbee31d767ba13bfa7fdf90b4bf13302d5d`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
Red teaming 使用对抗性测试用例，帮助在部署前发现不安全、不可靠或违反政策的行为。它通过聚焦滥用场景、失败模式和普通质量测试可能暴露不出的高风险交互，对 evals 形成补充。

&lt;strong&gt;重要：&lt;/strong&gt;只向 OpenAI Red Teaming 提交你拥有或已明确获授权测试的代码或其他资产。未经 OpenAI 明确书面许可，不要使用 OpenAI Red Teaming 分析或报告开源代码或任何第三方代码中的漏洞。

## 使用 Promptfoo 进行开源 red teaming

[Promptfoo](https://github.com/promptfoo/promptfoo) 是一个用于评估 prompts、agents 和 AI 应用的开源框架。它的 red teaming 工作流可帮助你生成对抗性测试用例、检查目标行为，并利用结果改进系统。

如需了解更广泛的开源方法，请参阅 Promptfoo 的 [LLM red teaming guide](https://www.promptfoo.dev/docs/red-team/)。

## 企业可用性

OpenAI Red Teaming 面向需要托管式 AI 应用和 agent red teaming 服务的企业客户开放。相比独立的本地工作流，企业工作流可以支持更广泛的协作、审查和报告需求。

## Red teaming 与 evals

使用 [evals](/mirror/api/docs/guides/evals) 衡量 AI 系统是否按预期运行。使用 red teaming 探测该系统在对抗性、滥用性或意外输入下的行为。成熟的评估项目通常会同时使用二者。

:::

## English source

::: details 展开英文原文
::: v-pre
Red teaming uses adversarial test cases to help uncover unsafe, insecure, or policy-violating behavior before deployment. It complements evals by focusing on misuse cases, failure modes, and high-risk interactions that ordinary quality testing may not expose.

&lt;strong&gt;Important:&lt;/strong&gt; Only submit to OpenAI Red Teaming code or other
  assets that you own or are expressly authorized to test. Do not use OpenAI Red
  Teaming to analyze or report vulnerabilities in open-source or any third-party
  code without OpenAI's express written permission.

## Use Promptfoo for open-source red teaming

[Promptfoo](https://github.com/promptfoo/promptfoo) is an open-source framework for evaluating prompts, agents, and AI applications. Its red teaming workflows help you generate adversarial test cases, inspect target behavior, and use the results to improve your system.

For the broader open-source methodology, see Promptfoo’s [LLM red teaming guide](https://www.promptfoo.dev/docs/red-team/).

## Enterprise availability

OpenAI Red Teaming is available for enterprise customers that need a managed offering for red teaming AI applications and agents. Enterprise workflows can support broader coordination, review, and reporting needs than a standalone local workflow.

## Red teaming and evals

Use [evals](/mirror/api/docs/guides/evals) to measure whether an AI system behaves as intended. Use red teaming to probe how that system behaves under adversarial, abusive, or unexpected inputs. Mature evaluation programs often use both.

:::
:::

