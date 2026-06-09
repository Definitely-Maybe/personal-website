# personal-website

一个中文个人网站与个人博客。首页是 AI 对话入口（v0.3 接入 DeepSeek 流式回复），内容空间包括随笔、书影音、时间线、访客簿和关于页。

## 本地开发

```bash
npm install
npm run dev
```

## 环境变量

复制 `.env.example` 为 `.env`，填写 Sanity 配置：

```txt
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2026-06-03
PUBLIC_CONTENT_SOURCE=auto
```

未填写 `PUBLIC_SANITY_PROJECT_ID` 时，前台使用本地 fixture 内容。

## AI 聊天（v0.3）

```txt
DEEPSEEK_API_KEY=
DEEPSEEK_MODEL=deepseek-v4-pro
DEEPSEEK_BASE_URL=https://api.deepseek.com
PERSONA_BRIEF=
```

- 本地未配置 `DEEPSEEK_API_KEY` 时，首页仍使用模拟回复。
- 生产环境必须配置 `DEEPSEEK_API_KEY`。
- `PERSONA_BRIEF` 为作者离线撰写的人格说明，不要提交到 Git。

## 内容后台

内容后台使用独立部署的 Sanity Studio。主站不提供 `/admin` 页面。

Studio 本地开发：

```bash
cd studio
npm install
npm run dev
```

Studio 独立部署：

```bash
cd studio
npx sanity deploy
```

## 内容管理

Sanity 管理三类公开内容：

- `essay`：随笔
- `review`：书影音
- `timeline`：时间线

前台只展示 `published = true` 的内容。草稿不会出现在前台。

## 动态渲染

内容页通过 Astro 服务端/按请求渲染从 Sanity 读取内容。Sanity 发布新内容后，访客刷新页面即可看到更新，不需要每次重新部署前台。

## v0.2.1 内容体验

- 书影音使用 5 分制评分，并以 `4.3/5` 和五星展示。
- 书影音缺少封面时，会按音乐、书籍、影视使用不同默认封面。
- 书影音条目支持详情页，长评为可选内容。
- 随笔和书影音列表使用轻量分页。
- 内容为空时显示温和空状态。

## v0.2.2 页面导航与浏览控制

- 详情页增加面包屑与“退出阅读”入口。
- 随笔和书影音分页升级为可点击页码的通用控件。
- 修复随笔筛选时卡片宽度抖动。
- 桌面端标题区和关键子导航在滚动时保持可见。

## v0.3 AI 对话

- 首页聊天接入 DeepSeek 流式 API（`deepseek-v4-pro`）。
- 系统提示词由 `personaRules` 与 `PERSONA_BRIEF` 组装。
- 同标签页内 sessionStorage 保留最近 10 轮对话。
- 开发环境无 API Key 时自动回退模拟回复；生产环境返回 503。

## 内容安全

不要把真实人格说明书、ChatGPT 历史、近期状态摘要、私人笔记、私密 RAG 材料提交到公开 GitHub 仓库。

v0.2.x 只处理公开内容和普通草稿。

## 验证

```bash
npm run test
npm run build
npm run test:e2e
```
