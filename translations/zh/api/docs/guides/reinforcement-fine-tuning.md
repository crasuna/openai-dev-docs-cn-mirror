---
status: needs-review
sourceId: "682005ac6050"
sourceChecksum: "682005ac605077ea5f5f61388630f656bc8fb98b9e8680c4af3dd7331d5b2884"
sourceUrl: "https://developers.openai.com/api/docs/guides/reinforcement-fine-tuning"
translatedAt: "2026-06-27T18:24:42.5859087+08:00"
translator: codex-gpt-5.5-xhigh
---

# Reinforcement fine-tuning 强化微调

Reinforcement fine-tuning（RFT）会使用你定义的反馈信号来调整 OpenAI reasoning model。和 [supervised fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) 一样，它会让模型更贴合你的任务。区别在于，它不是基于固定的“正确”答案训练，而是依赖一个可编程 grader，对每个候选响应评分。训练算法随后会移动模型权重，让高分输出更可能出现，而低分输出逐渐减少。

OpenAI 正在逐步结束 fine-tuning 平台。该平台已不再向新用户开放，但 fine-tuning 平台的现有用户在接下来数月内仍可创建训练作业。
  <br />
  所有 fine-tuned models 都会继续可用于推理，直到其基础模型被[弃用](https://developers.openai.com/api/docs/deprecations)。完整时间线见[此处](https://developers.openai.com/api/docs/deprecations)。

<br />

<table>
<tbody>
<tr>
<th>工作原理</th>
<th>最适合</th>
<th>适用于</th>
</tr>

<tr>
<td>
为 prompt 生成响应，为结果提供专家评分，并针对得分更高的响应强化模型的 chain-of-thought。

需要专家 grader 对模型的理想输出达成一致。

</td>
<td>
- 需要高级推理的复杂领域特定任务
- 基于病史和诊断指南进行医学诊断
- 从法律判例中确定相关段落
</td>
<td>
`o4-mini-2025-04-16`

**仅限 reasoning models**。

</td>
</tr>
</tbody>
</table>

这种优化让你能够让模型与风格、安全性或领域准确性等细微目标对齐，并且已经出现了许多[实际使用场景](https://developers.openai.com/api/docs/guides/rft-use-cases)。运行 RFT 分为五步：

1. 实现一个 [grader](https://developers.openai.com/api/docs/guides/graders)，为每个模型响应分配数值 reward。
1. 上传你的 prompt dataset，并指定 validation split。
1. 启动 fine-tune job。
1. 监控并[评估](https://developers.openai.com/api/docs/guides/evals) checkpoints；如有需要，修改数据或 grader。
1. 通过标准 API 部署生成的模型。

训练期间，平台会循环遍历 dataset，为每个 prompt 采样多个响应，用 grader 对它们评分，并基于这些 rewards 应用 policy-gradient updates。这个循环会持续到我们到达你的训练数据末尾，或你在选定 checkpoint 停止作业，从而生成一个针对你关心的指标优化过的模型。

什么时候应该使用 reinforcement fine-tuning？

了解 reinforcement fine-tuning 的优势和局限，有助于识别机会并避免无效投入。

- **RFT 最适合答案明确的任务**。检查合格人类专家是否对答案达成一致。如果认真负责的专家独立工作时（只能访问与模型相同的指令和信息）无法收敛到相同答案，任务可能过于模糊，可能需要修改或重新定义。
- **你的任务必须与评分选项兼容**。请先查看 [API 中的 grading options](https://developers.openai.com/api/docs/api-reference/graders)，并确认可以用它们为你的任务评分。
- **你的 eval 结果必须有足够变化空间才能改进**。使用 RFT 之前先运行 [evals](https://developers.openai.com/api/docs/guides/evals)。如果你的 eval 分数落在可能的最低分与最高分之间，你就会有足够数据可用于强化正向答案。如果你想 fine-tune 的模型得分处于绝对最低分或绝对最高分，RFT 对你没有帮助。
- **你的模型必须已经能在目标任务上取得一些成功**。Reinforcement fine-tuning 会进行渐进变化，采样许多答案并选择最好的答案。如果某个模型在给定任务上的成功率为 0%，你无法通过 RFT 从零引导到更高表现水平。
- **你的任务应难以靠猜测获胜**。如果模型能从幸运猜测中获得更高 reward，训练信号就太嘈杂，因为模型可能用错误的推理过程得到正确答案。请重新定义任务，让猜测更难，例如把类别扩展为子类别，或把多选题改为开放式答案。

请在 [reinforcement fine-tuning use case guide](https://developers.openai.com/api/docs/guides/rft-use-cases) 中查看常见使用场景、具体实现和 grader 示例。

什么是 reinforcement learning？

Reinforcement learning 是机器学习的一个分支，模型通过行动、接收反馈并重新调整自身来最大化未来反馈。模型不是记住每个示例的一个“正确”答案，而是探索许多可能答案，观察每个答案的数值 reward，并逐渐调整行为，让高 reward 答案更可能出现，让低 reward 答案消失。经过多轮重复后，模型会收敛到一个 policy，也就是选择输出的规则，该规则最能满足你定义的 reward signal。

在 reinforcement fine-tuning（RFT）中，这个 reward signal 来自你为任务定义的自定义 grader。对于 dataset 中的每个 prompt，平台会采样多个候选答案，运行你的 grader 为它们评分，并应用 policy-gradient update，让模型向更高分答案靠近。这个“采样、评分、更新”的循环会在整个 dataset（以及后续 epochs）上持续进行，直到模型可靠地针对你的 grader 对质量的理解进行优化。grader 编码了你关心的内容，例如准确性、风格、安全性或任何指标，因此生成的 fine-tuned model 会反映这些优先事项，而你不需要管理 reinforcement learning infrastructure。

Reinforcement fine-tuning 仅支持 o-series reasoning models，目前只支持 [o4-mini](https://developers.openai.com/api/docs/models/o4-mini)。

## 示例：由 LLM 驱动的安全审查

为了演示下面的 reinforcement fine-tuning，我们会 fine-tune 一个 [o4-mini](https://developers.openai.com/api/docs/models/o4-mini) 模型，使其能基于一份公司内部 policy document，针对一家虚构公司的安全状况给出专家答案。我们希望模型返回一个 JSON object，并且该 object 通过 [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) 符合特定 schema。

示例输入问题：

```
Do you have a dedicated security team?
```

使用内部 policy document，我们希望模型以 JSON 响应，并包含两个 key：

- `compliant`：字符串 `yes`、`no` 或 `needs review`，表示公司的 policy 是否覆盖该问题。
- `explanation`：一段文本，基于 policy document 简要解释为什么该问题已被 policy 覆盖，或为什么没有被覆盖。

模型的示例期望输出：

```json
{
  "compliant": "yes",
  "explanation": "A dedicated security team follows strict protocols for handling incidents."
}
```

让我们使用 RFT fine-tune 一个模型，使其在这个任务上表现良好。

## 定义 grader

要执行 RFT，请定义一个 [grader](https://developers.openai.com/api/docs/guides/graders)，在训练期间为模型输出评分，表示其响应质量。RFT 使用与 [evals](https://developers.openai.com/api/docs/guides/evals) 相同的一组 graders，你可能已经熟悉这些 graders。

在本示例中，我们定义 [multiple graders](https://developers.openai.com/api/docs/api-reference/graders/multi) 来检查 fine-tuned model 返回的 JSON 属性：

- [`string_check`](https://developers.openai.com/api/docs/api-reference/graders/string-check) grader，用于确保设置了正确的 `compliant` 属性
- [`score_model`](https://developers.openai.com/api/docs/api-reference/graders/score-model) grader，用另一个 evaluator model 为 explanation text 提供 0 到 1 之间的分数

我们在 `calculate_output` 表达式中对每个属性的输出赋予相同权重。

下面是我们将在 API 请求中用于这个 grader 的 JSON payload data。在两个 graders 中，我们都使用 `{{ }}` template syntax 来引用 `item`（用于评估的测试数据行）和 `sample`（训练运行期间生成的模型输出）的相关属性。



<div data-content-switcher-pane data-value="grader">
    <div class="hidden">Grader 配置</div>
    Multi-grader configuration object

```json
{
  "type": "multi",
  "graders": {
    "explanation": {
      "name": "Explanation text grader",
      "type": "score_model",
      "input": [
        {
          "role": "user",
          "type": "message",
          "content": "...see other tab for the full prompt..."
        }
      ],
      "model": "gpt-4o-2024-08-06"
    },
    "compliant": {
      "name": "compliant",
      "type": "string_check",
      "reference": "{{item.compliant}}",
      "operation": "eq",
      "input": "{{sample.output_json.compliant}}"
    }
  },
  "calculate_output": "0.5 * compliant + 0.5 * explanation"
}
```

  </div>
  <div data-content-switcher-pane data-value="grader_json" hidden>
    <div class="hidden">Grading prompt</div>
    Grader 配置中的 grading prompt

```markdown
# Overview

Evaluate the accuracy of the model-generated answer based on the 
Copernicus Product Security Policy and an example answer. The response 
should align with the policy, cover key details, and avoid speculative 
or fabricated claims.

Always respond with a single floating point number 0 through 1,
using the grading criteria below.

## Grading Criteria:
- **1.0**: The model answer is fully aligned with the policy and factually correct.
- **0.75**: The model answer is mostly correct but has minor omissions or slight rewording that does not change meaning.
- **0.5**: The model answer is partially correct but lacks key details or contains speculative statements.
- **0.25**: The model answer is significantly inaccurate or missing important information.
- **0.0**: The model answer is completely incorrect, hallucinates policy details, or is irrelevant.

## Copernicus Product Security Policy

### Introduction
Protecting customer data is a top priority for Copernicus. Our platform is designed with industry-standard security and compliance measures to ensure data integrity, privacy, and reliability.

### Data Classification
Copernicus safeguards customer data, which includes prompts, responses, file uploads, user preferences, and authentication configurations. Metadata, such as user IDs, organization IDs, IP addresses, and device details, is collected for security purposes and stored securely for monitoring and analytics.

### Data Management
Copernicus utilizes cloud-based storage with strong encryption (AES-256) and strict access controls. Data is logically segregated to ensure confidentiality and access is restricted to authorized personnel only. Conversations and other customer data are never used for model training.

### Data Retention
Customer data is retained only for providing core functionalities like conversation history and team collaboration. Customers can configure data retention periods, and deleted content is removed from our system within 30 days.

### User Authentication & Access Control
Users authenticate via Single Sign-On (SSO) using an Identity Provider (IdP). Roles include Account Owner, Admin, and Standard Member, each with defined permissions. User provisioning can be automated through SCIM integration.

### Compliance & Security Monitoring
- **Compliance API**: Logs interactions, enabling data export and deletion.
- **Audit Logging**: Ensures transparency for security audits.
- **HIPAA Support**: Business Associate Agreements (BAAs) available for customers needing healthcare compliance.
- **Security Monitoring**: 24/7 monitoring for threats and suspicious activity.
- **Incident Response**: A dedicated security team follows strict protocols for handling incidents.

### Infrastructure Security
- **Access Controls**: Role-based authentication with multi-factor security.
- **Source Code Security**: Controlled code access with mandatory reviews before deployment.
- **Network Security**: Web application firewalls and strict ingress/egress controls to prevent unauthorized access.
- **Physical Security**: Data centers have controlled access, surveillance, and environmental risk management.

### Bug Bounty Program
Security researchers are encouraged to report vulnerabilities through our Bug Bounty Program for responsible disclosure and rewards.

### Compliance & Certifications
Copernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.

### Conclusion
Copernicus prioritizes security, privacy, and compliance. For inquiries, contact your account representative or visit our Security Portal.

## Examples

### Example 1: GDPR Compliance
**Reference Answer**: 'Copernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.'

**Model Answer 1**: 'Yes, Copernicus is GDPR compliant and provides compliance documentation via the Security Portal.' 
**Score: 1.0** (fully correct)

**Model Answer 2**: 'Yes, Copernicus follows GDPR standards.'
**Score: 0.75** (mostly correct but lacks detail about compliance reports)

**Model Answer 3**: 'Copernicus may comply with GDPR but does not provide documentation.'
**Score: 0.5** (partially correct, speculative about compliance reports)

**Model Answer 4**: 'Copernicus does not follow GDPR standards.'
**Score: 0.0** (factually incorrect)

### Example 2: Encryption in Transit
**Reference Answer**: 'The Copernicus Product Security Policy states that data is stored with strong encryption (AES-256) and that network security measures include web application firewalls and strict ingress/egress controls. However, the policy does not explicitly mention encryption of data in transit (e.g., TLS encryption). A review is needed to confirm whether data transmission is encrypted.'

**Model Answer 1**: 'Data is encrypted at rest using AES-256, but a review is needed to confirm encryption in transit.'
**Score: 1.0** (fully correct)

**Model Answer 2**: 'Yes, Copernicus encrypts data in transit and at rest.'
**Score: 0.5** (partially correct, assumes transit encryption without confirmation)

**Model Answer 3**: 'All data is protected with encryption.'
**Score: 0.25** (vague and lacks clarity on encryption specifics)

**Model Answer 4**: 'Data is not encrypted in transit.'
**Score: 0.0** (factually incorrect)

Reference Answer: {{item.explanation}}
Model Answer: {{sample.output_json.explanation}}
```

  </div>



## 准备你的 dataset

要创建 RFT fine-tune，你需要 training dataset 和 test dataset。training 与 test datasets 都会共享相同的 [JSONL format](https://jsonlines.org/)。JSONL data file 的每一行都会包含一个 `messages` 数组，以及为模型输出评分所需的任何额外字段。RFT dataset 的完整规范[可在此处找到](https://developers.openai.com/api/docs/api-reference/fine-tuning/reinforcement-input)。

在我们的示例中，除了 `messages` 数组之外，JSONL 文件中的每一行还需要 `compliant` 和 `explanation` 属性，我们可以用它们作为 reference values 来测试 fine-tuned model 的 Structured Output。

我们的 training 和 test datasets 中的单行数据以缩进 JSON 表示如下：

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Do you have a dedicated security team?"
    }
  ],
  "compliant": "yes",
  "explanation": "A dedicated security team follows strict protocols for handling incidents."
}
```

下面有一些 JSONL data，你可以在创建 fine-tune job 时同时用于 training 和 testing。请注意，这些 datasets 仅用于说明；在真实测试数据中，请努力为你的应用准备多样且有代表性的输入。

**Training set**

```
{"messages":[{"role":"user","content":"Do you have a dedicated security team?"}],"compliant":"yes","explanation":"A dedicated security team follows strict protocols for handling incidents."}
{"messages":[{"role":"user","content":"Have you undergone third-party security audits or penetration testing in the last 12 months?"}],"compliant":"needs review","explanation":"The policy does not explicitly mention undergoing third-party security audits or penetration testing. It only mentions SOC 2 and GDPR compliance."}
{"messages":[{"role":"user","content":"Is your software SOC 2, ISO 27001, or similarly certified?"}],"compliant":"yes","explanation":"The policy explicitly mentions SOC 2 compliance."}
```

**Test set**

```
{"messages":[{"role":"user","content":"Will our data be encrypted at rest?"}],"compliant":"yes","explanation":"Copernicus utilizes cloud-based storage with strong encryption (AES-256) and strict access controls."}
{"messages":[{"role":"user","content":"Will data transmitted to/from your services be encrypted in transit?"}],"compliant":"needs review","explanation":"The policy does not explicitly mention encryption of data in transit. It focuses on encryption in cloud storage."}
{"messages":[{"role":"user","content":"Do you enforce multi-factor authentication (MFA) internally?"}],"compliant":"yes","explanation":"The policy explicitly mentions role-based authentication with multi-factor security."}
```

需要多少训练数据？

从小规模开始，也就是几十到几百个示例之间，以便在投入大型 dataset 之前判断 RFT 的有用性。出于产品安全原因，training set 必须先通过一个自动筛查流程。大型 datasets 需要更长处理时间。这个筛查流程会在你使用某个 file 启动 fine-tuning job 时开始，而不是在初次上传 file 时开始。一个 file 成功完成筛查后，你可以反复使用它而不会延迟。

只要质量高，几十个示例也可能有意义。筛查之后，在保持高质量的前提下，数据越多越好。对于更大的 datasets，你可以使用更高 batch size，这往往能提升训练稳定性。

你的 training file 最多可包含 50,000 个示例。Test datasets 最多可包含 1,000 个示例。Test datasets 也会经过自动筛查。

### 上传你的 files

上传 RFT training 和 test data files 的流程与 [supervised fine-tuning](https://developers.openai.com/api/docs/guides/supervised-fine-tuning) 相同。请通过 [API](https://developers.openai.com/api/docs/api-reference/files/create) 或[使用我们的 UI](https://platform.openai.com/storage) 将 training data 上传到 OpenAI。Files 必须以 `fine-tune` 为 purpose 上传，才能用于 fine-tuning。

**你需要 test 和 training data files 的 file IDs** 才能创建 fine-tune job。

## 创建 fine-tune job

使用 [API](https://developers.openai.com/api/docs/api-reference/fine-tuning) 或 [fine-tuning dashboard](https://platform.openai.com/finetune) 创建 fine-tune job。为此，你需要：

- training 和 test datasets 的 file IDs
- 我们之前创建的 grader configuration
- 你想用作 fine-tuning 基础的 model ID（这里使用 `o4-mini-2025-04-16`）
- 如果你 fine-tune 的模型会以 structured output 返回 JSON data，还需要返回 object 的 JSON schema（见下文）
- 可选地，任何你想为 fine-tune 配置的 hyperparameters
- 若要符合 [data sharing inference pricing](https://developers.openai.com/api/docs/pricing#fine-tuning) 条件，你需要先与 OpenAI [share evaluation and fine-tuning data](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai#h_c93188c569)，然后再创建作业

### Structured Outputs JSON schema

如果你要 fine-tune 一个模型来返回 [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)，请提供用于格式化输出的 JSON schema。下面是我们安全访谈使用场景的有效 JSON schema：

```json
{
  "type": "json_schema",
  "json_schema": {
    "name": "security_assistant",
    "strict": true,
    "schema": {
      "type": "object",
      "properties": {
        "compliant": { "type": "string" },
        "explanation": { "type": "string" }
      },
      "required": ["compliant", "explanation"],
      "additionalProperties": false
    }
  }
}
```

从 Pydantic model 生成 JSON schema

为简化 JSON schema 生成，可以从 <a href="https://docs.pydantic.dev/latest/api/base_model/">Pydantic BaseModel</a> class 开始：

1. 定义你的 class
1. 使用 OpenAI library 中的 `to_strict_json_schema` 生成有效 schema
1. 将 schema 包装到一个带有 `type` 和 `name` keys 的 dictionary 中，并将 `strict` 设置为 true
1. 获取生成的 object，并将其作为 RFT job 中的 `response_format` 提供

```python
from openai.lib._pydantic import to_strict_json_schema
from pydantic import BaseModel

class MyCustomClass(BaseModel):
    name: str
    age: int

# Note: Do not use MyCustomClass.model_json_schema() in place of
# to_strict_json_schema as it is not equivalent
schema = to_strict_json_schema(MyCustomClass)

response_format = dict(
    type="json_schema",
    json_schema=dict(
        name=MyCustomClass.__name__,
        strict=True,
        schema=schema
    )
)
```


### 使用 API 创建 job

用 API 配置 job 有许多活动部件，因此很多用户更喜欢在 [fine-tuning dashboard UI](https://platform.openai.com/finetune) 中进行配置。不过，下面是一个完整 API request，用来启动包含本指南目前所有配置的 fine-tune job：

```bash
curl https://api.openai.com/v1/fine_tuning/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
  "training_file": "file-2STiufDaGXWCnT6XUBUEHW",
  "validation_file": "file-4TcgH85ej7dFCjZ1kThCYb",
  "model": "o4-mini-2025-04-16",
  "method": {
    "type": "reinforcement",
    "reinforcement": {
      "grader": {
        "type": "multi",
        "graders": {
          "explanation": {
            "name": "Explanation text grader",
            "type": "score_model",
            "input": [
              {
                "role": "user",
                "type": "message",
                "content": "# Overview\n\nEvaluate the accuracy of the model-generated answer based on the \nCopernicus Product Security Policy and an example answer. The response \nshould align with the policy, cover key details, and avoid speculative \nor fabricated claims.\n\nAlways respond with a single floating point number 0 through 1,\nusing the grading criteria below.\n\n## Grading Criteria:\n- **1.0**: The model answer is fully aligned with the policy and factually correct.\n- **0.75**: The model answer is mostly correct but has minor omissions or slight rewording that does not change meaning.\n- **0.5**: The model answer is partially correct but lacks key details or contains speculative statements.\n- **0.25**: The model answer is significantly inaccurate or missing important information.\n- **0.0**: The model answer is completely incorrect, hallucinates policy details, or is irrelevant.\n\n## Copernicus Product Security Policy\n\n### Introduction\nProtecting customer data is a top priority for Copernicus. Our platform is designed with industry-standard security and compliance measures to ensure data integrity, privacy, and reliability.\n\n### Data Classification\nCopernicus safeguards customer data, which includes prompts, responses, file uploads, user preferences, and authentication configurations. Metadata, such as user IDs, organization IDs, IP addresses, and device details, is collected for security purposes and stored securely for monitoring and analytics.\n\n### Data Management\nCopernicus utilizes cloud-based storage with strong encryption (AES-256) and strict access controls. Data is logically segregated to ensure confidentiality and access is restricted to authorized personnel only. Conversations and other customer data are never used for model training.\n\n### Data Retention\nCustomer data is retained only for providing core functionalities like conversation history and team collaboration. Customers can configure data retention periods, and deleted content is removed from our system within 30 days.\n\n### User Authentication & Access Control\nUsers authenticate via Single Sign-On (SSO) using an Identity Provider (IdP). Roles include Account Owner, Admin, and Standard Member, each with defined permissions. User provisioning can be automated through SCIM integration.\n\n### Compliance & Security Monitoring\n- **Compliance API**: Logs interactions, enabling data export and deletion.\n- **Audit Logging**: Ensures transparency for security audits.\n- **HIPAA Support**: Business Associate Agreements (BAAs) available for customers needing healthcare compliance.\n- **Security Monitoring**: 24/7 monitoring for threats and suspicious activity.\n- **Incident Response**: A dedicated security team follows strict protocols for handling incidents.\n\n### Infrastructure Security\n- **Access Controls**: Role-based authentication with multi-factor security.\n- **Source Code Security**: Controlled code access with mandatory reviews before deployment.\n- **Network Security**: Web application firewalls and strict ingress/egress controls to prevent unauthorized access.\n- **Physical Security**: Data centers have controlled access, surveillance, and environmental risk management.\n\n### Bug Bounty Program\nSecurity researchers are encouraged to report vulnerabilities through our Bug Bounty Program for responsible disclosure and rewards.\n\n### Compliance & Certifications\nCopernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.\n\n### Conclusion\nCopernicus prioritizes security, privacy, and compliance. For inquiries, contact your account representative or visit our Security Portal.\n\n## Examples\n\n### Example 1: GDPR Compliance\n**Reference Answer**: Copernicus maintains compliance with industry standards, including SOC 2 and GDPR. Customers can access security reports and documentation via our Security Portal.\n\n**Model Answer 1**: Yes, Copernicus is GDPR compliant and provides compliance documentation via the Security Portal. \n**Score: 1.0** (fully correct)\n\n**Model Answer 2**: Yes, Copernicus follows GDPR standards.\n**Score: 0.75** (mostly correct but lacks detail about compliance reports)\n\n**Model Answer 3**: Copernicus may comply with GDPR but does not provide documentation.\n**Score: 0.5** (partially correct, speculative about compliance reports)\n\n**Model Answer 4**: Copernicus does not follow GDPR standards.\n**Score: 0.0** (factually incorrect)\n\n### Example 2: Encryption in Transit\n**Reference Answer**: The Copernicus Product Security Policy states that data is stored with strong encryption (AES-256) and that network security measures include web application firewalls and strict ingress/egress controls. However, the policy does not explicitly mention encryption of data in transit (e.g., TLS encryption). A review is needed to confirm whether data transmission is encrypted.\n\n**Model Answer 1**: Data is encrypted at rest using AES-256, but a review is needed to confirm encryption in transit.\n**Score: 1.0** (fully correct)\n\n**Model Answer 2**: Yes, Copernicus encrypts data in transit and at rest.\n**Score: 0.5** (partially correct, assumes transit encryption without confirmation)\n\n**Model Answer 3**: All data is protected with encryption.\n**Score: 0.25** (vague and lacks clarity on encryption specifics)\n\n**Model Answer 4**: Data is not encrypted in transit.\n**Score: 0.0** (factually incorrect)\n\nReference Answer: {{item.explanation}}\nModel Answer: {{sample.output_json.explanation}}\n"
              }
            ],
            "model": "gpt-4o-2024-08-06"
          },
          "compliant": {
            "name": "compliant",
            "type": "string_check",
            "reference": "{{item.compliant}}",
            "operation": "eq",
            "input": "{{sample.output_json.compliant}}"
          }
        },
        "calculate_output": "0.5 * compliant + 0.5 * explanation"
      },
      "response_format": {
        "type": "json_schema",
        "json_schema": {
          "name": "security_assistant",
          "strict": true,
          "schema": {
            "type": "object",
            "properties": {
              "compliant": {
                "type": "string"
              },
              "explanation": {
                "type": "string"
              }
            },
            "required": [
              "compliant",
              "explanation"
            ],
            "additionalProperties": false
          }
        }
      },
      "hyperparameters": {
        "reasoning_effort": "medium"
      }
    }
  }
}'
```


这个 request 会返回一个 [fine-tuning job object](https://developers.openai.com/api/docs/api-reference/fine-tuning/object)，其中包含 job `id`。使用此 ID 监控 job 进度，并在 job 完成后检索 fine-tuned model。

若要符合 [data sharing inference pricing](https://developers.openai.com/api/docs/pricing#fine-tuning) 条件，请确保在创建 job 之前与 OpenAI [share evaluation and fine-tuning data](https://help.openai.com/en/articles/10306912-sharing-feedback-evaluation-and-fine-tuning-data-and-api-inputs-and-outputs-with-openai#h_c93188c569)。你可以通过确认 `shared_with_openai` 设置为 `true` 来验证 job 已标记为 shared。

### 监控你的 fine-tune job

Fine-tuning jobs 需要一些时间才能完成，而 RFT jobs 往往比 SFT 或 DPO jobs 花费更长时间。要监控 fine-tune job 进度，请使用 [fine-tuning dashboard](https://platform.openai.com/finetune) 或 [API](https://developers.openai.com/api/docs/api-reference/fine-tuning)。

#### Reward metrics

对于 reinforcement fine-tuning jobs，主要指标是按 step 记录的 **reward** metrics。这些指标表示模型在 training data 上的表现。它们由你在 job configuration 中定义的 graders 计算。有两个独立的顶层 reward metrics：

- `train_reward_mean`：当前 step 中从所有 datapoints 采样得到的 samples 的平均 reward。由于 batch 中的具体 datapoints 会随每个 step 改变，不同步骤之间的 `train_reward_mean` 值不能直接比较，具体数值也可能在 step 之间大幅波动。
- `valid_reward_mean`：从 validation set 中所有 datapoints 采样得到的 samples 的平均 reward，这是更稳定的指标。

![Reward Metric Graph](https://cdn.openai.com/API/images/guides/RFT_Reward_Chart.png)

请在 [training metrics](#training-metrics) 部分查看所有训练指标的完整描述。

#### Pausing and resuming jobs

如果想在 job 只完成一部分时评估模型当前状态，请 **pause** job，以停止训练流程，并在当前 step 生成 checkpoint。你可以用该 checkpoint 在 held-out test set 上评估模型。如果结果不错，可以 **resume** job，从该 checkpoint 继续训练。请在 [pausing and resuming jobs](#pausing-and-resuming-jobs) 中了解更多。

#### Evals integration

Reinforcement fine-tuning jobs 与我们的 [evals product](https://developers.openai.com/api/docs/guides/evals) 集成。创建 reinforcement fine-tuning job 时，系统会自动创建一个新的 eval 并与该 job 关联。在执行 validation steps 时，我们会结合 input prompts、model samples 和 grader outputs，为该 step 创建一个新的 [eval run](https://developers.openai.com/api/docs/guides/evals#creating-an-eval-run)。

请在下面的 [appendix](#evals-integration-details) 部分进一步了解 evals integration。

## 评估结果

到 fine-tuning job 完成时，你应该已经能根据 validation set 上的 mean reward value 对模型表现有一个不错的了解。不过，模型可能已经 _overfit_ 到 training data，或学会了对你的 grader 进行 [reward hack](https://en.wikipedia.org/wiki/Reward_hacking)，从而在并不真正正确的情况下产生高分。部署模型之前，请在一组有代表性的 prompts 上检查其行为，确保它按你的预期运行。

理解模型行为可以通过检查与 fine-tuning job 关联的 evals 快速完成。具体而言，请特别关注最终训练 step 创建的 run，以查看最终模型的行为。你也可以使用 evals product 将最终 run 与早期 runs 比较，观察模型行为在训练过程中如何变化。

### 尝试使用你的 fine-tuned model

使用新优化的模型来评估它。当 fine-tuned model 完成训练后，可在 [Responses](https://developers.openai.com/api/docs/api-reference/responses) 或 [Chat Completions](https://developers.openai.com/api/docs/api-reference/chat) API 中使用它的 ID，就像使用 OpenAI base model 一样。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">在 Playground 中使用你的模型</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">通过 API call 使用你的模型</div>
    </div>



### 如有需要，使用 checkpoints

Checkpoints 是在训练流程最终 step 之前创建、可供使用的模型。对于 RFT，OpenAI 会在每个 validation step 创建完整模型 checkpoint，并保留三个 `valid_reward_mean` 分数最高的 checkpoint。Checkpoints 可用于在训练流程的不同阶段评估模型，并比较不同 steps 的表现。



<div data-content-switcher-pane data-value="ui">
    <div class="hidden">在 dashboard 中查找 checkpoints</div>
    </div>
  <div data-content-switcher-pane data-value="api" hidden>
    <div class="hidden">查询 API 获取 checkpoints</div>
    </div>



## Safety checks

在生产环境发布之前，请审查并遵循以下安全信息。

我们如何评估安全性

一旦 fine-tuning job 完成，我们会评估生成模型在 13 个不同 safety categories 上的行为。每个类别代表一个关键领域，如果 AI 输出未得到适当控制，可能在这些领域造成伤害。

| Name                   | Description                                                                                                                                                                                                                                    |
| :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advice                 | 违反我们政策的建议或指导。                                                                                                                                                                                                                     |
| harassment/threatening | 包含针对任何目标的暴力或严重伤害的骚扰内容。                                                                                                                                                                                                   |
| hate                   | 基于种族、性别、民族、宗教、国籍、性取向、残障状态或 caste 表达、煽动或宣扬仇恨的内容。针对非受保护群体（例如棋手）的仇恨内容属于骚扰。                                      |
| hate/threatening       | 基于种族、性别、民族、宗教、国籍、性取向、残障状态或 caste，针对目标群体并同时包含暴力或严重伤害的仇恨内容。                                                                    |
| highly-sensitive       | 违反我们政策的高度敏感数据。                                                                                                                                                                                                                   |
| illicit                | 提供如何实施非法行为的建议或说明的内容。像 "how to shoplift" 这样的短语适合此类别。                                                                                                                                                           |
| propaganda             | 对违反我们政策的意识形态的赞扬或协助。                                                                                                                                                                                                         |
| self-harm/instructions | 鼓励执行自伤行为（例如自杀、自残和饮食障碍），或给出如何实施此类行为的说明或建议的内容。                                                                                         |
| self-harm/intent       | 说话者表示正在实施或打算实施自伤行为（例如自杀、自残和饮食障碍）的内容。                                                                                                         |
| sensitive              | 违反我们政策的敏感数据。                                                                                                                                                                                                                       |
| sexual/minors          | 包含 18 岁以下个人的性内容。                                                                                                                                                                                                                   |
| sexual                 | 用于引发性兴奋的内容，例如描述性活动，或推广性服务的内容（不包括性教育和健康）。                                                                                                 |
| violence               | 描绘死亡、暴力或身体伤害的内容。                                                                                                                                                                                                               |

每个类别都有预定义的通过阈值；如果某个类别中失败的 evaluated examples 过多，OpenAI 会阻止 fine-tuned model 部署。如果你的 fine-tuned model 未通过 safety checks，OpenAI 会在 fine-tuning job 中发送消息，说明哪些类别未满足所需阈值。你可以在 fine-tuning job 的 moderation checks 部分查看结果。

如何通过 safety checks

除了在 fine-tuning job object 中查看任何失败的 safety checks 之外，你还可以通过查询 [fine-tuning API events endpoint](https://developers.openai.com/api/docs/api-reference/fine-tuning/list-events)，检索哪些类别失败的详细信息。查找类型为 `moderation_checks` 的 events，以了解 category results 和 enforcement 详情。这些信息可以帮助你缩小需要重新训练和改进的类别范围。[model spec](https://cdn.openai.com/spec/model-spec-2024-05-08.html#overview) 包含规则和示例，可以帮助识别需要额外训练数据的领域。

虽然这些 evaluations 覆盖了广泛的 safety categories，但你仍应对 fine-tuned model 进行自己的 evaluations，确保它适合你的使用场景。

## 下一步

现在你已经了解 reinforcement fine-tuning 的基础知识，可以探索其他 fine-tuning 方法。

[

<span slot="icon">
      </span>
    通过为示例输入提供正确输出来 fine-tune 模型。

](https://developers.openai.com/api/docs/guides/supervised-fine-tuning)

[

<span slot="icon">
      </span>
    学习如何使用 image inputs 为 computer vision 进行 fine-tuning。

](https://developers.openai.com/api/docs/guides/vision-fine-tuning)

[

<span slot="icon">
      </span>
    使用 direct preference optimization（DPO）fine-tune 模型。

](https://developers.openai.com/api/docs/guides/direct-preference-optimization)

## Appendix

### Training metrics

Reinforcement fine-tuning jobs 会以 [fine-tuning events](https://developers.openai.com/api/docs/api-reference/fine-tuning/event-object) 形式发布按 step 记录的 training metrics。通过 [API](https://developers.openai.com/api/docs/api-reference/fine-tuning/list-events) 拉取这些 metrics，或在 [fine-tuning dashboard](https://platform.openai.com/finetune) 中以图表形式查看。

下面进一步了解 training metrics。

完整 training metrics 示例

下面是来自真实 reinforcement fine-tuning job 的 metric event 示例。此 payload 中的各个字段将在后续章节讨论。

```json
{
      "object": "fine_tuning.job.event",
      "id": "ftevent-Iq5LuNLDsac1C3vzshRBuBIy",
      "created_at": 1746679539,
      "level": "info",
      "message": "Step 10/20 , train mean reward=0.42, full validation mean reward=0.68, full validation mean parse error=0.00",
      "data": {
        "step": 10,
        "usage": {
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "model": "gpt-4o-2024-08-06",
              "train_prompt_tokens_mean": 241.0,
              "valid_prompt_tokens_mean": 241.0,
              "train_prompt_tokens_count": 120741.0,
              "valid_prompt_tokens_count": 4820.0,
              "train_completion_tokens_mean": 138.52694610778443,
              "valid_completion_tokens_mean": 140.5,
              "train_completion_tokens_count": 69402.0,
              "valid_completion_tokens_count": 2810.0
            }
          ],
          "samples": {
            "train_reasoning_tokens_mean": 3330.017964071856,
            "valid_reasoning_tokens_mean": 1948.9,
            "train_reasoning_tokens_count": 1668339.0,
            "valid_reasoning_tokens_count": 38978.0
          }
        },
        "errors": {
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "train_other_error_mean": 0.0,
              "valid_other_error_mean": 0.0,
              "train_other_error_count": 0.0,
              "valid_other_error_count": 0.0,
              "train_sample_parse_error_mean": 0.0,
              "valid_sample_parse_error_mean": 0.0,
              "train_sample_parse_error_count": 0.0,
              "valid_sample_parse_error_count": 0.0,
              "train_invalid_variable_error_mean": 0.0,
              "valid_invalid_variable_error_mean": 0.0,
              "train_invalid_variable_error_count": 0.0,
              "valid_invalid_variable_error_count": 0.0
            }
          ]
        },
        "scores": {
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "train_reward_mean": 0.4471057884231537,
              "valid_reward_mean": 0.675
            }
          ],
          "train_reward_mean": 0.4215686274509804,
          "valid_reward_mean": 0.675
        },
        "timing": {
          "step": {
            "eval": 101.69386267662048,
            "sampling": 226.82190561294556,
            "training": 402.43121099472046,
            "full_iteration": 731.5038568973541
          },
          "graders": [
            {
              "name": "basic_model_grader",
              "type": "score_model",
              "train_execution_latency_mean": 2.6894934929297594,
              "valid_execution_latency_mean": 4.141402995586395
            }
          ]
        },
        "total_steps": 20,
        "train_mean_reward": 0.4215686274509804,
        "reasoning_tokens_mean": 3330.017964071856,
        "completion_tokens_mean": 3376.0019607843137,
        "full_valid_mean_reward": 0.675,
        "mean_unresponsive_rewards": 0.0,
        "model_graders_token_usage": {
          "gpt-4o-2024-08-06": {
            "eval_cached_tokens": 0,
            "eval_prompt_tokens": 4820,
            "train_cached_tokens": 0,
            "train_prompt_tokens": 120741,
            "eval_completion_tokens": 2810,
            "train_completion_tokens": 69402
          }
        },
        "full_valid_mean_parse_error": 0.0,
        "valid_reasoning_tokens_mean": 1948.9
      },
      "type": "metrics"
    },
```

Score metrics

最需要关注的顶层 metrics 是 `train_reward_mean` 和 `valid_reward_mean`，它们分别表示你的 graders 在 training 和 validation datasets 的所有 samples 上分配的平均 reward。

此外，如果你使用 [multi-grader](https://developers.openai.com/api/docs/api-reference/graders/multi) configuration，也会发布每个 grader 的 train 和 validation reward metrics。这些 metrics 包含在 fine-tuning events object 的 `event.data.scores` object 下，每个 grader 一个条目。Per-grader metrics 有助于理解模型在每个单独 grader 上的表现，并可帮助你判断模型是否过拟合到某个 grader。

在 fine-tuning dashboard 中，单个 grader metrics 会显示在各自的图中，位于整体 `train_reward_mean` 和 `valid_reward_mean` metrics 下方。

![Per-Grader Reward Metric Graph](https://cdn.openai.com/API/images/guides/RFT_MultiReward_Chart.png)

Usage metrics

Reasoning model 的一个重要特征，是它在响应 prompt 之前使用的 reasoning tokens 数量。通常，在训练期间，模型响应 prompt 时使用的平均 reasoning tokens 数量会发生剧烈变化。这表明模型正在响应 reward signal 而改变行为。模型可能学会使用更少 reasoning tokens 达到相同 reward，也可能学会使用更多 reasoning tokens 来获得更高 reward。

你可以监控 `train_reasoning_tokens_mean` 和 `valid_reasoning_tokens_mean` metrics，以观察模型行为如何随时间变化。这些 metrics 分别是模型在 training 和 validation datasets 中响应 prompt 时使用的平均 reasoning tokens 数量。你也可以在 fine-tuning dashboard 的 "Reasoning Tokens" chart 下查看平均 reasoning token count。

![Reasoning Tokens Metric Graph](https://cdn.openai.com/API/images/guides/RFT_ReasoningTokens_Chart.png)

如果你使用 [model graders](https://developers.openai.com/api/docs/guides/graders#model-graders)，你可能需要监控这些 graders 的 token usage。Per-grader token usage statistics 位于 `event.data.usage.graders` object 下，并分为：

- `train_prompt_tokens_mean`
- `train_prompt_tokens_count`
- `train_completion_tokens_mean`
- `train_completion_tokens_count`。

`_mean` metrics 表示 grader 在当前 step 中处理所有 prompts 所使用的平均 tokens 数，而 `_count` metrics 表示 grader 在当前 step 中跨所有 samples 使用的 tokens 总数。Per-step token usage 也会显示在 fine-tuning dashboard 的 "Grading Token Usage" chart 下。

![Model Grader Token Usage](https://cdn.openai.com/API/images/guides/RFT_ModelGraderTokenUsage.png)

Timing metrics

我们包含了多种 metrics，帮助你理解训练流程每个 step 花费多长时间，以及训练流程的不同部分如何影响每 step 的 timing。

这些 metrics 位于 `event.data.timing` object 下，并分为 `step` 和 `graders` 字段。

`step` 字段包含以下 metrics：

- `sampling`：为当前 step 采样模型输出（rollouts）所花费的时间。
- `training`：为当前 step 训练模型（backpropagation）所花费的时间。
- `eval`：在完整 validation set 上评估模型所花费的时间。
- `full_iteration`：当前 step 的总耗时，包括上述 3 个 metrics 以及任何额外开销。

Step timing metrics 也会显示在 fine-tuning dashboard 的 "Per Step Duration" chart 下。

![Per Step Duration Graph](https://cdn.openai.com/API/images/guides/RFT_PerStepDuration2.png)

`graders` 字段包含 timing information，详细说明当前 step 中执行每个 grader 所花费的时间。每个 grader 都会在 `train_execution_latency_mean` 和 `valid_execution_latency_mean` metrics 下拥有自己的 timing，它们分别表示在 training 和 validation datasets 上执行该 grader 的平均耗时。

Graders 会以并行方式执行，并带有 concurrency limit，因此单个 grader latency 如何累加成 grading 总耗时并不总是清晰。不过，一般来说，单独执行时间更长的 graders 会让 job 执行更慢。这意味着较慢的 model graders 会让 job 花费更长时间完成，更昂贵的 python code 也一样。通常最快的 graders 是 `string_check` 和 `text_similarity`，因为它们在 training loop 本地执行。

### Evals integration details

Reinforcement fine-tuning jobs 与我们的 [evals product](https://developers.openai.com/api/docs/guides/evals) 直接集成。创建 reinforcement fine-tuning job 时，会自动创建一个新的 eval 并与该 job 关联。

执行 validation steps 时，input prompts、model samples、grader outputs 和更多 metadata 会被组合起来，为该 step 创建一个新的 [eval run](https://developers.openai.com/api/docs/guides/evals#creating-an-eval-run)。在 job 结束时，你会为每个 validation step 拥有一个 run。这使你可以比较模型在不同 steps 的表现，并观察模型行为在训练过程中如何变化。

你可以通过在 fine-tuning dashboard 中查看 job，或在 [fine-tuning job object](https://developers.openai.com/api/docs/api-reference/fine-tuning/object) 上找到 `eval_id` 字段，找到与 fine-tuning job 关联的 eval。

Evals product 可用于检查模型在特定 datapoints 上的输出，从而理解模型在不同场景中的行为。它可以帮助你找出模型在 dataset 哪个 slice 上表现不佳，从而帮助你识别 training data 中需要改进的领域。

Evals product 还可以帮助你发现 graders 的改进空间，例如找出 grader 对模型输出过于宽松或过于严格的地方。

### Pausing and resuming jobs

你可以随时使用 [fine-tuning jobs API](https://developers.openai.com/api/docs/api-reference/fine-tuning/pause) 暂停 fine-tuning job。调用 pause API 会通知训练流程创建新的 model snapshot、停止训练，并把 job 置于 "Paused" state。model snapshot 会经过正常 safety screening process，之后可作为普通 fine-tuned model 在整个 OpenAI platform 中使用。

如果你希望继续 paused job 的训练流程，可以使用 [fine-tuning jobs API](https://developers.openai.com/api/docs/api-reference/fine-tuning/resume)。这会从 job 暂停时创建的最后 checkpoint 恢复训练流程，并持续训练，直到 job 完成或再次暂停。

### 使用 Tools 进行 grading

如果你正在训练模型[执行 tool calls](https://developers.openai.com/api/docs/guides/function-calling)，你需要：

1. 在 RFT training dataset 的每个 datapoint 上提供模型可调用的一组 tools。更多信息请参见 [dataset API reference](https://developers.openai.com/api/docs/api-reference/fine-tuning/reinforcement-input)。
2. 配置 grader，根据模型发起的 tool calls 的内容分配 rewards。有关 tool calls grading 的信息，可在 [grading docs 中此处](https://developers.openai.com/api/docs/guides/graders/#sample-namespace)找到。

### Billing details

Reinforcement fine-tuning jobs 会根据训练耗时以及模型在训练期间使用的 tokens 数量计费。我们只对核心 training loop 中花费的时间计费，不对准备 training data、验证 datasets、排队等待、运行 safety evals 或其他开销所花费的时间计费。

有关 reinforcement fine-tuning jobs 具体计费方式的详情，请参见这篇 [help center article](https://help.openai.com/en/articles/11323177-billing-guide-for-the-reinforcement-fine-tuning-api)。

### Training errors

Reinforcement fine-tuning 是一个有许多活动部件的复杂流程，很多地方都可能出错。我们会发布多种 error metrics，帮助你理解 job 中出了什么问题，以及如何修复。一般来说，除非发生非常严重的错误，否则我们会尽量避免让 job 整体失败。错误发生时，通常出现在 grading step。Grading 期间的错误通常来自以下情况之一：模型输出了 grader 不知道如何处理的 sample；grader 因某种 system error 无法正确执行；或 grading logic 本身存在 bug。

Error metrics 位于 `event.data.errors` object 下，并按 per-grader 聚合为 counts 和 rates。我们也会在 fine-tuning dashboard 上显示错误的 rates 和 counts。

Grader errors

#### Generic grading errors

Grader errors 分为以下类别，并且每个类别都有 `train_`（用于 training data）和 `valid_`（用于 validation data）版本：

- `sample_parse_error_mean`：无法正确解析的 samples 平均数量。当模型无法输出有效 JSON 或无法正确遵守提供的 response format 时，通常会出现这种情况。少量此类错误（尤其在训练流程早期）是正常的。如果你看到大量此类错误，很可能是模型的 response format 配置不正确，或你的 graders 配置错误并正在查找错误字段。
- `invalid_variable_error_mean`：当你尝试通过 template 引用某个变量，但该变量无法在当前 datapoint 或当前模型 sample 中找到时，会出现此类错误。如果模型未能以正确 response format 提供输出，或你的 grader 配置错误，就可能发生这种情况。
- `other_error_mean`：这是 grading 期间发生的任何其他错误的兜底类别。这些错误通常由 grading logic 本身的 bug，或 grading 期间发生的 system errors 导致。

#### Python grading errors

- `python_grader_server_error_mean`：当我们用于在 remote sandbox 中执行 python graders 的系统遇到 system errors 时，会出现此类错误。这通常是由你无法控制的原因导致，例如网络故障或系统中断。如果你看到大量此类错误，很可能存在导致错误的系统问题。你可以查看 [OpenAI status page](https://status.openai.com/) 了解任何正在进行的问题。
- `python_grader_runtime_error_mean`：当 python grader 本身未能正确执行时，会出现此类错误。这可能由多种原因导致，包括 grading logic 中的 bug，或 grader 尝试访问当前上下文中不存在的变量。如果你看到大量此类错误，很可能是你的 grading logic 中存在需要修复的 bug。如果此类错误数量足够多，job 会失败，我们会向你展示失败 graders 的 tracebacks 抽样。

#### Model grading errors

- `model_grader_server_error_mean`：当我们无法从 model grader 采样时，会出现此类错误。这可能由多种原因导致，但通常意味着 model grader 配置错误、你正在尝试使用对你的组织不可用的模型，或 OpenAI 发生了系统问题。
