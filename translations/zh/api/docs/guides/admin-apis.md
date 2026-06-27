---
status: needs-review
sourceId: 8def0ba9c37e
sourceChecksum: 8def0ba9c37e7107194ee79fc5d1dfb2367647d3952928842ff7d28628138400
sourceUrl: https://developers.openai.com/api/docs/guides/admin-apis
translatedAt: 2026-06-27T16:52:06+08:00
translator: codex-gpt-5.5-xhigh
---

# Admin APIs

Admin APIs 可让你自动化组织管理工作流，例如用户邀请、审计日志查看、项目管理、API key 管理、费用提醒、数据保留和速率限制操作。请将它们用于后台自动化、安全工作流，以及应在控制台之外运行的运维工具。

有关端点详情，请参阅 [Administration API 参考](https://developers.openai.com/api/reference/administration/overview)，包括 [Admin API keys](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/admin_api_keys)、[Invites](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/invites)、[Users](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/users)、[Projects](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/projects) 和 [Audit logs](https://developers.openai.com/api/reference/resources/admin/subresources/organization/subresources/audit_logs)。

## 使用 Admin API key 配合 SDK

要访问这些端点，请[创建一个 Admin API key](https://platform.openai.com/settings/organization/admin-keys)。Admin API key 不能用于非管理类端点。

以下 SDK 版本加入了对 Admin API 的支持，你可能需要更新 SDK 版本：

- Node: `6.36.0`
- Python: `2.34.0`
- Go: `3.34.0`
- Ruby: `0.61.0`
- Java: `4.34.0`

设置 `OPENAI_ADMIN_KEY`，然后为你的语言初始化 SDK。

使用 Admin API key 设置 SDK

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  adminAPIKey: process.env.OPENAI_ADMIN_KEY,
});
```

```python
import os
from openai import OpenAI

client = OpenAI(
    admin_api_key=os.environ["OPENAI_ADMIN_KEY"],
)
```

```go
package main

import (
    "os"

    "github.com/openai/openai-go/v3"
    "github.com/openai/openai-go/v3/option"
)

func main() {
    client := openai.NewClient(
        option.WithAdminAPIKey(os.Getenv("OPENAI_ADMIN_KEY")),
    )

    _ = client
}
```

```ruby
require "openai"

openai = OpenAI::Client.new(
  admin_api_key: ENV.fetch("OPENAI_ADMIN_KEY")
)
```

```java
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;

OpenAIClient client = OpenAIOkHttpClient.builder()
    .adminApiKey(System.getenv("OPENAI_ADMIN_KEY"))
    .build();
```


## 限制项目的模型访问

使用项目模型权限为项目设置允许列表或拒绝列表。将 `mode` 设为 `allow_list` 可仅允许列出的模型；将 `mode` 设为 `deny_list` 可阻止列出的模型，同时允许其他可用模型。模型 ID 必须对组织可见，包括可见的微调模型快照。

设置项目模型允许列表/拒绝列表

```javascript
const modelPermissions =
  await client.admin.organization.projects.modelPermissions.update("proj_abc", {
    mode: "allow_list",
    model_ids: ["gpt-4.1", "o3"],
  });

console.log(modelPermissions.mode);
```

```python
model_permissions = client.admin.organization.projects.model_permissions.update(
    "proj_abc",
    mode="allow_list",
    model_ids=["gpt-4.1", "o3"],
)

print(model_permissions.mode)
```

```go
ctx := context.Background()

modelPermissions, err := client.Admin.Organization.Projects.ModelPermissions.Update(
    ctx,
    "proj_abc",
    openai.AdminOrganizationProjectModelPermissionUpdateParams{
        Mode:     openai.AdminOrganizationProjectModelPermissionUpdateParamsModeAllowList,
        ModelIDs: []string{"gpt-4.1", "o3"},
    },
)
if err != nil {
    panic(err)
}

