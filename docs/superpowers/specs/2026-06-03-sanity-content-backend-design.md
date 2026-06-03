# v0.2.0 Sanity 独立内容后台规格

## 版本定位

v0.2.0 是内容管理升级版。

目标是把随笔、书影音、时间线从本地 MDX 文件管理，迁移到独立部署的 Sanity Studio 后台。Astro 前台继续负责展示内容和保持现有视觉体验，Sanity Studio 负责新增、编辑、上传封面、草稿和发布。

这一版不做站内后台，不做 `/admin` 页面，不做 AI 生成，不做登录系统。

## 产品原则

- 前台网站保持纯粹，不出现后台入口。
- 后台独立存在，通过 Sanity Studio 地址进入。
- 内容编辑体验应该是可视化表单和富文本编辑，不要求作者手动改文件。
- v0.2.0 只管理公开内容和普通草稿。
- 私人人格资料、ChatGPT 历史、近期状态摘要、私密 RAG 材料不进入本版本范围。
- 现有前台页面风格尽量保持，只替换内容来源。

## 后台入口

后台入口是独立 Sanity Studio 地址，例如：

```txt
https://<project-name>.sanity.studio
```

本项目不新增 `/admin` 路由，不在主站导航、页脚或隐藏页面中加入后台入口。

后台地址可以记录在 README 的维护说明中，也可以由作者收藏在浏览器里。普通访客不需要知道后台存在。

## 项目结构

推荐采用同一 GitHub 仓库中的轻量 monorepo 结构：

```txt
/
  src/             Astro 前台
  studio/          Sanity Studio 配置与 schema
  docs/            规格与计划文档
```

Sanity Studio 和 Astro 前台可以共享 schema 命名和内容约定，但部署上保持独立：

- Astro 前台部署到站点域名。
- Sanity Studio 部署到 Sanity Studio 域名。

## 内容来源

v0.2.0 完成后，以下页面的数据来源切换为 Sanity：

```txt
/essays
/essays/[slug]
/reviews
/timeline
```

本地 `src/content` 中的旧样例内容不再作为真实内容来源。实现时可以选择保留少量样例用于测试或回退，但正式页面应以 Sanity 的已发布内容为准。

## 内容模型

### essay

用于随笔。

字段：

- `title`: 标题。
- `slug`: URL 标识。
- `date`: 发布日期或记录日期。
- `summary`: 摘要。
- `tags`: 标签数组。
- `mood`: 心情或状态，可选。
- `body`: 正文。
- `published`: 是否发布。

前台规则：

- `/essays` 只展示 `published = true` 的内容。
- `/essays/[slug]` 只允许访问已发布内容。
- 列表默认按 `date` 倒序。

### review

用于书影音。

字段：

- `title`: 作品标题。
- `category`: `music`、`book` 或 `film`。
- `creator`: 艺人、作者、导演或主要创作者。
- `year`: 作品年份。
- `date`: 记录日期。
- `rating`: 0 到 10 分。
- `cover`: 封面图片。
- `summary`: 短评或一句话印象。
- `tags`: 标签数组。
- `moments`: 触发时刻、记忆点或使用场景。
- `body`: 正文评价。
- `published`: 是否发布。

前台规则：

- `/reviews` 只展示已发布内容。
- 音乐、书籍、影视三个 tab 保持不变。
- 封面在前台仍使用统一尺寸容器，避免布局跳动。
- 列表默认按 `date` 倒序。

### timeline

用于时间线。

字段：

- `title`: 事件标题。
- `date`: 日期。
- `summary`: 公开摘要。
- `tags`: 标签数组。
- `body`: 正文或补充说明。
- `published`: 是否发布。

前台规则：

- `/timeline` 只展示已发布内容。
- 时间线保持克制的坐标轴视觉。
- 默认按 `date` 倒序或按页面现有时间线逻辑排序。

## 草稿与发布

Sanity Studio 中可以保存草稿，也可以将内容标记为发布。

前台只读取已发布内容。草稿不得出现在：

- 列表页。
- 详情页。
- 时间线。
- 构建后的静态输出。

## 图片与封面

书影音封面由 Sanity image asset 管理。

前台需要处理：

- 缺失封面时的默认占位。
- 不同原始比例封面在统一容器中的显示。
- 图片 alt 文本或可访问描述。

## 环境配置

Astro 前台需要通过环境变量连接 Sanity。

建议预留：

```txt
PUBLIC_SANITY_PROJECT_ID
PUBLIC_SANITY_DATASET
PUBLIC_SANITY_API_VERSION
```

如果只读取公开已发布内容，前台不应需要暴露私密 token。

本地 `.env` 不提交到 GitHub。README 中只说明变量名称和用途，不写真实值。

## README 要求

v0.2.0 需要补充 README，至少说明：

- 项目如何启动。
- 前台如何连接 Sanity。
- Sanity Studio 如何本地启动。
- Sanity Studio 独立部署地址如何记录。
- 哪些内容由 Sanity 管理。
- 哪些内容不能提交到 GitHub。
- 草稿和发布的展示规则。

## 非目标

v0.2.0 明确不做：

- `/admin` 页面。
- 站内后台。
- 网站自己的登录系统。
- 访客注册或登录。
- 真实访客簿提交。
- 真实 AI 聊天。
- AI 生成随笔、摘要、标签或草稿。
- RAG 检索。
- 私密资料管理。
- 前台页面内直接编辑内容。
- 用户权限管理。

## 验收标准

完成后应满足：

- Sanity Studio 可以独立运行和部署。
- Sanity Studio 中可以新增、编辑、草稿和发布随笔。
- Sanity Studio 中可以新增、编辑、草稿和发布书影音。
- Sanity Studio 中可以新增、编辑、草稿和发布时间线。
- Astro 前台从 Sanity 读取已发布内容。
- 草稿内容不会在前台展示。
- `/essays`、`/essays/[slug]`、`/reviews`、`/timeline` 保持现有主要视觉和交互。
- 缺少封面时有稳定占位。
- README 说明新的内容管理方式。
- `npm run test` 通过。
- `npm run build` 通过。
- 相关 e2e 测试通过或按新数据源更新后通过。

## 后续版本方向

v0.3.0 以后可以考虑：

- 真实 AI 聊天。
- RAG 内容索引。
- 访客登录。
- 真实访客簿。
- 私密内容库。
- 站内作者模式或编辑入口。

这些方向不影响 v0.2.0 的最小目标。
