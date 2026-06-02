# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first version of a Chinese personal website with a ChatGPT-like simulated AI homepage, essays, reviews, timeline, semi-real guestbook, and about page.

**Architecture:** Use Astro as a static-first content site with MDX content collections. The homepage is an app-like chat surface; content pages share a common sidebar layout and typed content model. AI/RAG is represented by clean simulated-chat boundaries and hidden persona configuration so real API/RAG can be added without restructuring the site.

**Tech Stack:** Astro, TypeScript, MDX, Astro Content Collections, CSS, Vitest, Playwright.

---

## File Structure

Create this structure:

```text
.
├── astro.config.mjs
├── package.json
├── playwright.config.ts
├── public/
│   └── covers/
│       └── reviews/
│           ├── after-hours.svg
│           ├── private-language.svg
│           └── late-spring.svg
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── components/
│   │   ├── ChatHome.astro
│   │   ├── GuestbookForm.astro
│   │   ├── ReviewTabs.astro
│   │   ├── Sidebar.astro
│   │   └── TimelineAxis.astro
│   ├── content/
│   │   ├── config.ts
│   │   ├── essays/
│   │   │   ├── hold-the-sound.mdx
│   │   │   ├── night-walk.mdx
│   │   │   └── small-room.mdx
│   │   ├── reviews/
│   │   │   ├── album-after-hours.mdx
│   │   │   ├── book-private-language.mdx
│   │   │   └── film-late-spring.mdx
│   │   └── timeline/
│   │       ├── website-begins.mdx
│   │       └── music-archive.mdx
│   ├── data/
│   │   ├── chatPresets.ts
│   │   └── persona.private.ts
│   ├── layouts/
│   │   ├── AppLayout.astro
│   │   └── ContentLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── guestbook.astro
│   │   ├── reviews.astro
│   │   ├── timeline.astro
│   │   └── essays/
│   │       ├── index.astro
│   │       └── [slug].astro
│   └── styles/
│       └── global.css
├── tests/
│   ├── content-schema.test.ts
│   └── chat-presets.test.ts
└── e2e/
    └── smoke.spec.ts
```

Responsibilities:

- `src/content/config.ts`: validates MDX frontmatter and keeps future RAG metadata typed.
- `src/data/chatPresets.ts`: owns simulated chat suggestions and keyword responses.
- `src/data/persona.private.ts`: hidden persona configuration; it is imported only by tests or future API code, not rendered as a public route.
- `src/layouts/AppLayout.astro`: full app shell for homepage and content pages.
- `src/components/Sidebar.astro`: top module navigation and lower chat list.
- `src/components/ChatHome.astro`: homepage chat surface and simulated message behavior.
- `src/components/ReviewTabs.astro`: `/reviews` category tabs.
- `src/components/TimelineAxis.astro`: coordinate-axis-style timeline.

## Task 1: Scaffold Astro Project

**Files:**

- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/env.d.ts`
- Create: `src/styles/global.css`

- [ ] **Step 1: Create package metadata and scripts**

Create `package.json` with this content:

```json
{
  "name": "personal-website",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.4",
    "@astrojs/mdx": "^4.0.8",
    "astro": "^5.0.0",
    "typescript": "^5.6.3"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create Astro and TypeScript configuration**

Create `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Create `src/env.d.ts`:

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 3: Create test configuration**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://127.0.0.1:4321',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
});
```

- [ ] **Step 4: Create global style foundation**

Create `src/styles/global.css`:

```css
:root {
  color-scheme: light;
  --bg: #fbfaf6;
  --panel: #f0f4ee;
  --panel-strong: #e2eadf;
  --text: #20251f;
  --muted: #697067;
  --line: #dfe4da;
  --accent: #5f8f86;
  --accent-soft: #dcece8;
  --gold: #b89a55;
  font-family: "Inter", "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
  margin: 0;
  background: var(--bg);
  color: var(--text);
}

body {
  line-height: 1.65;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
textarea {
  font: inherit;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 5: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules` and `package-lock.json` are created without dependency resolution errors.

- [ ] **Step 6: Verify baseline scripts exist**

Run:

```powershell
npm run test
```

Expected: Vitest reports no tests found or no test files. If Vitest exits non-zero because no tests exist, continue; Task 2 adds tests.

- [ ] **Step 7: Commit scaffold**

Run:

```powershell
git add package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts src/env.d.ts src/styles/global.css
git commit -m "feat: scaffold astro site"
```

## Task 2: Define Content Collections And Sample Content

**Files:**

- Create: `src/content/config.ts`
- Create: `tests/content-schema.test.ts`
- Create: sample MDX files under `src/content/essays`, `src/content/reviews`, and `src/content/timeline`

- [ ] **Step 1: Write schema tests**

Create `tests/content-schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { essaySchema, reviewSchema, timelineSchema } from '../src/content/config';

describe('content schemas', () => {
  it('accepts an essay with optional mood and public visibility', () => {
    const parsed = essaySchema.parse({
      title: '夜里散步',
      date: new Date('2026-06-02'),
      summary: '一段关于夜晚和走路的短记。',
      tags: ['日常'],
      mood: '安静',
      visibility: 'public',
    });

    expect(parsed.visibility).toBe('public');
  });

  it('accepts a review in the music category', () => {
    const parsed = reviewSchema.parse({
      title: 'After Hours',
      category: 'music',
      creator: 'The Weeknd',
      date: new Date('2026-06-02'),
      year: 2020,
      rating: 8.5,
      summary: '霓虹、疲惫和一点危险的浪漫。',
      cover: {
        src: '/covers/reviews/after-hours.svg',
        alt: 'After Hours 的风格化封面',
      },
      tags: ['流行', '夜晚'],
      moments: ['夜里走路'],
      visibility: 'public',
    });

    expect(parsed.category).toBe('music');
  });

  it('marks timeline private notes as owner-only material', () => {
    const parsed = timelineSchema.parse({
      title: '开始搭个人网站',
      date: new Date('2026-06-02'),
      summary: '把个人网站从想法推进到设计。',
      tags: ['创作'],
      visibility: 'public',
      privateNotes: '这件事对我意味着重新整理表达方式。',
      privateNotesPolicy: 'owner_only',
    });

    expect(parsed.privateNotesPolicy).toBe('owner_only');
  });
});
```

- [ ] **Step 2: Run schema tests and verify failure**

Run:

```powershell
npm run test -- tests/content-schema.test.ts
```

Expected: FAIL because `src/content/config.ts` does not exist.

- [ ] **Step 3: Implement content schemas**

Create `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const visibilitySchema = z.enum(['public']).default('public');

export const essaySchema = z.object({
  title: z.string(),
  date: z.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  mood: z.string().optional(),
  visibility: visibilitySchema,
});

export const reviewSchema = z.object({
  title: z.string(),
  category: z.enum(['music', 'book', 'film']),
  creator: z.string(),
  date: z.date(),
  year: z.number().int(),
  rating: z.number().min(0).max(10),
  summary: z.string(),
  cover: z.object({
    src: z.string(),
    alt: z.string(),
  }),
  tags: z.array(z.string()).default([]),
  moments: z.array(z.string()).default([]),
  visibility: visibilitySchema,
});

export const timelineSchema = z.object({
  title: z.string(),
  date: z.date(),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  visibility: visibilitySchema,
  privateNotes: z.string().optional(),
  privateNotesPolicy: z.enum(['owner_only']).optional(),
});

const essays = defineCollection({
  type: 'content',
  schema: essaySchema,
});

const reviews = defineCollection({
  type: 'content',
  schema: reviewSchema,
});

const timeline = defineCollection({
  type: 'content',
  schema: timelineSchema,
});

export const collections = {
  essays,
  reviews,
  timeline,
};
```

- [ ] **Step 4: Add sample content**

Create `src/content/essays/night-walk.mdx`:

```mdx
---
title: 夜里散步
date: 2026-06-02
summary: 一段关于夜晚、步行和把念头放慢的短记。
tags: [日常, 城市]
mood: 安静
visibility: public
---

夜里走路的时候，很多白天没有位置安放的念头会慢慢靠近。

我喜欢这种不急着抵达的状态。路灯、风、远处的声音，都像是在提醒我：有些东西可以先不解释，只要被记下来。
```

Create `src/content/essays/small-room.mdx`:

```mdx
---
title: 小房间
date: 2026-06-01
summary: 关于私人空间和缓慢整理的一点想法。
tags: [自我, 写作]
mood: 清醒
visibility: public
---

我一直想要一个小房间，里面可以放下音乐、文字、犹豫和一些还没有成形的判断。

这个网站大概就是这样的房间。
```

Create `src/content/essays/hold-the-sound.mdx`:

```mdx
---
title: 把声音留住
date: 2026-05-28
summary: 有些专辑不是被听完，而是被反复带回某个时刻。
tags: [音乐, 记忆]
mood: 怀旧
visibility: public
---

我有时候会觉得，音乐不是背景，也不是装饰。它更像某种能保存空气湿度的容器。

一首歌被反复播放以后，就会和某段路、某个晚上、某种还没说出口的情绪绑在一起。
```

Create `src/content/reviews/album-after-hours.mdx`:

```mdx
---
title: After Hours
category: music
creator: The Weeknd
date: 2026-06-02
year: 2020
rating: 8.5
summary: 霓虹、疲惫和一点危险的浪漫。
cover:
  src: /covers/reviews/after-hours.svg
  alt: After Hours 的风格化封面
tags: [音乐, 流行, 夜晚]
moments: [夜里走路, 情绪很满的时候]
visibility: public
---

这张专辑最吸引我的地方，是它把华丽和疲惫放在一起。

它不是单纯的兴奋，更像一种在灯光里透支之后的清醒。
```

Create `src/content/reviews/book-private-language.mdx`:

```mdx
---
title: 私人语言
category: book
creator: 维特根斯坦
date: 2026-06-02
year: 1953
rating: 8
summary: 有些问题不是为了回答，而是为了把问题本身看清。
cover:
  src: /covers/reviews/private-language.svg
  alt: 私人语言的风格化封面
tags: [书籍, 哲学]
moments: [需要重新校准语言的时候]
visibility: public
---

读它的时候，我会意识到很多表达并不是不够准确，而是我们还没有弄清楚自己在使用什么规则。
```

Create `src/content/reviews/film-late-spring.mdx`:

```mdx
---
title: 晚春
category: film
creator: 小津安二郎
date: 2026-06-02
year: 1949
rating: 9
summary: 克制到几乎透明，却让人很难不被击中。
cover:
  src: /covers/reviews/late-spring.svg
  alt: 晚春的风格化封面
tags: [影视, 日本电影]
moments: [想安静地看完一段人生的时候]
visibility: public
---

它的情绪不靠推搡，而是靠留下空白。很多东西没有说出口，却一直在那里。
```

Create `src/content/timeline/website-begins.mdx`:

```mdx
---
title: 开始搭个人网站
date: 2026-06-02
summary: 把个人网站从想法推进到设计。
tags: [创作, 网站]
visibility: public
privateNotes: 这件事对我意味着重新整理自己的表达方式。
privateNotesPolicy: owner_only
---

公开时间线只显示这件事发生过。更深的意义不在页面上展开。
```

Create `src/content/timeline/music-archive.mdx`:

```mdx
---
title: 想做书影音档案
date: 2026-06-02
summary: 决定把音乐扩展成书籍、音乐、影视的统一评价空间。
tags: [书影音, 音乐]
visibility: public
privateNotes: 评分不是为了显得客观，而是为了保存当时的判断。
privateNotesPolicy: owner_only
---

公开时间线记录这个决定。私密补充只供未来私人上下文使用。
```

- [ ] **Step 5: Verify schemas and Astro content**

Create stylized local cover assets for the sample reviews.

Create `public/covers/reviews/after-hours.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="After Hours 的风格化封面">
  <rect width="600" height="600" fill="#161b19"/>
  <circle cx="430" cy="170" r="110" fill="#b4934f"/>
  <path d="M0 600L600 190V600z" fill="#587f74"/>
  <text x="48" y="500" fill="#fffefa" font-family="serif" font-size="54">After Hours</text>
</svg>
```

Create `public/covers/reviews/private-language.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 620" role="img" aria-label="私人语言的风格化封面">
  <rect width="420" height="620" fill="#f6f0df"/>
  <rect width="42" height="620" fill="#d8cdb7"/>
  <circle cx="285" cy="180" r="82" fill="#dcebe4"/>
  <text x="82" y="480" fill="#263024" font-family="serif" font-size="48">私人语言</text>
</svg>
```

Create `public/covers/reviews/late-spring.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 620" role="img" aria-label="晚春的风格化封面">
  <rect width="420" height="620" fill="#efe8db"/>
  <rect y="340" width="420" height="280" fill="#789069"/>
  <path d="M60 380C130 300 230 300 320 380" fill="none" stroke="#fffefa" stroke-width="10"/>
  <text x="76" y="520" fill="#fffefa" font-family="serif" font-size="54">晚春</text>
</svg>
```

Run:

```powershell
npm run test -- tests/content-schema.test.ts
npm run build
```

Expected: tests pass and Astro validates content without schema errors.

- [ ] **Step 6: Commit content model**

Run:

```powershell
git add src/content public/covers/reviews tests/content-schema.test.ts
git commit -m "feat: define content collections"
```

## Task 3: Build Shared Layout And Sidebar

**Files:**

- Create: `src/layouts/AppLayout.astro`
- Create: `src/layouts/ContentLayout.astro`
- Create: `src/components/Sidebar.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create sidebar component**

Create `src/components/Sidebar.astro`:

```astro
---
const modules = [
  { href: '/', label: '和我聊天' },
  { href: '/essays', label: '随笔' },
  { href: '/reviews', label: '书影音' },
  { href: '/timeline', label: '时间线' },
  { href: '/guestbook', label: '访客簿' },
  { href: '/about', label: '关于' },
];

const chats = ['今天适合听什么？', '随机聊一篇随笔', '你最近在想什么？', '介绍一下这个网站'];
---

<aside class="sidebar" aria-label="站点导航">
  <div class="sidebar__brand">
    <a href="/">未命名的小站</a>
    <span>一个私人化的中文空间</span>
  </div>

  <nav class="sidebar__modules" aria-label="主要模块">
    {modules.map((item) => (
      <a href={item.href}>{item.label}</a>
    ))}
  </nav>

  <div class="sidebar__chats">
    <p>聊天</p>
    {chats.map((chat) => (
      <a href={`/?prompt=${encodeURIComponent(chat)}`}>{chat}</a>
    ))}
  </div>
</aside>
```

- [ ] **Step 2: Create app layout**

Create `src/layouts/AppLayout.astro`:

```astro
---
import Sidebar from '../components/Sidebar.astro';
import '../styles/global.css';

interface Props {
  title?: string;
}

const { title = '未命名的小站' } = Astro.props;
---

<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <div class="app-shell">
      <Sidebar />
      <main class="app-main">
        <slot />
      </main>
    </div>
  </body>
</html>
```

- [ ] **Step 3: Create content layout**

Create `src/layouts/ContentLayout.astro`:

```astro
---
import AppLayout from './AppLayout.astro';

interface Props {
  title: string;
  eyebrow?: string;
}

const { title, eyebrow } = Astro.props;
---

<AppLayout title={`${title} - 未命名的小站`}>
  <section class="content-page">
    {eyebrow && <p class="eyebrow">{eyebrow}</p>}
    <h1>{title}</h1>
    <slot />
  </section>
</AppLayout>
```

- [ ] **Step 4: Add layout CSS**

Append to `src/styles/global.css`:

```css
.app-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
}