println(modelPermissions.Mode)
```

```ruby
model_permissions = openai.admin.organization.projects.model_permissions.update(
  "proj_abc",
  mode: :allow_list,
  model_ids: ["gpt-4.1", "o3"]
)

puts(model_permissions.mode)
```

```java
import com.openai.models.admin.organization.projects.modelpermissions.ModelPermissionUpdateParams;
import com.openai.models.admin.organization.projects.modelpermissions.ProjectModelPermissions;
import java.util.List;

ProjectModelPermissions modelPermissions = client.admin()
    .organization()
    .projects()
    .modelPermissions()
    .update(
        "proj_abc",
        ModelPermissionUpdateParams.builder()
            .mode(ModelPermissionUpdateParams.Mode.ALLOW_LIST)
            .modelIds(List.of("gpt-4.1", "o3"))
            .build()
    );

System.out.println(modelPermissions.mode());
```


## 管理费用上限提醒

使用项目费用提醒，在项目费用达到阈值时通知你的团队。阈值金额以美分为单位指定。

创建项目费用上限提醒

```javascript
const spendAlert =
  await client.admin.organization.projects.spendAlerts.create("proj_abc", {
    currency: "USD",
    interval: "month",
    notification_channel: {
      recipients: ["billing@example.com"],
      type: "email",
      subject_prefix: "[OpenAI spend]",
    },
    threshold_amount: 50000,
  });

console.log(spendAlert.id);
```

```python
spend_alert = client.admin.organization.projects.spend_alerts.create(
    "proj_abc",
    currency="USD",
    interval="month",
    notification_channel={
        "recipients": ["billing@example.com"],
        "type": "email",
        "subject_prefix": "[OpenAI spend]",
    },
    threshold_amount=50000,
)

print(spend_alert.id)
```

```go
ctx := context.Background()

spendAlert, err := client.Admin.Organization.Projects.SpendAlerts.New(
    ctx,
    "proj_abc",
    openai.AdminOrganizationProjectSpendAlertNewParams{
        Currency: openai.AdminOrganizationProjectSpendAlertNewParamsCurrencyUsd,
        Interval: openai.AdminOrganizationProjectSpendAlertNewParamsIntervalMonth,
        NotificationChannel: openai.AdminOrganizationProjectSpendAlertNewParamsNotificationChannel{
            Recipients:    []string{"billing@example.com"},
            Type:          "email",
            SubjectPrefix: openai.String("[OpenAI spend]"),
        },
        ThresholdAmount: 50000,
    },
)
if err != nil {
    panic(err)
}

println(spendAlert.ID)
```

```ruby
spend_alert = openai.admin.organization.projects.spend_alerts.create(
  "proj_abc",
  currency: :USD,
  interval: :month,
  notification_channel: {
    recipients: ["billing@example.com"],
    type: :email,
    subject_prefix: "[OpenAI spend]"
  },
  threshold_amount: 50_000
)

puts(spend_alert.id)
```

```java
import com.openai.models.admin.organization.projects.spendalerts.ProjectSpendAlert;
import com.openai.models.admin.organization.projects.spendalerts.SpendAlertCreateParams;

ProjectSpendAlert spendAlert = client.admin()
    .organization()
    .projects()
    .spendAlerts()
    .create(
        "proj_abc",
        SpendAlertCreateParams.builder()
            .currency(SpendAlertCreateParams.Currency.USD)
            .interval(SpendAlertCreateParams.Interval.MONTH)
            .notificationChannel(
                SpendAlertCreateParams.NotificationChannel.builder()
                    .addRecipient("billing@example.com")
                    .subjectPrefix("[OpenAI spend]")
                    .build()
            )
            .thresholdAmount(50000L)
            .build()
    );

System.out.println(spendAlert.id());
```


## 管理数据保留

使用项目数据保留控制来覆盖或继承组织的项目保留策略。将 `retention_type` 设为 `organization_default` 可继承组织设置。

设置项目数据保留

```javascript
const dataRetention =
  await client.admin.organization.projects.dataRetention.update("proj_abc", {
    retention_type: "organization_default",
  });

