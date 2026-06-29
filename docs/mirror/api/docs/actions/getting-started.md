---
title: "GPT Actions 入门"
description: "Learn how to set up and test GPT actions from scratch with the OpenAI API."
outline: deep
---

# GPT Actions 入门

**文档集**：OpenAI API 文档<br>
**分组**：文档<br>
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/actions/getting-started](https://developers.openai.com/api/docs/actions/getting-started)
- Markdown 来源：[https://developers.openai.com/api/docs/actions/getting-started.md](https://developers.openai.com/api/docs/actions/getting-started.md)
- 抓取时间：2026-06-27T05:53:56.144Z
- Checksum：`c8cfd1e77de77f18bdb5b2b3e3663c5a1ee41b540e7036ef03b2aeb0a74c80de`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
## Weather.gov 示例

NSW (National Weather Service) 维护一个[公共 API](https://www.weather.gov/documentation/services-web-api)，用户可以查询它以获取任何经纬度点的天气预报。要检索预报，有 2 个步骤：

1. 用户向 api.weather.gov/points API 提供经纬度，并收到 WFO（weather forecast office）、grid-X 和 grid-Y 坐标
2. 这 3 个元素会传入 api.weather.gov/forecast API，以检索该坐标的天气预报

在本练习中，我们来构建一个 Custom GPT：用户输入城市、地标或经纬度坐标，Custom GPT 回答该地点天气预报相关的问题。

## 步骤 1：编写并测试 Open API schema（使用 Actions GPT）

GPT Action 需要一个 [Open API schema](https://swagger.io/specification/) 来描述 API 调用的参数。Open API schema 是描述 API 的标准。

OpenAI 发布了一个公共 [Actions GPT](https://chatgpt.com/g/g-TYEliDU6A-actionsgpt)，帮助开发者编写这个 schema。例如，前往 Actions GPT 并询问：_“访问 https://www.weather.gov/documentation/services-web-api，阅读该页面上的文档。为 /points/\{latitude},\{longitude} 和 /gridpoints/\{office}/\{gridX},\{gridY}/forecast 这两个 API 调用构建 Open API Schema”_

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_action_gpt.png"
  alt="上面的 Actions GPT 请求"
/&gt;



下面是 Actions GPT 返回的完整 Open API Schema：

```yaml
openapi: 3.1.0
info:
  title: NWS Weather API
  description: Access to weather data including forecasts, alerts, and observations.
  version: 1.0.0
servers:
  - url: https://api.weather.gov
    description: Main API Server
paths:
  /points/{latitude},{longitude}:
    get:
      operationId: getPointData
      summary: Get forecast grid endpoints for a specific location
      parameters:
        - name: latitude
          in: path
          required: true
          schema:
            type: number
            format: float
          description: Latitude of the point
        - name: longitude
          in: path
          required: true
          schema:
            type: number
            format: float
          description: Longitude of the point
      responses:
        "200":
          description: Successfully retrieved grid endpoints
          content:
            application/json:
              schema:
                type: object
                properties:
                  properties:
                    type: object
                    properties:
                      forecast:
                        type: string
                        format: uri
                      forecastHourly:
                        type: string
                        format: uri
                      forecastGridData:
                        type: string
                        format: uri

  /gridpoints/{office}/{gridX},{gridY}/forecast:
    get:
      operationId: getGridpointForecast
      summary: Get forecast for a given grid point
      parameters:
        - name: office
          in: path
          required: true
          schema:
            type: string
          description: Weather Forecast Office ID
        - name: gridX
          in: path
          required: true
          schema:
            type: integer
          description: X coordinate of the grid
        - name: gridY
          in: path
          required: true
          schema:
            type: integer
          description: Y coordinate of the grid
      responses:
        "200":
          description: Successfully retrieved gridpoint forecast
          content:
            application/json:
              schema:
                type: object
                properties:
                  properties:
                    type: object
                    properties:
                      periods:
                        type: array
                        items:
                          type: object
                          properties:
                            number:
                              type: integer
                            name:
                              type: string
                            startTime:
                              type: string
                              format: date-time
                            endTime:
                              type: string
                              format: date-time
                            temperature:
                              type: integer
                            temperatureUnit:
                              type: string
                            windSpeed:
                              type: string
                            windDirection:
                              type: string
                            icon:
                              type: string
                              format: uri
                            shortForecast:
                              type: string
                            detailedForecast:
                              type: string
```



ChatGPT 会使用顶部的 **info**（尤其包括 description）来判断该 action 是否与用户查询相关。

```yaml
info:
  title: NWS Weather API
  description: Access to weather data including forecasts, alerts, and observations.
  version: 1.0.0
```

然后，下面的 **parameters** 会进一步定义 schema 的每一部分。例如，我们是在告诉 ChatGPT，_office_ 参数指的是 Weather Forecast Office (WFO)。

```yaml
/gridpoints/{office}/{gridX},{gridY}/forecast:
  get:
    operationId: getGridpointForecast
    summary: Get forecast for a given grid point
    parameters:
      - name: office
        in: path
        required: true
        schema:
          type: string
        description: Weather Forecast Office ID
```

**关键：**请特别注意你在这个 Open API schema 中使用的 **schema names** 和 **descriptions**。ChatGPT 会使用这些名称和描述来理解：(a) 应调用哪个 API action，以及 (b) 应使用哪个参数。如果某个字段被限制为只能取某些值，你也可以提供一个带有描述性类别名称的 "enum"。

虽然你可以直接在 GPT Action 中尝试 Open API schema，但直接在 ChatGPT 中调试可能具有挑战性。我们建议使用第三方服务（如 [Postman](https://www.postman.com/)）来测试你的 API 调用是否正常工作。Postman 可免费注册，错误处理信息详尽，并且认证选项全面。它甚至提供直接导入 Open API schemas 的选项（见下文）。

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_import.png"
  alt="选择用 Postman 导入你的 API"
/&gt;

## 步骤 2：确定认证要求

这个 Weather 第三方服务不需要认证，因此对于这个 Custom GPT，你可以跳过该步骤。对于其他确实需要认证的 GPT Actions，有 2 个选项：API Key 或 OAuth。询问 ChatGPT 可以帮助你开始处理大多数常见应用。例如，如果我需要使用 OAuth 对 Google Cloud 进行认证，可以提供一张截图并询问细节：_“我正在通过 OAuth 构建到 Google Cloud 的连接。请说明如何填写这些框中的每一项。”_

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_oauth_panel.png"
  alt="上面的 ChatGPT 请求"
/&gt;

通常，ChatGPT 会对所有 5 个元素给出正确方向。一旦你准备好这些基础内容，就可以尝试在 Postman 或另一个类似服务中测试和调试认证。如果遇到错误，请把错误提供给 ChatGPT，它通常可以帮助你继续调试。

## 步骤 3：创建 GPT Action 并测试

现在该创建你的 Custom GPT 了。如果你以前从未创建过 Custom GPT，请先从我们的 [Creating a GPT guide](https://help.openai.com/en/articles/8554397-creating-a-gpt) 开始。

1. 提供名称、描述和图片来描述你的 Custom GPT
2. 前往 Action 部分并粘贴你的 Open API schema。编写说明时，请记下 Action 名称和 json 参数。
3. 添加你的认证设置
4. 回到主页并添加说明



成功说明的写法有很多；最重要的是说明能让模型反映用户偏好。

通常有三个部分：

1. _Context_：向模型解释 GPT Action(s) 正在做什么
2. _Instructions_：说明步骤顺序，也就是引用 Action 名称以及 API 调用需要关注的任何参数的地方
3. _Additional Notes_：任何需要牢记的事项

下面是 Weather GPT 的说明示例。注意这些说明如何引用 Open API schema 中的 API action 名称和 json 参数。

```
**Context**: A user needs information related to a weather forecast of a specific location.

**Instructions**:
1. The user will provide a lat-long point or a general location or landmark (e.g. New York City, the White House). If the user does not provide one, ask for the relevant location
2. If the user provides a general location or landmark, convert that into a lat-long coordinate. If required, browse the web to look up the lat-long point.
3. Run the "getPointData" API action and retrieve back the gridId, gridX, and gridY parameters.
4. Apply those variables as the office, gridX, and gridY variables in the "getGridpointForecast" API action to retrieve back a forecast
5. Use that forecast to answer the user's question

**Additional Notes**:
- Assume the user uses US weather units (e.g. Fahrenheit) unless otherwise specified
- If the user says "Let's get started" or "What do I do?", explain the purpose of this Custom GPT
```



### 测试 GPT Action

在每个 action 旁边，你会看到一个 **Test** 按钮。点击每个 action 的该按钮。在测试中，你可以看到每个 API 调用的详细输入和输出。

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_available_action.png"
  alt="可用 actions"
/&gt;

如果你的 API 调用在 Postman 这样的第三方工具中正常工作，但在 ChatGPT 中不正常，可能有几个原因：

- ChatGPT 中的参数错误或缺失
- ChatGPT 中存在认证问题
- 你的说明不完整或不清晰
- Open API schema 中的描述不清楚

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_test_action.png"
  alt="测试天气 API 调用时的预览响应"
/&gt;

## 步骤 4：在第三方应用中设置 callback URL

如果你的 GPT Action 使用 OAuth Authentication，你需要在第三方应用中设置 callback URL。一旦你使用 OAuth 设置 GPT Action，ChatGPT 会向你提供一个 callback URL（每次更新某个 OAuth 参数时，该 URL 都会更新）。复制该 callback URL，并将其添加到你的应用中的相应位置。

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_bq_callback.png"
  alt="设置 callback URL"
/&gt;

## 步骤 5：评估 Custom GPT

即使你已经在上一步测试了 GPT Action，你仍然需要评估 Instructions 和 GPT Action 是否以用户期望的方式运行。尝试想出至少 5-10 个有代表性的问题（越多越好），作为要询问 Custom GPT 的 **“evaluation set”**。

**关键：**测试 Custom GPT 是否按你的预期处理每一个问题。

示例问题：_“这个周末去 White House 旅行我应该带什么？”_ 它会测试 Custom GPT 的能力：(1) 将地标转换为经纬度，(2) 运行两个 GPT Actions，以及 (3) 回答用户的问题。

&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_prompt_2_actions.png"
  alt="对上面 ChatGPT 请求的响应，其中包含天气数据"
/&gt;
&lt;img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_output.png"
  alt="上述响应的后续内容"
/&gt;

## 常见调试步骤

_挑战：_ GPT Action 正在调用错误的 API 调用（或根本没有调用）

- _解决方案：_ 确保 Actions 的描述清楚，并在你的 Custom GPT Instructions 中引用 Action 名称

_挑战：_ GPT Action 调用了正确的 API 调用，但没有正确使用参数

- _解决方案：_ 添加或修改 GPT Action 中参数的描述

_挑战：_ Custom GPT 无法工作，但我没有得到清晰错误

- _解决方案：_ 确保测试 Action；测试窗口中有更健壮的日志。如果仍然不清楚，请使用 Postman 或另一个第三方服务进行更好的诊断。

_挑战：_ Custom GPT 给出认证错误

- _解决方案：_ 确保你的 callback URL 已正确设置。尝试在 Postman 或另一个第三方服务中测试完全相同的认证设置

_挑战：_ Custom GPT 无法处理更困难或更模糊的问题

- _解决方案：_ 尝试对 Custom GPT 中的说明进行 prompt engineering。参见我们的 [prompt engineering guide](/mirror/api/docs/guides/prompt-engineering) 中的示例

这就是构建 Custom GPT 指南的全部内容。祝你构建顺利；如果还有其他问题，也欢迎利用 [OpenAI developer forum](https://community.openai.com/)。

:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
## Weather.gov example

The NSW (National Weather Service) maintains a [public API](https://www.weather.gov/documentation/services-web-api) that users can query to receive a weather forecast for any lat-long point. To retrieve a forecast, there’s 2 steps:

1. A user provides a lat-long to the api.weather.gov/points API and receives back a WFO (weather forecast office), grid-X, and grid-Y coordinates
2. Those 3 elements feed into the api.weather.gov/forecast API to retrieve a forecast for that coordinate

For the purpose of this exercise, let’s build a Custom GPT where a user writes a city, landmark, or lat-long coordinates, and the Custom GPT answers questions about a weather forecast in that location.

## Step 1: Write and test Open API schema (using Actions GPT)

A GPT Action requires an [Open API schema](https://swagger.io/specification/) to describe the parameters of the API call, which is a standard for describing APIs.

OpenAI released a public [Actions GPT](https://chatgpt.com/g/g-TYEliDU6A-actionsgpt) to help developers write this schema. For example, go to the Actions GPT and ask: _“Go to https://www.weather.gov/documentation/services-web-api and read the documentation on that page. Build an Open API Schema for the /points/\{latitude},\{longitude} and /gridpoints/\{office}/\{gridX},\{gridY}/forecast” API calls”_

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_action_gpt.png"
  alt="The above Actions GPT request"
/>



Below is the full Open API Schema that the Actions GPT Returned:

```yaml
openapi: 3.1.0
info:
  title: NWS Weather API
  description: Access to weather data including forecasts, alerts, and observations.
  version: 1.0.0
servers:
  - url: https://api.weather.gov
    description: Main API Server
paths:
  /points/{latitude},{longitude}:
    get:
      operationId: getPointData
      summary: Get forecast grid endpoints for a specific location
      parameters:
        - name: latitude
          in: path
          required: true
          schema:
            type: number
            format: float
          description: Latitude of the point
        - name: longitude
          in: path
          required: true
          schema:
            type: number
            format: float
          description: Longitude of the point
      responses:
        "200":
          description: Successfully retrieved grid endpoints
          content:
            application/json:
              schema:
                type: object
                properties:
                  properties:
                    type: object
                    properties:
                      forecast:
                        type: string
                        format: uri
                      forecastHourly:
                        type: string
                        format: uri
                      forecastGridData:
                        type: string
                        format: uri

  /gridpoints/{office}/{gridX},{gridY}/forecast:
    get:
      operationId: getGridpointForecast
      summary: Get forecast for a given grid point
      parameters:
        - name: office
          in: path
          required: true
          schema:
            type: string
          description: Weather Forecast Office ID
        - name: gridX
          in: path
          required: true
          schema:
            type: integer
          description: X coordinate of the grid
        - name: gridY
          in: path
          required: true
          schema:
            type: integer
          description: Y coordinate of the grid
      responses:
        "200":
          description: Successfully retrieved gridpoint forecast
          content:
            application/json:
              schema:
                type: object
                properties:
                  properties:
                    type: object
                    properties:
                      periods:
                        type: array
                        items:
                          type: object
                          properties:
                            number:
                              type: integer
                            name:
                              type: string
                            startTime:
                              type: string
                              format: date-time
                            endTime:
                              type: string
                              format: date-time
                            temperature:
                              type: integer
                            temperatureUnit:
                              type: string
                            windSpeed:
                              type: string
                            windDirection:
                              type: string
                            icon:
                              type: string
                              format: uri
                            shortForecast:
                              type: string
                            detailedForecast:
                              type: string
```



ChatGPT uses the **info** at the top (including the description in particular) to determine if this action is relevant for the user query.

```yaml
info:
  title: NWS Weather API
  description: Access to weather data including forecasts, alerts, and observations.
  version: 1.0.0
```

Then the **parameters** below further define each part of the schema. For example, we're informing ChatGPT that the _office_ parameter refers to the Weather Forecast Office (WFO).

```yaml
/gridpoints/{office}/{gridX},{gridY}/forecast:
  get:
    operationId: getGridpointForecast
    summary: Get forecast for a given grid point
    parameters:
      - name: office
        in: path
        required: true
        schema:
          type: string
        description: Weather Forecast Office ID
```

**Key:** Pay special attention to the **schema names** and **descriptions** that you use in this Open API schema. ChatGPT uses those names and descriptions to understand (a) which API action should be called and (b) which parameter should be used. If a field is restricted to only certain values, you can also provide an "enum" with descriptive category names.

While you can just try the Open API schema directly in a GPT Action, debugging directly in ChatGPT can be a challenge. We recommend using a 3rd party service, like [Postman](https://www.postman.com/), to test that your API call is working properly. Postman is free to sign up, verbose in its error-handling, and comprehensive in its authentication options. It even gives you the option of importing Open API schemas directly (see below).

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_import.png"
  alt="Choosing to import your API with Postman"
/>

## Step 2: Identify authentication requirements

This Weather 3rd party service does not require authentication, so you can skip that step for this Custom GPT. For other GPT Actions that do require authentication, there are 2 options: API Key or OAuth. Asking ChatGPT can help you get started for most common applications. For example, if I needed to use OAuth to authenticate to Google Cloud, I can provide a screenshot and ask for details: _“I’m building a connection to Google Cloud via OAuth. Please provide instructions for how to fill out each of these boxes.”_

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_oauth_panel.png"
  alt="The above ChatGPT request"
/>

Often, ChatGPT provides the correct directions on all 5 elements. Once you have those basics ready, try testing and debugging the authentication in Postman or another similar service. If you encounter an error, provide the error to ChatGPT, and it can usually help you debug from there.

## Step 3: Create the GPT Action and test

Now is the time to create your Custom GPT. If you've never created a Custom GPT before, start at our [Creating a GPT guide](https://help.openai.com/en/articles/8554397-creating-a-gpt).

1. Provide a name, description, and image to describe your Custom GPT
2. Go to the Action section and paste in your Open API schema. Take a note of the Action names and json parameters when writing your instructions.
3. Add in your authentication settings
4. Go back to the main page and add in instructions



There are many ways to write successful instructions: the most important thing is that the instructions enable the model to reflect the user's preferences.

Typically, there are three sections:

1. _Context_ to explain to the model what the GPT Action(s) is doing
2. _Instructions_ on the sequence of steps – this is where you reference the Action name and any parameters the API call needs to pay attention to
3. _Additional Notes_ if there’s anything to keep in mind

Here’s an example of the instructions for the Weather GPT. Notice how the instructions refer to the API action name and json parameters from the Open API schema.

```
**Context**: A user needs information related to a weather forecast of a specific location.

**Instructions**:
1. The user will provide a lat-long point or a general location or landmark (e.g. New York City, the White House). If the user does not provide one, ask for the relevant location
2. If the user provides a general location or landmark, convert that into a lat-long coordinate. If required, browse the web to look up the lat-long point.
3. Run the "getPointData" API action and retrieve back the gridId, gridX, and gridY parameters.
4. Apply those variables as the office, gridX, and gridY variables in the "getGridpointForecast" API action to retrieve back a forecast
5. Use that forecast to answer the user's question

**Additional Notes**:
- Assume the user uses US weather units (e.g. Fahrenheit) unless otherwise specified
- If the user says "Let's get started" or "What do I do?", explain the purpose of this Custom GPT
```



### Test the GPT Action

Next to each action, you'll see a **Test** button. Click on that for each action. In the test, you can see the detailed input and output of each API call.

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_available_action.png"
  alt="Available actions"
/>

If your API call is working in a 3rd party tool like Postman and not in ChatGPT, there are a few possible culprits:

- The parameters in ChatGPT are wrong or missing
- An authentication issue in ChatGPT
- Your instructions are incomplete or unclear
- The descriptions in the Open API schema are unclear

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_test_action.png"
  alt="A preview response from testing the weather API call"
/>

## Step 4: Set up callback URL in the 3rd party app

If your GPT Action uses OAuth Authentication, you’ll need to set up the callback URL in your 3rd party application. Once you set up a GPT Action with OAuth, ChatGPT provides you with a callback URL (this will update any time you update one of the OAuth parameters). Copy that callback URL and add it to the appropriate place in your application.

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_bq_callback.png"
  alt="Setting up a callback URL"
/>

## Step 5: Evaluate the Custom GPT

Even though you tested the GPT Action in the step above, you still need to evaluate if the Instructions and GPT Action function in the way users expect. Try to come up with at least 5-10 representative questions (the more, the better) of an **“evaluation set”** of questions to ask your Custom GPT.

**Key:** Test that the Custom GPT handles each one of your questions as you expect.

An example question: _“What should I pack for a trip to the White House this weekend?”_ tests the Custom GPT’s ability to: (1) convert a landmark to a lat-long, (2) run both GPT Actions, and (3) answer the user’s question.

<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_prompt_2_actions.png"
  alt="The response to the above ChatGPT request, including weather data"
/>
<img
  className="images-example-image" src="https://cdn.openai.com/API/images/guides/actions_output.png"
  alt="A continuation of the response above"
/>

## Common Debugging Steps

_Challenge:_ The GPT Action is calling the wrong API call (or not calling it at all)

- _Solution:_ Make sure the descriptions of the Actions are clear - and refer to the Action names in your Custom GPT Instructions

_Challenge:_ The GPT Action is calling the right API call but not using the parameters correctly

- _Solution:_ Add or modify the descriptions of the parameters in the GPT Action

_Challenge:_ The Custom GPT is not working but I am not getting a clear error

- _Solution:_ Make sure to test the Action - there are more robust logs in the test window. If that is still unclear, use Postman or another 3rd party service to better diagnose.

_Challenge:_ The Custom GPT is giving an authentication error

- _Solution:_ Make sure your callback URL is set up correctly. Try testing the exact same authentication settings in Postman or another 3rd party service

_Challenge:_ The Custom GPT cannot handle more difficult / ambiguous questions

- _Solution:_ Try to prompt engineer your instructions in the Custom GPT. See examples in our [prompt engineering guide](https://developers.openai.com/api/docs/guides/prompt-engineering)

This concludes the guide to building a Custom GPT. Good luck building and leveraging the [OpenAI developer forum](https://community.openai.com/) if you have additional questions.
``````
:::
:::

