---
status: needs-review
sourceId: "f53530d201c4"
sourceChecksum: "f53530d201c483fcdf1973a41583e6992ce247d9d8a5db0a5217b051dd9e1599"
sourceUrl: "https://developers.openai.com/apps-sdk/deploy/testing"
translatedAt: "2026-06-27T19:35:17.0701114+08:00"
translator: codex-gpt-5.5-xhigh
---

# 测试你的集成

## 目标

测试用于验证你的 connector 在暴露给用户之前能否以可预测的方式运行。重点关注三个方面：工具正确性、组件 UX 和 discovery 精度。

## 对工具 handler 进行单元测试

- 使用有代表性的输入直接测试每个工具函数。验证 schema validation、错误处理和边界情况（空结果、缺失 ID）。
- 如果你签发 token 或要求 linking，请包含认证流程的自动化测试。
- 让测试 fixtures 靠近你的 MCP 代码，这样它们可以随 schemas 演进保持更新。

## 在开发期间使用 MCP Inspector

[MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) 是本地调试 server 的最快方式：

1. 运行你的 MCP server。
2. 启动 inspector：`npx @modelcontextprotocol/inspector@latest`。
3. 输入你的 server URL（例如 `http://127.0.0.1:2091/mcp`）。
4. 点击 **List Tools** 和 **Call Tool** 检查原始请求和响应。

Inspector 会内联渲染组件，并立即显示错误。为你的发布审核捕获 screenshots。

## 在 ChatGPT developer mode 中验证

当你的 connector 可通过 HTTPS 访问后：

- 在 **Settings → Connectors → Developer mode** 中连接它。
- 在新对话中启用它，并跑一遍你的 golden prompt set（direct、indirect、negative）。记录模型何时选择正确工具、传入了哪些参数，以及确认提示是否按预期出现。
- 在 ChatGPT iOS 或 Android 应用中调用 connector，测试移动端布局。

## 通过 API Playground 连接

如果你需要原始日志，或想在不使用完整 ChatGPT UI 的情况下测试，请打开 [API Playground](https://platform.openai.com/playground)：

1. 选择 **Tools → Add → MCP Server**。
2. 提供你的 HTTPS endpoint 并连接。
3. 发出测试提示，并在右侧面板检查 JSON request/response pairs。

## 发布前回归检查清单

- 工具列表与文档一致，未使用的 prototypes 已移除。
- 每个工具的结构化内容都匹配声明的 `outputSchema`。
- Widgets 渲染时没有 console errors，会注入自己的样式，并能正确恢复状态。
- OAuth 或自定义 auth flows 返回有效 token，并以有意义的消息拒绝无效 token。
- Discovery 在你的 golden prompts 上表现符合预期，并且不会在 negative prompts 上触发。

把发现记录在文档中，这样你就可以逐版本比较结果。持续测试能让你的 connector 随着 ChatGPT 和后端演进保持可靠。
