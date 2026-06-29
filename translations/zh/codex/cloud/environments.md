---
status: needs-review
sourceId: "0fc6ed4349b4"
sourceChecksum: "0fc6ed4349b4ab47f3d9ab976ca711f6864526236ff24bc065ef8e95b19ba0ab"
sourceUrl: "https://developers.openai.com/codex/cloud/environments"
translatedAt: "2026-06-27T11:05:32.948Z"
translator: codex-gpt-5.5-xhigh
---

# Cloud 环境

使用 environments 来控制 Codex 在 cloud tasks 中安装和运行什么。例如，你可以添加依赖、安装 linters 和 formatters 等工具，并设置环境变量。

在 [Codex 设置](https://chatgpt.com/codex/settings/environments)中配置 environments。

## Codex cloud tasks 如何运行

提交 task 后会发生以下流程：

1. Codex 创建一个容器，并在所选分支或 commit SHA 上检出你的 repo。
2. Codex 运行你的 setup script；恢复缓存容器时，还会运行一个可选的 maintenance script。
3. Codex 应用你的互联网访问设置。Setup scripts 会带互联网访问权限运行。Agent 互联网访问默认关闭，但如果需要，你可以启用受限或不受限的访问。请参见 [agent internet access](https://developers.openai.com/codex/cloud/internet-access)。
4. Agent 循环运行终端命令。它会编辑代码、运行检查，并尝试验证自己的工作。如果你的 repo 包含 `AGENTS.md`，agent 会用它查找项目特定的 lint 和 test 命令。
5. Agent 完成后，会显示它的回答以及它修改过的所有文件 diff。你可以打开 PR 或继续提问。

## 默认 universal 镜像

Codex agent 在一个名为 `universal` 的默认容器镜像中运行，该镜像预装了常见语言、包和工具。

在 environment 设置中，选择 **Set package versions** 来固定 Python、Node.js 和其他 runtimes 的版本。

有关已安装内容的详情，请参见
  [openai/codex-universal](https://github.com/openai/codex-universal)，其中包含参考 Dockerfile，以及可拉取并在本地测试的镜像。

虽然 `codex-universal` 为了速度和便利预装了语言，你也可以使用 [setup scripts](#manual-setup) 向容器安装额外包。

## 环境变量和 secrets

**环境变量** 会在 task 的整个持续时间内设置（包括 setup scripts 和 agent 阶段）。

**Secrets** 与环境变量类似，但有以下区别：

- 它们会以额外一层加密存储，并且只会在 task 执行时解密。
- 它们只对 setup scripts 可用。出于安全原因，secrets 会在 agent 阶段开始前被移除。

## 自动 setup

对于使用常见包管理器（`npm`、`yarn`、`pnpm`、`pip`、`pipenv` 和 `poetry`）的项目，Codex 可以自动安装依赖和工具。

## 手动 setup

如果你的开发设置更复杂，也可以提供自定义 setup script。例如：

```bash
# Install type checker
pip install pyright

# Install dependencies
poetry install --with test
pnpm install
```

Setup scripts 会在与 agent 分离的 Bash session 中运行，因此像
  `export` 这样的命令不会保留到 agent 阶段。要保留环境变量，请把它们添加到 `~/.bashrc`，或在 environment 设置中配置。

## 容器缓存

Codex 会缓存容器状态最多 12 小时，以加快新 tasks 和后续跟进的速度。

当 environment 被缓存时：

- Codex 克隆 repository 并检出默认分支。
- Codex 运行 setup script，并缓存生成的容器状态。

当恢复缓存容器时：

- Codex 检出 task 指定的分支。
- Codex 运行 maintenance script（可选）。当 setup script 是在较旧 commit 上运行、而依赖需要更新时，这会很有用。

如果你更改 setup script、maintenance script、环境变量或 secrets，Codex 会自动使缓存失效。如果你的 repo 发生的变化让缓存状态不兼容，请在 environment 页面选择 **Reset cache**。

对于 Business 和 Enterprise 用户，缓存会在所有有权访问该 environment 的用户之间共享。使缓存失效会影响 workspace 中该 environment 的所有用户。

## 互联网访问和网络代理

Setup script 阶段可以访问互联网以安装依赖。在 agent 阶段，互联网访问默认关闭，但你可以配置受限或不受限访问。请参见 [agent internet access](https://developers.openai.com/codex/cloud/internet-access)。

出于安全和防滥用目的，environments 在 HTTP/HTTPS 网络代理后运行。所有出站互联网流量都会经过此代理。
