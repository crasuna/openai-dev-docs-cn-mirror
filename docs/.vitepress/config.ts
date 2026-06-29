import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitepress";

const configDir = path.dirname(fileURLToPath(import.meta.url));

function readGeneratedJson<T>(name: string, fallback: T): T {
  const filePath = path.join(configDir, "generated", name);
  if (!existsSync(filePath)) return fallback;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export default defineConfig({
  base: process.env.VITEPRESS_BASE || "/",
  lang: "zh-CN",
  title: "OpenAI Developers 文档中文学习镜像",
  description: "非官方 OpenAI Developers 中文学习镜像站",
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: false,
  markdown: {
    html: false,
    lineNumbers: true
  },
  vite: {
    build: {
      chunkSizeWarningLimit: 10000
    }
  },
  themeConfig: {
    siteTitle: "OpenAI 文档镜像",
    nav: readGeneratedJson("nav.json", [
      { text: "首页", link: "/" },
      {
        text: "API",
        items: [
          { text: "OpenAI API 文档", link: "/mirror/api/docs/quickstart" },
          { text: "API 参考", link: "/mirror/api/reference/overview" }
        ]
      },
      {
        text: "Codex",
        items: [
          { text: "Codex 文档", link: "/mirror/codex/overview" },
          { text: "快速开始", link: "/mirror/codex/quickstart" }
        ]
      },
      {
        text: "ChatGPT",
        items: [
          { text: "Apps SDK", link: "/mirror/apps-sdk/quickstart" },
          { text: "工作区智能体", link: "/mirror/workspace-agents/authentication" },
          { text: "商务", link: "/mirror/commerce/guides/get-started" },
          { text: "广告", link: "/mirror/ads/api-overview" }
        ]
      },
      { text: "目录", link: "/catalog" },
      { text: "翻译状态", link: "/translation-status" },
      { text: "官方文档", link: "https://developers.openai.com/" }
    ]),
    sidebar: readGeneratedJson("sidebar.json", {
      "/": [
        {
          text: "中文镜像",
          items: [
            { text: "首页", link: "/" },
            { text: "文档目录", link: "/catalog" },
            { text: "翻译状态", link: "/translation-status" }
          ]
        }
      ],
      "/mirror/ads/": [{ text: "概览", link: "/mirror/ads/api-overview" }],
      "/mirror/api/docs/": [{ text: "快速开始", link: "/mirror/api/docs/quickstart" }],
      "/mirror/api/reference/": [{ text: "API 概览", link: "/mirror/api/reference/overview" }],
      "/mirror/apps-sdk/": [{ text: "快速开始", link: "/mirror/apps-sdk/quickstart" }],
      "/mirror/codex/": [{ text: "概览", link: "/mirror/codex/overview" }],
      "/mirror/commerce/": [{ text: "开始使用", link: "/mirror/commerce/guides/get-started" }],
      "/mirror/workspace-agents/": [{ text: "身份验证", link: "/mirror/workspace-agents/authentication" }]
    }),
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "搜索文档",
            buttonAriaLabel: "搜索文档"
          },
          modal: {
            displayDetails: "显示详情",
            resetButtonTitle: "清除搜索",
            backButtonTitle: "关闭搜索",
            noResultsText: "没有找到结果",
            footer: {
              selectText: "选择",
              navigateText: "切换",
              closeText: "关闭"
            }
          }
        }
      }
    },
    outline: {
      label: "本页目录",
      level: "deep"
    },
    docFooter: {
      prev: "上一页",
      next: "下一页"
    },
    lastUpdated: {
      text: "页面生成时间",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "short"
      }
    },
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "外观",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式"
  }
});
