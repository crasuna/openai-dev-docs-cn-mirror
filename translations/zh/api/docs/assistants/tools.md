---
status: needs-review
sourceId: 0e7422db0187
sourceChecksum: 0e7422db0187b688ad02250de2cbcfa754467fea1d0166824eb2be452bef4a7b
sourceUrl: https://developers.openai.com/api/docs/assistants/tools
translatedAt: 2026-06-27T16:51:57.1346199+08:00
translator: codex-gpt-5.5-xhigh
---

# Assistants API 工具

## 概览

使用 Assistants API 创建的 Assistant 可以配备工具，使其能够执行更复杂的任务，或与你的应用交互。
我们为 assistant 提供内置工具，但你也可以通过 Function Calling 定义自己的工具来扩展它们的能力。

Assistants API 目前支持以下工具：



<IconItem title="File Search" className="mt-2">
    <span slot="icon">
      </span>
    用于处理并搜索文件的内置 RAG 工具
  </IconItem>




<IconItem title="Code Interpreter" className="mt-2">
    <span slot="icon">
      </span>
    编写和运行 Python 代码，处理文件和多种数据
  </IconItem>




<IconItem title="Function Calling" className="mt-2">
    <span slot="icon">
      </span>
    使用你自己的自定义函数与你的应用交互
  </IconItem>



## 后续步骤

- 查看用于[提交工具输出](https://developers.openai.com/api/docs/api-reference/runs/submitToolOutputs)的 API reference
- 使用我们的 [Quickstart app](https://github.com/openai/openai-assistants-quickstart) 构建一个使用工具的 assistant
