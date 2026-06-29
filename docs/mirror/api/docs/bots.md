---
title: "OpenAI Crawlers 概览"
description: "Overview of OpenAI Crawlers"
outline: deep
---

# OpenAI Crawlers 概览

**文档集**：OpenAI API Docs  
**分组**：OpenAI API — Docs  
**翻译状态**：译文待复核

::: warning 非官方本地镜像
- 官方来源：[https://developers.openai.com/api/docs/bots](https://developers.openai.com/api/docs/bots)
- Markdown 来源：[https://developers.openai.com/api/docs/bots.md](https://developers.openai.com/api/docs/bots.md)
- 抓取时间：2026-06-27T05:53:56.918Z
- Checksum：`49cec3bab570c94939664735188e002323bbcb3dba582a8c1c90b7abe4e8b0ae`
:::

## 中文译文

::: danger 译文待复核
官方英文源文档已经变化，请复核本页中文译文。
:::

::: v-pre
OpenAI 使用 web crawlers（“robots”）和 user agents 为其产品执行操作，这些操作可以是自动发生的，也可以由用户请求触发。OpenAI 使用 OAI-SearchBot 和 GPTBot robots.txt tags，让网站管理员能够管理其站点和内容如何与 AI 配合使用。每项设置彼此独立，例如，网站管理员可以允许 OAI-SearchBot 以便出现在搜索结果中，同时禁止 GPTBot，以表明被抓取的内容不应被用于训练 OpenAI 的生成式 AI foundation models。如果你的站点同时允许这两个 bots，我们可能会把一次 crawl 的结果同时用于这两种使用场景，以避免重复抓取。对于搜索结果，请注意，在站点更新 robots.txt 后，我们的系统可能需要约 24 小时才会调整。


    | User agent                                                  | 描述与详情                                                                                                    |
    | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
    | OAI-SearchBot   | OAI-SearchBot 用于搜索。OAI-SearchBot 用于在 ChatGPT 的搜索功能中将网站展示在搜索结果里。选择退出 OAI-SearchBot 的站点不会显示在 ChatGPT search answers 中，不过仍可能作为 navigational links 出现。为帮助确保你的站点出现在搜索结果中，我们建议在你站点的 robots.txt 文件中允许 OAI-SearchBot，并允许来自下方已发布 IP ranges 的请求。 &lt;br/&gt;&lt;br/&gt;完整 user-agent string：`Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot` &lt;br/&gt;&lt;br/&gt;已发布 IP 地址：https://openai.com/searchbot.json
    | OAI-AdsBot      | OAI-AdsBot 用于验证作为 ChatGPT 广告提交的网页安全性。当你提交广告时，OpenAI 可能会访问 landing page，以确保其符合我们的 policies。我们也可能使用 landing page 的内容来判断何时向用户展示该广告最相关。OAI-AdsBot 只会访问作为广告提交的页面，并且 OAI-AdsBot 收集的数据不会用于训练 generative AI foundation models。 &lt;br/&gt;&lt;br/&gt;完整 user-agent string：`Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-AdsBot/1.0; +https://openai.com/adsbot` &lt;br/&gt;&lt;br/&gt;已发布 IP 地址：https://openai.com/adsbot.json
    | GPTBot          | GPTBot 用于让我们的 generative AI foundation models 更有用、更安全。它用于 crawl 可能被用于训练我们的 generative AI foundation models 的内容。禁止 GPTBot 表示某个站点的内容不应被用于训练 generative AI foundation models。 &lt;br/&gt;&lt;br/&gt;完整 user-agent string：`Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot` &lt;br/&gt;&lt;br/&gt;已发布 IP 地址：https://openai.com/gptbot.json
    | ChatGPT-User    | OpenAI 也会将 ChatGPT-User 用于 ChatGPT 和 [Custom GPTs](https://openai.com/index/introducing-gpts/) 中的某些用户操作。当用户向 ChatGPT 或 CustomGPT 提问时，它可能会使用 ChatGPT-User agent 访问网页。ChatGPT 用户也可能通过 [GPT Actions](/mirror/api/docs/actions/introduction) 与外部应用交互。ChatGPT-User 不用于以自动方式 crawl web。由于这些操作由用户发起，robots.txt 规则可能不适用。ChatGPT-User 不用于决定内容是否可以出现在 Search 中。请在 robots.txt 中使用 OAI-SearchBot 来管理 Search opt outs 和 automatic crawl。 &lt;br/&gt;&lt;br/&gt;完整 user-agent string：`Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot` &lt;br/&gt;&lt;br/&gt;已发布 IP 地址：https://openai.com/chatgpt-user.json



:::

## English source

::: details 展开英文原文
::: v-pre
``````markdown
OpenAI uses web crawlers (“robots”) and user agents to perform actions for its products, either automatically or triggered by user request. OpenAI uses OAI-SearchBot and GPTBot robots.txt tags to enable webmasters to manage how their sites and content work with AI. Each setting is independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI’s generative AI foundation models. If your site has allowed both bots, we may use the results from just one crawl for both use cases to avoid duplicative crawling. For search results, please note it can take ~24 hours from a site’s robots.txt update for our systems to adjust.

<div className="docs-models-toc">
    | User agent                                                  | Description & details                                                                                                    |
    | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
    | OAI-SearchBot   | OAI-SearchBot is for search. OAI-SearchBot is used to surface websites in search results in ChatGPT's search features. Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers, though can still appear as navigational links. To help ensure your site appears in search results, we recommend allowing OAI-SearchBot in your site’s robots.txt file and allowing requests from our published IP ranges below. <br/><br/>Full user-agent string: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.3; +https://openai.com/searchbot` <br/><br/>Published IP addresses: https://openai.com/searchbot.json
    | OAI-AdsBot      | OAI-AdsBot is used to validate the safety of web pages submitted as ads on ChatGPT. When you submit an ad, OpenAI may visit the landing page to ensure it complies with our policies. We may also use content from the landing page to determine when it's most relevant to show the ad to users. OAI-AdsBot only visits pages submitted as ads, and the data collected by OAI-AdsBot is not used to train generative AI foundation models. <br/><br/>Full user-agent string: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-AdsBot/1.0; +https://openai.com/adsbot` <br/><br/>Published IP addresses: https://openai.com/adsbot.json
    | GPTBot          | GPTBot is used to make our generative AI foundation models more useful and safe. It is used to crawl content that may be used in training our generative AI foundation models. Disallowing GPTBot indicates a site’s content should not be used in training generative AI foundation models. <br/><br/>Full user-agent string: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.3; +https://openai.com/gptbot` <br/><br/>Published IP addresses: https://openai.com/gptbot.json
    | ChatGPT-User    | OpenAI also uses ChatGPT-User for certain user actions in ChatGPT and [Custom GPTs](https://openai.com/index/introducing-gpts/). When users ask ChatGPT or a CustomGPT a question, it may visit a web page with a ChatGPT-User agent. ChatGPT users may also interact with external applications via [GPT Actions](https://developers.openai.com/api/docs/actions/introduction). ChatGPT-User is not used for crawling the web in an automatic fashion. Because these actions are initiated by a user, robots.txt rules may not apply. ChatGPT-User is not used to determine whether content may appear in Search. Please use OAI-SearchBot in robots.txt for managing Search opt outs and automatic crawl. <br/><br/>Full user-agent string: `Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot` <br/><br/>Published IP addresses: https://openai.com/chatgpt-user.json

</div>
``````
:::
:::