.app-main {
  min-width: 0;
}

.sidebar {
  min-height: 100vh;
  padding: 18px 16px;
  background: var(--panel);
  border-right: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sidebar__brand a {
  display: block;
  font-weight: 700;
  margin-bottom: 4px;
}

.sidebar__brand span,
.sidebar__chats p,
.eyebrow {
  color: var(--muted);
  font-size: 0.86rem;
}

.sidebar__modules,
.sidebar__chats {
  display: grid;
  gap: 6px;
}

.sidebar__modules a,
.sidebar__chats a {
  border-radius: 8px;
  padding: 9px 10px;
}

.sidebar__modules a:hover,
.sidebar__chats a:hover {
  background: var(--panel-strong);
}

.content-page {
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
  padding: 64px 0;
}

.content-page h1 {
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.15;
  margin: 0 0 28px;
}

@media (max-width: 760px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .sidebar__chats {
    margin-top: 0;
  }
}
```

- [ ] **Step 5: Create temporary homepage for layout verification**

Create `src/pages/index.astro` with temporary content:

```astro
---
import AppLayout from '../layouts/AppLayout.astro';
---

<AppLayout title="和我聊天 - 未命名的小站">
  <section class="chat-home">
    <h1>我们从哪里开始呢？</h1>
  </section>
</AppLayout>
```

- [ ] **Step 6: Verify layout builds**

Run:

```powershell
npm run build
```

Expected: Astro build succeeds and `/` is generated.

- [ ] **Step 7: Commit layout**

Run:

```powershell
git add src/components/Sidebar.astro src/layouts src/pages/index.astro src/styles/global.css
git commit -m "feat: add app layout and sidebar"
```

## Task 4: Implement Simulated Chat Homepage

**Files:**

- Create: `src/data/chatPresets.ts`
- Create: `tests/chat-presets.test.ts`
- Create: `src/components/ChatHome.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write chat preset tests**

Create `tests/chat-presets.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { getSimulatedReply, suggestedPrompts } from '../src/data/chatPresets';

describe('chat presets', () => {
  it('includes first-person recent-thought prompt', () => {
    expect(suggestedPrompts).toContain('你最近在想什么？');
  });

  it('routes music questions toward reviews', () => {
    expect(getSimulatedReply('给我推荐一点音乐')).toContain('/reviews');
  });

  it('admits the real AI is not connected for unknown inputs', () => {
    expect(getSimulatedReply('一个很随机的问题')).toContain('还没有接入真正的 AI');
  });
});
```

- [ ] **Step 2: Run chat tests and verify failure**

Run:

```powershell
npm run test -- tests/chat-presets.test.ts
```

Expected: FAIL because `src/data/chatPresets.ts` does not exist.

- [ ] **Step 3: Implement simulated chat data**

Create `src/data/chatPresets.ts`:

```ts
export const suggestedPrompts = ['你最近在想什么？', '最近听了什么？', '随机聊一篇随笔', '介绍一下这个网站'];

const replies = [
  {
    keywords: ['你是谁', '介绍'],
    reply: '我是这个网站的对话入口，一个先被模拟出来的 AI 分身。现在我还没有接入真正的 AI，但我会慢慢从随笔、书影音和时间线里长出更具体的回答。',
  },
  {
    keywords: ['音乐', '听'],
    reply: '如果你想从声音开始，可以先去 /reviews 的音乐标签看看。那里会放一些评分、短评，以及适合在什么时刻听的记录。',
  },
  {
    keywords: ['随笔', '文章'],
    reply: '随笔更像这个网站的呼吸。你可以从 /essays 进去，那里会放生活、城市、关系和一些还没有定型的念头。',
  },
  {
    keywords: ['时间线', '最近'],
    reply: '最近我在想怎么把一些松散的内容收拢起来：随笔、书影音、时间线，还有这个像对话入口一样的首页。更私人的部分不会被原文展开。',
  },
];

export function getSimulatedReply(input: string): string {
  const normalized = input.trim().toLowerCase();
  const match = replies.find((item) => item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())));
  return match?.reply ?? '我还没有接入真正的 AI，所以现在只能给出一段模拟回答。等公开 RAG 接上以后，我会从已经发布的文字和书影音记录里找线索。';
}
```

- [ ] **Step 4: Create chat homepage component**

Create `src/components/ChatHome.astro`:

```astro
---
import { suggestedPrompts } from '../data/chatPresets';
---

<section class="chat-home" data-chat-home>
  <div class="chat-home__intro" data-chat-intro>
    <h1>我们从哪里开始呢？</h1>
    <div class="prompt-row" aria-label="建议问题">
      {suggestedPrompts.map((prompt) => (
        <button type="button" data-prompt={prompt}>{prompt}</button>
      ))}
    </div>
  </div>

  <div class="chat-thread" data-chat-thread aria-live="polite"></div>

  <div class="chat-home__composer">
    <form class="chat-box" data-chat-form>
      <label class="sr-only" for="chat-input">输入问题</label>
      <input id="chat-input" name="message" placeholder="有问题，尽管问" autocomplete="off" data-chat-input />
      <button type="submit">发送</button>
    </form>
  </div>
</section>

<script>
  import { getSimulatedReply } from '../data/chatPresets';

  const home = document.querySelector('[data-chat-home]');
  const form = document.querySelector('[data-chat-form]');
  const input = document.querySelector('[data-chat-input]');
  const thread = document.querySelector('[data-chat-thread]');
  const promptButtons = document.querySelectorAll('[data-prompt]');

  function addMessage(role, text) {
    const message = document.createElement('div');
    message.className = `chat-message chat-message--${role}`;
    message.textContent = text;
    thread?.append(message);
    message.scrollIntoView({ block: 'end', behavior: 'smooth' });
    return message;
  }

  function submitMessage(text) {
    const value = text.trim();
    if (!value) return;
    home?.classList.add('chat-home--active');
    addMessage('user', value);
    const pending = addMessage('assistant', '正在整理一小段回答');
    pending.classList.add('chat-message--typing');
    window.setTimeout(() => {
      pending.classList.remove('chat-message--typing');
      pending.textContent = getSimulatedReply(value);
    }, 420);
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input instanceof HTMLInputElement ? input.value : '';
    submitMessage(value);
    if (input instanceof HTMLInputElement) input.value = '';
  });

  promptButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const prompt = button.getAttribute('data-prompt') ?? '';
      submitMessage(prompt);
    });
  });
</script>
```

- [ ] **Step 5: Wire homepage**

Replace `src/pages/index.astro` with:

```astro
---
import ChatHome from '../components/ChatHome.astro';
import AppLayout from '../layouts/AppLayout.astro';
---

<AppLayout title="和我聊天 - 未命名的小站">
  <ChatHome />
</AppLayout>
```

- [ ] **Step 6: Add chat styles**

Append to `src/styles/global.css`:

```css
.chat-home {
  min-height: 100vh;
  display: grid;
  grid-template-rows: 1fr auto;
  padding: 36px;
}

.chat-home__intro {
  align-self: center;
  justify-self: center;
  width: min(780px, 100%);
  text-align: center;
  transition: opacity 180ms ease, transform 180ms ease;
}

.chat-home h1 {
  margin: 0 0 32px;
  font-size: clamp(1.9rem, 5vw, 3rem);
  line-height: 1.2;
}

.chat-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 30px;
  background: #fff;
  box-shadow: 0 18px 42px rgba(32, 37, 31, 0.08);
}

.chat-home__composer {
  width: min(780px, 100%);
  justify-self: center;
  align-self: center;
}

.chat-home--active .chat-home__intro {
  display: none;
}

.chat-home--active .chat-home__composer {
  position: sticky;
  bottom: 24px;
  align-self: end;
}

.chat-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  padding: 8px 12px;
}

.chat-box button,
.prompt-row button {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--text);
  padding: 8px 14px;
  cursor: pointer;
}

.prompt-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.chat-thread {
  display: grid;
  gap: 10px;
  width: min(780px, 100%);
  margin: 0 auto 28px;
  align-content: end;
  text-align: left;
}

.chat-message {
  max-width: 78%;
  border-radius: 18px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--line);
}

.chat-message--user {
  justify-self: end;
  background: var(--accent-soft);
}

.chat-message--assistant {
  justify-self: start;
}

.chat-message--typing::after {
  content: "▋";
  color: var(--accent);
  animation: chat-cursor 1s step-end infinite;
}

@keyframes chat-cursor {
  50% {
    opacity: 0;
  }
}
```

- [ ] **Step 7: Verify chat behavior**

Run:

```powershell
npm run test -- tests/chat-presets.test.ts
npm run build
```

Expected: tests and build pass.

- [ ] **Step 8: Commit chat homepage**

Run:

```powershell
git add src/data/chatPresets.ts tests/chat-presets.test.ts src/components/ChatHome.astro src/pages/index.astro src/styles/global.css
git commit -m "feat: add simulated chat homepage"
```

## Task 5: Implement Essays Pages

**Files:**

- Create: `src/pages/essays/index.astro`
- Create: `src/pages/essays/[slug].astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create essays list**

Create `src/pages/essays/index.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';

const essays = (await getCollection('essays')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
const years = [...new Set(essays.map((essay) => String(essay.data.date.getFullYear())))];
const tags = [...new Set(essays.flatMap((essay) => essay.data.tags))];
---

<ContentLayout title="随笔" eyebrow="Essays">
  <div class="essay-index">
    <div class="entry-list" data-essay-list>
      {essays.map((essay) => (
        <a class="entry-card" href={`/essays/${essay.slug}`} data-year={essay.data.date.getFullYear()} data-tags={essay.data.tags.join(',')}>
          <time datetime={essay.data.date.toISOString()}>{essay.data.date.toLocaleDateString('zh-CN')}</time>
          <div>
            <h2>{essay.data.title}</h2>
            <p>{essay.data.summary}</p>
            <div class="tag-row">
              {essay.data.mood && <span>{essay.data.mood}</span>}
              {essay.data.tags.map((tag) => <span>{tag}</span>)}
            </div>
          </div>
        </a>
      ))}
    </div>

    <aside class="essay-filter" aria-label="随笔筛选">
      <section>
        <h2>时间</h2>
        <div class="filter-row">
          <button type="button" class="filter-chip is-active" data-filter-year="all">全部</button>
          {years.map((year) => <button type="button" class="filter-chip" data-filter-year={year}>{year}</button>)}
        </div>
      </section>

      <section>
        <h2>标签</h2>
        <div class="filter-row">
          <button type="button" class="filter-chip is-active" data-filter-tag="all">全部</button>
          {tags.map((tag) => <button type="button" class="filter-chip" data-filter-tag={tag}>{tag}</button>)}
        </div>
      </section>

      <section>
        <h2>和这些文字聊天</h2>
        <a class="essay-chat-link" href="/?prompt=%E9%9A%8F%E6%9C%BA%E8%81%8A%E4%B8%80%E7%AF%87%E9%9A%8F%E7%AC%94">随机聊一篇随笔</a>
        <a class="essay-chat-link" href="/?prompt=%E8%BF%99%E4%BA%9B%E9%9A%8F%E7%AC%94%E5%8F%8D%E5%A4%8D%E5%9C%A8%E5%86%99%E4%BB%80%E4%B9%88">这些随笔反复在写什么？</a>
      </section>
    </aside>
  </div>
</ContentLayout>

<script>
  const yearButtons = document.querySelectorAll('[data-filter-year]');
  const tagButtons = document.querySelectorAll('[data-filter-tag]');
  const entries = document.querySelectorAll('[data-year][data-tags]');
  let selectedYear = 'all';
  let selectedTag = 'all';

  function updateActive(buttons, selectedValue, attribute) {
    buttons.forEach((button) => {
      button.classList.toggle('is-active', button.getAttribute(attribute) === selectedValue);
    });
  }

  function applyFilters() {
    entries.forEach((entry) => {
      const yearMatches = selectedYear === 'all' || entry.getAttribute('data-year') === selectedYear;
      const tagList = (entry.getAttribute('data-tags') ?? '').split(',');
      const tagMatches = selectedTag === 'all' || tagList.includes(selectedTag);
      entry.toggleAttribute('hidden', !(yearMatches && tagMatches));
    });
    updateActive(yearButtons, selectedYear, 'data-filter-year');
    updateActive(tagButtons, selectedTag, 'data-filter-tag');
  }

  yearButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedYear = button.getAttribute('data-filter-year') ?? 'all';
      applyFilters();
    });
  });

  tagButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedTag = button.getAttribute('data-filter-tag') ?? 'all';
      applyFilters();
    });
  });