console.log(dataRetention.type);
```

```python
data_retention = client.admin.organization.projects.data_retention.update(
    "proj_abc",
    retention_type="organization_default",
)

print(data_retention.type)
```

```go
ctx := context.Background()

dataRetention, err := client.Admin.Organization.Projects.DataRetention.Update(
    ctx,
    "proj_abc",
    openai.AdminOrganizationProjectDataRetentionUpdateParams{
        RetentionType: openai.AdminOrganizationProjectDataRetentionUpdateParamsRetentionTypeOrganizationDefault,
    },
)
if err != nil {
    panic(err)
}

println(dataRetention.Type)
```

```ruby
data_retention = openai.admin.organization.projects.data_retention.update(
  "proj_abc",
  retention_type: :organization_default
)

puts(data_retention.type)
```

```java
import com.openai.models.admin.organization.projects.dataretention.DataRetentionUpdateParams;
import com.openai.models.admin.organization.projects.dataretention.ProjectDataRetention;

ProjectDataRetention dataRetention = client.admin()
    .organization()
    .projects()
    .dataRetention()
    .update(
        "proj_abc",
        DataRetentionUpdateParams.builder()
            .retentionType(DataRetentionUpdateParams.RetentionType.ORGANIZATION_DEFAULT)
            .build()
    );

System.out.println(dataRetention.type());
```


## 通过电子邮件邀请用户

使用 Invites 端点向电子邮件地址发送组织邀请。

通过电子邮件邀请用户

```javascript
const invite = await client.admin.organization.invites.create({
  email: "user@example.com",
  role: "reader",
});

console.log(invite.id);
```

```python
invite = client.admin.organization.invites.create(
    email="user@example.com",
    role="reader",
)

print(invite.id)
```

```go
ctx := context.Background()

invite, err := client.Admin.Organization.Invites.New(ctx, openai.AdminOrganizationInviteNewParams{
    Email: "user@example.com",
    Role:  openai.AdminOrganizationInviteNewParamsRoleReader,
})
if err != nil {
    panic(err)
}

println(invite.ID)
```

```ruby
invite = openai.admin.organization.invites.create(
  email: "user@example.com",
  role: :reader
)

puts(invite.id)
```

```java
import com.openai.models.admin.organization.invites.Invite;
import com.openai.models.admin.organization.invites.InviteCreateParams;

Invite invite = client.admin().organization().invites().create(
    InviteCreateParams.builder()
        .email("user@example.com")
        .role(InviteCreateParams.Role.READER)
        .build()
);

System.out.println(invite.id());
```


## 检索审计日志

使用 Audit Logs 端点列出组织最近的用户操作和配置变更。

检索审计日志

```javascript
const auditLogs = await client.admin.organization.auditLogs.list({
  limit: 10,
});

console.log(auditLogs.data);
```

```python
audit_logs = client.admin.organization.audit_logs.list(limit=10)

for audit_log in audit_logs.data:
    print(audit_log.id)
```

```go
ctx := context.Background()

auditLogs, err := client.Admin.Organization.AuditLogs.List(ctx, openai.AdminOrganizationAuditLogListParams{
    Limit: openai.Int(10),
})
if err != nil {
    panic(err)
}

for _, auditLog := range auditLogs.Data {
    println(auditLog.ID)
}
```

```ruby
audit_logs = openai.admin.organization.audit_logs.list(limit: 10)

audit_logs.data.each do |audit_log|
  puts(audit_log.id)
end
```

```java
import com.openai.models.admin.organization.auditlogs.AuditLogListParams;

var page = client.admin().organization().auditLogs().list(
    AuditLogListParams.builder()
        .limit(10L)
        .build()
);

page.data().forEach(auditLog -> System.out.println(auditLog.id()));
```
