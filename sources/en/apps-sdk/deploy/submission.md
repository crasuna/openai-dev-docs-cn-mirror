# Submit and maintain your app

Learn how to submit your app to the ChatGPT Apps Directory and Codex Plugin Directory.

## App submission overview

Once you have built and [tested your app](https://developers.openai.com/apps-sdk/deploy/testing) in Developer Mode, you can submit it through the current dashboard-based review flow. That flow remains the path to public distribution today. When you publish an approved app, OpenAI creates the plugin for Codex distribution.

Only submit your app if you intend for the resulting plugin to be accessible publicly in the countries you define during submission. For apps you intend to use privately or just within your workspace, use [developer mode](https://platform.openai.com/docs/guides/developer-mode) instead. Submitting an app initiates a review process, and you'll be notified of its status as it moves through review.

Self-serve plugin publishing is coming soon. See the [build plugins guide](https://developers.openai.com/codex/plugins/build) for the packaging model and local testing workflow.

_Before submitting, read and ensure your app complies with our [App Submission Guidelines](https://developers.openai.com/apps-sdk/app-submission-guidelines)._

If your app is approved, the resulting app can be listed in ChatGPT or as a plugin in a shared
directory that users can browse in Codex. Initially, users can discover it in
one of the following ways:

- By clicking a direct link to your app's listing in the directory
- By searching for your app by name

Apps that demonstrate strong real-world utility and high user satisfaction may be eligible for enhanced distribution opportunities—such as directory placement or proactive suggestions.

## Before You Submit: Prerequisites

### Organization verification

Before submitting an app, complete identity verification in the [OpenAI Platform Dashboard](https://platform.openai.com/settings/organization/general) for the name you plan to publish under in the directory.

- **If you want to publish under your own name**, complete **individual verification**.
- **If you want to publish under a business name**, complete **business verification**.

This is enforced during app review. Publishing under an unverified individual or business name will result in rejection.

### App management permissions

To create app drafts and submit them for review, you need the `api.apps.write` permission. To view app drafts and review status in the Dashboard, you need the `api.apps.read` permission. Organization owners automatically have both permissions, and can grant them to non-owners through roles in the [OpenAI Platform Dashboard](https://platform.openai.com/settings/organization/roles).

### MCP server requirements

- Your MCP server is hosted on a publicly accessible domain
- You are not using a local or testing endpoint
- You defined a [content security policy (CSP)](https://developers.openai.com/apps-sdk/build/mcp-server#content-security-policy-csp) to allow the exact domains you fetch from (this is required to submit your app for security reasons)

### Template MCP server URLs

Most apps should submit a universal MCP server URL: a single hosted MCP endpoint that works for all users and organizations.

Choose **Template** only if your app uses workspace-specific MCP server URLs, such as when each customer has a separate tenant, workspace, or managed MCP endpoint. Template submissions require two URL values:

- **MCP Server URL:** A concrete, working MCP endpoint for review and automated checks.
- **Template MCP Server URL:** The URL pattern that describes which part of the MCP endpoint changes across customer workspaces.

The review MCP server URL must be a real endpoint that OpenAI can connect to during submission review. Don't enter a placeholder URL in the **MCP Server URL** field.

Use placeholders in the **Template MCP Server URL** for the parts that a workspace admin will configure later. Placeholders must use `{name}` syntax, start with a letter, and contain only letters, numbers, or underscores. Each placeholder name must be unique.

Make sure the concrete **MCP Server URL** matches the template pattern after replacing each placeholder with a real value.

For example:

```text
https://{workspace}.example.com/mcp
https://mcp.example.com/{tenant}/mcp
```

## Submitting for review

If the prerequisites are met, you can submit your app for review from the [OpenAI Platform Dashboard](http://platform.openai.com/apps-manage).

### Start the review process

From the dashboard:

1. Add your MCP server details (as well as OAuth credentials if OAuth is selected)
2. Complete the required fields in the submission form and check all confirmation boxes. You will need to submit your app name, logo, description, company and privacy policy URLs, MCP and tool information, screenshots, test prompts and responses, and localization information.
3. Click Submit for review. You will receive an email confirming submission with a Case ID which you can reference in any future support requests.

Each organization can publish multiple unique apps, but only one version of each app may be published at a time and only one version of each app may be in review at a time. If you submit an app but wish to make changes, you should withdraw that submission by selecting “Cancel Review” and resubmit the version draft again instead of creating a new app.

_Note that for now, projects with EU data residency cannot submit apps for review. Please use a project with global data residency to submit your apps. If you don't have one, you can create a new project in your current organization from the OpenAI Dashboard._

## App review & approval

Once submitted, your app will enter the review queue. You can review the status of the review within the Dashboard and will receive an email notification informing you of any status changes.

### Reviews and checks

We may perform automated scans or manual reviews to understand how your app works and whether it may conflict with our policies.

### Approval, rejection, and appeals

If your app is approved, we will notify you by email. Once approved, you can publish it from the current dashboard flow. When you publish, OpenAI creates a plugin for Codex distribution.

If your app is rejected or removed, you will receive feedback on which checks were unsuccessful. After making the necessary changes, you may resubmit the app for re-review. Alternatively, if you wish to appeal the decision, you can respond back to the email you received. Make sure to include a clear rationale for the appeal along with any new information that will assist us in our review.

### Getting help

If you have questions before, during, or after submission, and if your question is not answered in the documentation, contact OpenAI support for further assistance. Ensure that you include your OpenAI case ID (which you'll receive via email after submission) to help us to assist you better.

### App review & approval FAQs

**How long does app review take?**

Review timelines may vary as we continue to build and scale our processes. Please do not contact support to request expedited review, as these requests cannot be accommodated.

**What are common rejection reasons and how can I resolve them?**

- **We're unable to connect to your MCP server using the MCP URL and/or test credentials we were given.**
  - For servers requiring authentication, our review team must be able to log into a demo account with no further configuration required.
  - Ensure that the provided URL and credentials are correct, do not feature MFA (including requiring SMS codes, login through systems that require SMS, email or other verification schemes).
  - Ensure that the provided credentials can be used to log in successfully (test them outside any company networks or LANs, or other internal networks).
  - Confirm that the credentials have not expired.
- **One or more of your test cases did not produce correct results.**
  - Review all test cases carefully and rerun each one. Ensure that outputs match the expected results. Verify that there are no errors in the UI (if applicable) - for example, issues with loading content, images, or other UI issues.
  - Ensure that the returned textual output closely adheres to the user's request, and does not offer extraneous information that is irrelevant to the request, including personal identifiers.
  - Ensure that all test cases pass on both ChatGPT web and mobile apps.
  - Compare actual outputs to clearly defined expected behavior for each tool and fix any mismatch so results are relevant to the user's input and the app “reliably does what it promises”.
  - If required, in your resubmission, modify your test cases and expected responses to be clear and unambiguous.
- **Your app returns user-related data types that are not disclosed in your privacy policy.**
  - Audit your MCP tool responses in developer mode by running a few realistic example requests and listing every user-related field your app returns (including nested fields and “debug” payloads). Ensure tools return only what's strictly necessary for the user's request and remove any unnecessary PII, telemetry/internal identifiers (e.g., session/trace/request IDs, timestamps, internal account IDs, logs) and/or any auth secrets (tokens/keys/passwords).
  - You may also consider updating your published privacy policy so it clearly discloses all categories of personal data you collect/process/return and why—if a field isn't truly needed, remove it rather than disclose it.
  - If a user identifier is truly necessary, make it explicitly requested and clearly tied to the user's intent (not “looked up and echoed” by default)
- **Tool hint annotations do not appear to match the tool's behavior:**
  - **readOnlyHint:** Set to `true` if it strictly fetches/looks up/lists/retrieves data and does not modify anything. Set to `false` if the tool can create/update/delete anything, trigger actions (send emails/messages, run jobs, enqueue tasks, write logs, start workflows), or otherwise change state.
  - **destructiveHint:** Set to `true` if it can cause irreversible outcomes (deleting, overwriting, sending messages/transactions you can't undo, revoking access, destructive admin actions, etc.), even in only select modes, via default parameters, or through indirect side effects. Ensure the justification provided clearly describes what is irreversible and under what conditions, including any safeguards like confirmation steps, dry-run options, or scoping constraints. Otherwise, set to `false`.
  - **openWorldHint:** Set to `true` if it can write to or change publicly visible internet state (e.g., posting to social media/blogs/forums, sending emails/SMS/messages to external recipients, creating public tickets/issues, publishing pages, pushing code/content to public endpoints, submitting forms to third parties, or otherwise affecting systems outside a private/first-party context). Set to `false` only if it operates entirely within closed/private systems (including internal writes) and cannot change the state of the publicly visible internet.

## Publication and Distribution

### Publish your app

Once your app is approved, you can publish it from the [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage) by selecting **Publish**. Publishing keeps the current app-based workflow in place. In addition, OpenAI creates a Codex plugin from your approved app.

### Discoverability

Once published, users can find your app by:

- Clicking a direct link to your app in the directory. You can find this link next to the “Published” status for an app on the [Platform App Management page](https://platform.openai.com/apps-manage)
- Searching for your app by name

Apps that demonstrate strong real-world utility and high user satisfaction may be eligible for enhanced distribution opportunities—such as directory placement or proactive suggestions—but few apps will receive enhanced distribution at publication. There is no process by which to request this at this time.

### Publication and Distribution FAQs

**What happens after my app is approved? Will it be listed in the app directory automatically?**

After your app is approved, you can choose to publish it from the [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage). You must publish for it to be listed in the App Directory and Codex Plugin Directory.

**Why can't I see my app in the directory?**

Apps will only be visible to users on the App Directory's main pages if they are selected for enhanced distribution. To confirm your app is published, you can search for the app using the verbatim publication name or by clicking the URL to the app's directory page in the [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage)

**What should I do if I want to issue a press release or public announcement about my app?**

Before issuing any press releases or public announcements regarding the launch of your app, please first reach out to [press@openai.com](mailto:press@openai.com) to coordinate with our communications team.

## Ongoing Maintenance

### How published app versions work

Treat the metadata exposed by your MCP server as a versioned API contract. When you scan a draft app's MCP endpoint in the OpenAI Platform Dashboard, OpenAI stores the discovered metadata with that draft version. Submitting the version sends that stored snapshot for review. The snapshot includes:

- The tool list, names, titles, and descriptions
- Input and output schemas, annotations, and tool security schemes
- Tool `_meta` fields, including UI resource references and visibility
- Linked UI resource metadata, including content security policy (CSP) settings
- MCP server `instructions` returned during initialization

The snapshot does not freeze your MCP server. Tool calls continue to execute against your live endpoint, and your server continues to return live tool results and business data. UI resource contents and `_meta` returned in tool results also remain live; ChatGPT reads UI resource contents from the snapshotted URI at runtime.

Deploying a server change does not update the published snapshot. To make new tools or changed metadata available to users, create or update a draft version, scan its MCP endpoint after deploying your changes, submit it for review, receive approval, and publish it. While the new version is in review, users continue to use the currently published snapshot against your live MCP server.

Breaking changes to published apps are not currently supported. For example, removing or renaming a tool, making an input schema incompatible, or changing or removing the content served at a published UI resource URI can break the published version as soon as the server change deploys. Instead, make backward-compatible updates:

1. Add new tools, fields, or UI resources while continuing to honor the published contracts.
2. Submit the updated metadata as a new app version.
3. Publish the approved version and keep the old contracts available.

You can deploy server-only fixes without submitting a new version if they preserve the published contract. If a deployment breaks the published version, roll back the server change rather than waiting for a new version to complete review.

### Submitting new versions for review

Once your app is published, all submitted information is locked for safety. To make any change, create a new draft version of your existing app and resubmit that version for review (do not create a new app). Each resubmission starts a new review. When submitting changes, include a clear description of what changed in the release notes section of the form.

An app's base MCP server URL cannot change between versions. To use a different base URL, create a new app instead of a new version.

We will review your app again and inform you if the update was approved or rejected via email and in the [OpenAI Platform Dashboard](https://platform.openai.com/apps-manage). Similar to initial reviews, if rejected, you may update and resubmit or appeal the decision.

Once your resubmission is approved, you can publish the update which will replace the previous version of your app.

If you've made additional changes to your app between submission and approval and want to submit a new version for review, you can cancel the review by selecting “Cancel Review” from the three-dot menu next to the app on the [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) and resubmit.

### Changing published app versions and removing your app

Once an app is published, you can change the version published by selecting “Unpublish Version” from the three-dot menu next to the currently published app version on the [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage) and selecting “Publish” next to the app version you'd like to publish instead. You can remove the app from public visibility entirely by selecting “Unpublish Version” and not publishing an alternative version.

To remove the app from your organization and ChatGPT entirely, you can select “Delete App” from the three-dot menu next to the app on the [OpenAI Platform Apps Dashboard](https://platform.openai.com/apps-manage).

### Maintenance requirements

Apps that are inactive, unstable, or non-compliant may be removed. We may reject or remove any app from our services at any time and for any reason without notice, such as for legal or security concerns or policy violations.

### Ongoing Maintenance FAQs

**What happens if users report my app as harmful or misleading?**

OpenAI reviews user reports and may review or investigate your app. Apps that are identified as violating our policies may be restricted or removed. You may appeal a removal or other enforcement action on your app by following the appeals process described here. You should regularly review and respond to feedback and update your app if issues are found.

**How long will app updates take?**

Similar to new app submission reviews, we are unable to offer estimated times for reviews for app updates.
