# Connect from ChatGPT

## Before you begin

You can test your app in ChatGPT with your account using [developer mode](https://platform.openai.com/docs/guides/developer-mode).

Publishing your app for public access is now available through the submission process. You can learn more in our [ChatGPT app submission guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines).

To turn on developer mode, navigate to **Settings → Apps & Connectors → Advanced settings (bottom of the page)**.

From there, you can toggle developer mode if your organization allows it.

Once developer mode is active, you'll see a **Create** button under **Settings → Apps & Connectors**.

As of November 13th, 2025, ChatGPT Apps are supported on all plans, including
  Business, Enterprise, and Education plans.

## Create a connector

Once you have developer mode enabled, you can create a connector for your app in ChatGPT.

1. Ensure your MCP server is reachable over HTTPS (for local development, use [Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) and select **Tunnel** in connector settings, or you can expose a local server to the public internet via a tool such as [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)).
2. In ChatGPT, navigate to **Settings → Connectors → Create**.
3. Provide the metadata for your connector:
   - **Connector name** – a user-facing title such as _Kanban board_.
   - **Description** – explain what the connector does and when to use it. The model uses this text during discovery.
   - **Connector URL** – the public `/mcp` endpoint of your server (for example `https://abc123.ngrok.app/mcp`).
4. Click **Create**. If the connection succeeds you will see a list of the tools your server advertises. If it fails, refer to the [Testing](https://developers.openai.com/apps-sdk/deploy/testing) guide to debug your app with MCP Inspector or the API Playground.

## Try the app

Once your connector is created, you can try it out in a new ChatGPT conversation.

1. Open a new chat in ChatGPT.
2. Click the **+** button near the message composer, and click **More**.
3. Choose the connector for your app in the list of available tools. This will add your app to the conversation context for the model to use.
4. Prompt the model to invoke tools by saying related to your app. For example, “What are my available tasks?” for a Kanban board app.

ChatGPT uses each app's tool annotations and the user's app permission settings to
decide when to request confirmation. Users can choose one of three permission
levels:

- **Always ask**: Ask before retrieving information or making changes.
- **Ask before making changes**: Retrieve information automatically, but ask
  before making changes.
- **Ask only before important changes** (default): Retrieve information and make
  routine changes automatically, but ask before consequential changes such as
  sending, deleting, posting, or purchasing.

For personal accounts, users can set a global permission level or override it for
an individual app in **Settings > Apps**. Eligible confirmation prompts also
offer **Always allow**, which remembers the user's permission for that app.

For Business and Enterprise workspaces, admins control the workspace default and
per-app overrides. Members don't see **Always allow**. Admins can update the
workspace default in **Workspace settings > Permissions & roles > Connected
data**, or configure an individual app from **Admin Apps > App permissions**.

These settings apply to connected apps in ChatGPT. Apps authenticated in Codex
use separate permission controls.

## Refreshing metadata

Whenever you change your tools list or descriptions, you can refresh your MCP server's metadata in ChatGPT.

1. Update your MCP server and redeploy it (unless you are using a local server).
2. In **Settings → Connectors**, click into your connector and choose **Refresh**.
3. Verify the tool list updates and try a few prompts to test the updated flows.

This refresh flow applies to developer mode connectors. Published apps use reviewed [app version snapshots](https://developers.openai.com/apps-sdk/deploy/submission#how-published-app-versions-work). To update a published app's tools or metadata, scan, submit, and publish a new app version.

## Using other clients

You can connect to your MCP server on other clients.

- **API Playground** – visit the [platform playground](https://platform.openai.com/chat), and add your MCP server to the conversation: open **Tools → Add → MCP Server**, and paste the same HTTPS endpoint. This is useful when you want raw request/response logs.
- **Mobile clients** – once the connector is linked on ChatGPT web, it will be available on ChatGPT mobile apps as well. Test mobile layouts early if your component has custom controls.

With the connector linked you can move on to validation, experiments, and eventual rollout.