</script>
```

- [ ] **Step 2: Create essay detail page**

Create `src/pages/essays/[slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import ContentLayout from '../../layouts/ContentLayout.astro';

export async function getStaticPaths() {
  const essays = await getCollection('essays');
  return essays.map((essay) => ({ params: { slug: essay.slug }, props: { essay } }));
}

const { essay } = Astro.props;
const { Content } = await essay.render();
---

<ContentLayout title={essay.data.title} eyebrow={essay.data.date.toLocaleDateString('zh-CN')}>
  <article class="prose">
    <p class="lead">{essay.data.summary}</p>
    <Content />
  </article>
</ContentLayout>
```

- [ ] **Step 3: Add content list styles**

Append to `src/styles/global.css`:

```css
.entry-list {
  display: grid;
  gap: 14px;
}

.essay-index {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 42px;
}

.entry-card {
  display: grid;
  grid-template-columns: 120px minmax(0, 1fr);
  gap: 28px;
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.entry-card time {
  color: var(--muted);
  font-size: 0.9rem;
}

.entry-card h2 {
  margin: 6px 0;
  font-size: 1.3rem;
}

.entry-card p {
  margin: 0 0 12px;
  color: var(--muted);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-row span {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 3px 9px;
  color: var(--muted);
  font-size: 0.86rem;
}

.essay-filter {
  position: sticky;
  top: 24px;
  align-self: start;
  border-left: 1px solid var(--line);
  padding-left: 22px;
}

.essay-filter section + section {
  margin-top: 24px;
}

.essay-filter h2 {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip,
.essay-chat-link {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--muted);
  padding: 6px 10px;
  cursor: pointer;
}

.filter-chip.is-active {
  background: var(--accent-soft);
  color: var(--text);
}

.essay-chat-link {
  display: block;
  border-radius: 10px;
  margin-bottom: 8px;
}

@media (max-width: 900px) {
  .essay-index {
    grid-template-columns: 1fr;
  }

  .essay-filter {
    position: static;
    border-left: 0;
    padding-left: 0;
  }
}

.prose {
  max-width: 760px;
  font-size: 1.06rem;
}

.prose .lead {
  color: var(--muted);
  font-size: 1.15rem;
}
```

- [ ] **Step 4: Verify essays routes**

Run:

```powershell
npm run build
```

Expected: `/essays/index.html`, `/essays/night-walk/index.html`, and `/essays/small-room/index.html` are generated.

- [ ] **Step 5: Commit essays**

Run:

```powershell
git add src/pages/essays src/styles/global.css
git commit -m "feat: add essays pages"
```

## Task 6: Implement Reviews Tabs

**Files:**

- Create: `src/components/ReviewTabs.astro`
- Create: `src/pages/reviews.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create review tabs component**

Create `src/components/ReviewTabs.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  reviews: CollectionEntry<'reviews'>[];
}

const { reviews } = Astro.props;
const categories = [
  { key: 'music', label: '音乐' },
  { key: 'book', label: '书籍' },
  { key: 'film', label: '影视' },
] as const;
---

<div class="review-tabs">
  <div class="review-tabs__controls" role="tablist" aria-label="书影音分类">
    {categories.map((category, index) => (
      <button type="button" role="tab" aria-selected={index === 0 ? 'true' : 'false'} data-review-tab={category.key}>
        {category.label}
      </button>
    ))}
  </div>

  {categories.map((category, index) => (
    <section class="review-panel" data-review-panel={category.key} hidden={index !== 0}>
      {reviews.filter((review) => review.data.category === category.key).map((review) => (
        <article class="review-card">
          <img class="review-card__cover" src={review.data.cover.src} alt={review.data.cover.alt} loading="lazy" />
          <div class="review-card__body">
            <p>{review.data.creator} · {review.data.year}</p>
            <h2>{review.data.title}</h2>
            <p>{review.data.summary}</p>
            <strong>{review.data.rating.toFixed(1)}</strong>
            <div class="tag-row">
              {review.data.tags.map((tag) => <span>{tag}</span>)}
              {review.data.moments.map((moment) => <span>{moment}</span>)}
            </div>
          </div>
        </article>
      ))}
    </section>
  ))}
</div>

<script>
  const tabs = document.querySelectorAll('[data-review-tab]');
  const panels = document.querySelectorAll('[data-review-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selected = tab.getAttribute('data-review-tab');
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      panels.forEach((panel) => {
        panel.toggleAttribute('hidden', panel.getAttribute('data-review-panel') !== selected);
      });
    });
  });
</script>
```

- [ ] **Step 2: Create reviews page**

Create `src/pages/reviews.astro`:

```astro
---
import { getCollection } from 'astro:content';
import ReviewTabs from '../components/ReviewTabs.astro';
import ContentLayout from '../layouts/ContentLayout.astro';

const reviews = (await getCollection('reviews')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

<ContentLayout title="书影音" eyebrow="Reviews">
  <p class="lead">音乐、书籍和影视，先按留下的回声整理。</p>
  <ReviewTabs reviews={reviews} />
</ContentLayout>
```

- [ ] **Step 3: Add reviews styles**

Append to `src/styles/global.css`:

```css
.review-tabs__controls {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
}

.review-tabs__controls button {
  border: 0;
  border-radius: 999px;
  background: transparent;
  padding: 8px 16px;
  cursor: pointer;
}

.review-tabs__controls button[aria-selected="true"] {
  background: var(--accent-soft);
  color: var(--text);
}

.review-panel {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 24px;
}

.review-card {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 18px;
  min-height: 236px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.64);
}

.review-card__cover {
  width: 132px;
  height: 174px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.review-card__body {
  min-width: 0;
}

.review-card h2,
.review-card p {
  margin: 0 0 6px;
}

.review-card p {
  color: var(--muted);
}

.review-card strong {
  display: block;
  margin-top: 14px;
  color: var(--gold);
  font-size: 1.5rem;
}

@media (max-width: 980px) {
  .review-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .review-card {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .review-card__cover {
    width: 96px;
    height: 126px;
  }
}
```

- [ ] **Step 4: Verify reviews**

Run:

```powershell
npm run build
```

Expected: `/reviews/index.html` builds and contains the text `书影音`.

- [ ] **Step 5: Commit reviews**

Run:

```powershell
git add src/components/ReviewTabs.astro src/pages/reviews.astro src/styles/global.css
git commit -m "feat: add reviews tabs"
```

## Task 7: Implement Timeline Axis

**Files:**

- Create: `src/components/TimelineAxis.astro`
- Create: `src/pages/timeline.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create timeline component**

Create `src/components/TimelineAxis.astro`:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  events: CollectionEntry<'timeline'>[];
}

const { events } = Astro.props;
---

<ol class="timeline-axis" aria-label="时间线">
  {events.map((event) => (
    <li>
      <time datetime={event.data.date.toISOString()}>{event.data.date.toLocaleDateString('zh-CN')}</time>
      <div>
        <h2>{event.data.title}</h2>
        <p>{event.data.summary}</p>
        <div class="tag-row">
          {event.data.tags.map((tag) => <span>{tag}</span>)}
        </div>
      </div>
    </li>
  ))}
</ol>
```

- [ ] **Step 2: Create timeline page**

Create `src/pages/timeline.astro`:

```astro
---
import { getCollection } from 'astro:content';
import TimelineAxis from '../components/TimelineAxis.astro';
import ContentLayout from '../layouts/ContentLayout.astro';

const events = (await getCollection('timeline')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---

<ContentLayout title="时间线" eyebrow="Timeline">
  <p class="lead">一些公开的坐标点。更私人的意义不在这里展开。</p>
  <TimelineAxis events={events} />
</ContentLayout>
```

- [ ] **Step 3: Add coordinate-axis styles**

Append to `src/styles/global.css`:

```css
.timeline-axis {
  list-style: none;
  margin: 36px 0 0;
  padding: 0;
  position: relative;
}

.timeline-axis::before {
  content: "";
  position: absolute;
  left: 132px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--line);
}

.timeline-axis li {
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 44px;
  position: relative;
  padding: 0 0 34px;
}

.timeline-axis li::before {
  content: "";
  position: absolute;
  left: 126px;
  top: 8px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  background: var(--bg);
}

.timeline-axis time {
  color: var(--muted);
  font-size: 0.92rem;
}

.timeline-axis h2 {
  margin: 0 0 6px;
  font-size: 1.2rem;
}

.timeline-axis p {
  margin: 0 0 10px;
  color: var(--muted);
}

@media (max-width: 640px) {
  .timeline-axis::before {
    left: 6px;
  }

  .timeline-axis li {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
    padding-left: 28px;
  }

  .timeline-axis li::before {
    left: 0;
  }
}
```

- [ ] **Step 4: Verify timeline**

Run:

```powershell
npm run build
```

Expected: `/timeline/index.html` builds and no private note text appears in generated public page source.

- [ ] **Step 5: Commit timeline**

Run:

```powershell
git add src/components/TimelineAxis.astro src/pages/timeline.astro src/styles/global.css
git commit -m "feat: add timeline axis"
```

## Task 8: Implement Guestbook And About

**Files:**

- Create: `src/components/GuestbookForm.astro`
- Create: `src/pages/guestbook.astro`
- Create: `src/pages/about.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create guestbook modal form**

Create `src/components/GuestbookForm.astro`:

```astro
<button type="button" class="guestbook-open" data-open-guestbook>留下留言</button>

<dialog class="guestbook-dialog" data-guestbook-dialog>
  <div class="guestbook-dialog__head">
    <strong>留下一点痕迹</strong>
    <button type="button" data-close-guestbook aria-label="关闭留言窗口">关闭</button>
  </div>
  <form class="guestbook-form" aria-describedby="guestbook-status">
    <label>
      名字
      <input type="text" name="name" placeholder="怎么称呼你" disabled />
    </label>
    <label>
      留言
      <textarea name="message" rows="5" placeholder="想留下一点什么" disabled></textarea>
    </label>
    <button type="button" disabled>暂未开放提交</button>
    <p id="guestbook-status">第一版先保留入口，不收集内容。以后这里会接入提交、审核和反垃圾。</p>
  </form>
</dialog>

<script>
  const dialog = document.querySelector('[data-guestbook-dialog]');
  const openButton = document.querySelector('[data-open-guestbook]');
  const closeButton = document.querySelector('[data-close-guestbook]');

  openButton?.addEventListener('click', () => {
    if (dialog instanceof HTMLDialogElement) dialog.showModal();
  });

  closeButton?.addEventListener('click', () => {
    if (dialog instanceof HTMLDialogElement) dialog.close();
  });
</script>
```

- [ ] **Step 2: Create guestbook page**

Create `src/pages/guestbook.astro`:

```astro
---
import GuestbookForm from '../components/GuestbookForm.astro';
import ContentLayout from '../layouts/ContentLayout.astro';

const visitors = [
  {
    name: '林间',
    time: '刚刚访问',
    message: '这里的首页很像一个能慢慢靠近的入口。希望以后能看到更多音乐记录。',
  },
  {
    name: 'Moon',
    time: '昨天访问',
    message: '随机聊一篇随笔这个入口很好，像抽到一张小纸条。',
  },
  {
    name: '周末读者',
    time: '三天前访问',
    message: '时间线那条轴线很安静，不像在展示成就，更像在标记生活。',
  },
];
---

<ContentLayout title="访客簿" eyebrow="Guestbook">
  <div class="guestbook-head">
    <p class="lead">最近来过的人，和他们留下的一点痕迹。</p>
    <GuestbookForm />
  </div>

  <div class="visitor-grid">
    {visitors.map((visitor) => (
      <article class="visitor-card">
        <p class="visitor-card__meta">{visitor.time}</p>
        <h2>{visitor.name}</h2>
        <p>{visitor.message}</p>
      </article>
    ))}
  </div>
</ContentLayout>
```

- [ ] **Step 3: Create about page**

Create `src/pages/about.astro`:

```astro
---
import ContentLayout from '../layouts/ContentLayout.astro';
---

<ContentLayout title="关于" eyebrow="About">
  <article class="prose">
    <p class="lead">这里不是简历，更像一个慢慢整理出来的小房间。</p>
    <p>我会在这里放一些生活随笔、书影音评价、时间线，以及一个先被模拟出来的 AI 对话入口。</p>
    <p>它不会替我作承诺，也不会假装知道所有事。它只是试着从公开文字和以后更完整的上下文里，回应那些愿意靠近的问题。</p>
  </article>
</ContentLayout>
```

- [ ] **Step 4: Add guestbook styles**

Append to `src/styles/global.css`:

```css
.guestbook-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.guestbook-open {
  border: 0;
  border-radius: 999px;
  background: var(--text);
  color: #fff;
  padding: 10px 16px;
  cursor: pointer;
}

.visitor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.visitor-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.64);
}

.visitor-card__meta,
.visitor-card p {
  color: var(--muted);
}

.visitor-card h2 {
  margin: 4px 0 6px;
  font-size: 1.15rem;
}

.guestbook-dialog {
  width: min(520px, calc(100% - 32px));
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 20px;
  background: var(--bg);
  color: var(--text);
  box-shadow: 0 28px 70px rgba(32, 37, 31, 0.14);
}

.guestbook-dialog::backdrop {
  background: rgba(32, 37, 31, 0.18);
}

.guestbook-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.guestbook-dialog__head button {
  border: 1px solid var(--line);
  border-radius: 999px;
  background: #fff;
  color: var(--muted);
  padding: 6px 10px;
}

.guestbook-form {
  display: grid;
  gap: 16px;
}

.guestbook-form label {
  display: grid;
  gap: 8px;
  color: var(--muted);
}

.guestbook-form input,
.guestbook-form textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 12px;
  background: #fff;
  color: var(--text);
}

