# personal-website

一个中文个人网站与个人博客。首页是模拟 AI 聊天入口，内容空间包括随笔、书影音、时间线、访客簿和关于页。

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

## 内容安全

不要把真实人格说明书、ChatGPT 历史、近期状态摘要、私人笔记、私密 RAG 材料提交到公开 GitHub 仓库。

v0.2.x 只处理公开内容和普通草稿。

## 验证

```bash
npm run test
npm run build
npm run test:e2e
```
