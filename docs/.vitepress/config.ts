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
  title: "OpenAI 开发者文档本地镜像",
  description: "非官方、本地学习用 OpenAI Developers 双语镜像站",
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
    nav: readGeneratedJson("nav.json", [
      { text: "首页", link: "/" },
      { text: "目录", link: "/catalog" },
      { text: "翻译状态", link: "/translation-status" }
    ]),
    sidebar: readGeneratedJson("sidebar.json", [
      {
        text: "本地镜像",
        items: [
          { text: "首页", link: "/" },
          { text: "文档目录", link: "/catalog" },
          { text: "翻译状态", link: "/translation-status" }
        ]
      }
    ]),
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