.guestbook-form button {
  justify-self: start;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--panel);
  padding: 9px 16px;
  color: var(--muted);
}

.guestbook-form p {
  color: var(--muted);
}

@media (max-width: 760px) {
  .guestbook-head {
    align-items: start;
    flex-direction: column;
  }

  .visitor-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 5: Verify pages**

Run:

```powershell
npm run build
```

Expected: `/guestbook/index.html` and `/about/index.html` build successfully.

- [ ] **Step 6: Commit guestbook and about**

Run:

```powershell
git add src/components/GuestbookForm.astro src/pages/guestbook.astro src/pages/about.astro src/styles/global.css
git commit -m "feat: add guestbook and about pages"
```

## Task 9: Add Hidden Persona Configuration

**Files:**

- Create: `src/data/persona.private.ts`
- Create: `tests/persona-private.test.ts`

- [ ] **Step 1: Write persona privacy tests**

Create `tests/persona-private.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { personaRules } from '../src/data/persona.private';

describe('hidden persona rules', () => {
  it('requires first-person answers and no private quotations', () => {
    expect(personaRules.voice).toBe('first_person');
    expect(personaRules.privateMaterialPolicy).toBe('summarize_without_quoting');
  });

  it('keeps persona hidden from navigation by design', () => {
    expect(personaRules.publicRoute).toBeNull();
  });
});
```

- [ ] **Step 2: Run persona test and verify failure**

Run:

```powershell
npm run test -- tests/persona-private.test.ts
```

Expected: FAIL because `src/data/persona.private.ts` does not exist.

- [ ] **Step 3: Implement hidden persona configuration**

Create `src/data/persona.private.ts`:

```ts
export const personaRules = {
  publicRoute: null,
  voice: 'first_person',
  userAddress: 'second_person',
  privateMaterialPolicy: 'summarize_without_quoting',
  boundaries: [
    '不要假装作者本人实时在线',
    '不要替作者作出现实承诺',
    '不知道时承认不知道',
    '私人材料只能概括或转述，不能原文引用',
  ],
  tone: ['温和', '诚实', '清醒', '不鸡汤'],
} as const;
```

- [ ] **Step 4: Verify persona configuration**

Run:

```powershell
npm run test -- tests/persona-private.test.ts
npm run build
```

Expected: tests pass and no `/persona` route is generated.

- [ ] **Step 5: Commit persona config**

Run:

```powershell
git add src/data/persona.private.ts tests/persona-private.test.ts
git commit -m "feat: add hidden persona rules"
```

## Task 10: Add End-To-End Smoke Tests And Final Verification

**Files:**

- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: Write smoke tests**

Create `e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('homepage sends a simulated chat reply', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '我们从哪里开始呢？' })).toBeVisible();
  await page.getByLabel('输入问题').fill('你最近在想什么？');
  await page.getByRole('button', { name: '发送' }).click();
  await expect(page.locator('.chat-home--active')).toBeVisible();
  await expect(page.getByText('最近我在想怎么把一些松散的内容收拢起来')).toBeVisible();
});

test('essays can be filtered by tag', async ({ page }) => {
  await page.goto('/essays');
  await expect(page.getByRole('heading', { name: '随笔' })).toBeVisible();
  await page.getByRole('button', { name: '音乐' }).click();
  await expect(page.getByText('把声音留住')).toBeVisible();
  await expect(page.getByText('夜里散步')).toHaveCount(0);
});

test('reviews tabs expose music book and film', async ({ page }) => {
  await page.goto('/reviews');
  await expect(page.getByRole('heading', { name: '书影音' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '音乐' })).toBeVisible();
  await page.getByRole('tab', { name: '书籍' }).click();
  await expect(page.getByText('私人语言')).toBeVisible();
  await page.getByRole('tab', { name: '影视' }).click();
  await expect(page.getByText('晚春')).toBeVisible();
});

test('timeline does not expose private notes', async ({ page }) => {
  await page.goto('/timeline');
  await expect(page.getByRole('heading', { name: '时间线' })).toBeVisible();
  await expect(page.getByText('这件事对我意味着重新整理自己的表达方式')).toHaveCount(0);
});

test('guestbook shows visitors and opens inactive message modal', async ({ page }) => {
  await page.goto('/guestbook');
  await expect(page.getByText('林间')).toBeVisible();
  await page.getByRole('button', { name: '留下留言' }).click();
  await expect(page.getByRole('button', { name: '暂未开放提交' })).toBeVisible();
});

test('mobile layout keeps navigation and content usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: '随笔' })).toBeVisible();
  await expect(page.getByPlaceholder('有问题，尽管问')).toBeVisible();
});
```

- [ ] **Step 2: Install Playwright browser if needed**

Run:

```powershell
npx playwright install chromium
```

Expected: Chromium browser is installed for Playwright.

- [ ] **Step 3: Run full verification**

Run:

```powershell
npm run test
npm run build
npm run test:e2e
```

Expected:

- Vitest passes all unit tests.
- Astro check and build pass.
- Playwright smoke tests pass on desktop and mobile projects.

- [ ] **Step 4: Commit smoke tests**

Run:

```powershell
git add e2e/smoke.spec.ts
git commit -m "test: add site smoke tests"
```

## Self-Review

Spec coverage:

- ChatGPT-like homepage: Task 4 and Task 10.
- Chat active state with bottom composer and simulated streaming: Task 4 and Task 10.
- Sidebar with modules and chat list: Task 3.
- Essays list/detail: Task 5.
- Essay time/tag filters: Task 5 and Task 10.
- `/reviews` with music/book/film tabs: Task 6.
- Review covers and cover schema: Task 2 and Task 6.
- Content index pages use the available right-side workspace: Task 3 and Task 6.
- Coordinate-axis timeline: Task 7.
- Semi-real guestbook with recent visitor messages and modal form: Task 8 and Task 10.
- About page: Task 8.
- Hidden persona configuration, no public persona route: Task 9.
- Private timeline notes not publicly visible: Task 2, Task 7, Task 10.
- Simulated AI only, no real API/RAG/auth/database: Tasks 4 and 9 keep boundaries static.
- Responsive layout: Task 3 CSS and Task 10 mobile smoke test.

Placeholder scan:

- No placeholder markers or unspecified "add validation" steps are present.
- All files have concrete paths.
- Every code-changing task includes concrete code.

Type consistency:

- Review categories use `music`, `book`, and `film` in schema and tabs.
- Timeline private policy uses `owner_only` in schema and sample content.
- Persona voice uses `first_person`; private policy uses `summarize_without_quoting`.
