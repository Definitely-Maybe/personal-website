# Sanity 内容后台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 v0.2.0：接入独立 Sanity Studio 后台，并让 Astro 前台动态读取 Sanity 中已发布的随笔、书影音和时间线内容。

**Architecture:** Sanity Studio 放在 `studio/`，独立部署，不在主站新增 `/admin`。Astro 前台改为服务端/按请求渲染，内容页通过统一内容访问层读取 Sanity；本地或测试环境没有 Sanity 配置时使用 fixture 内容兜底。页面组件消费统一的内容类型，不直接依赖 Astro Content Collections 或 Sanity 原始文档结构。

**Tech Stack:** Astro 5、Astro Vercel adapter、Sanity Studio、`@sanity/client`、`@sanity/image-url`、`@portabletext/to-html`、Vitest、Playwright。

---

## 参考资料

- Astro on-demand rendering: https://docs.astro.build/en/guides/on-demand-rendering/
- Astro Vercel adapter: https://docs.astro.build/en/guides/integrations-guide/vercel/
- Sanity Studio deployment: https://www.sanity.io/docs/studio/deployment
- Sanity client CDN configuration: https://www.sanity.io/docs/js-client-cdn-configuration
- Sanity schema types: https://www.sanity.io/docs/schema-types
- Portable Text HTML renderer: https://github.com/portabletext/to-html

## 文件结构

新增：

- `src/lib/content/types.ts`：前台统一内容类型。
- `src/lib/content/fixtures.ts`：本地开发和测试用 fixture 内容。
- `src/lib/content/sanityMappers.ts`：Sanity 原始文档到前台类型的映射。
- `src/lib/content/index.ts`：页面调用的内容访问 API。
- `src/lib/sanity/client.ts`：Sanity client 和配置检测。
- `src/lib/sanity/queries.ts`：GROQ 查询。
- `src/lib/sanity/image.ts`：Sanity 图片 URL 生成。
- `src/components/PortableBody.astro`：Portable Text 正文渲染。
- `tests/sanity-mappers.test.ts`：fixture、mapper、内容访问层测试。
- `.env.example`：Sanity 环境变量示例。
- `studio/`：独立 Sanity Studio。
- `studio/schemaTypes/essay.ts`：随笔 schema。
- `studio/schemaTypes/review.ts`：书影音 schema。
- `studio/schemaTypes/timeline.ts`：时间线 schema。

修改：

- `.gitignore`：忽略本地环境变量文件。
- `package.json`：添加依赖，版本升到 `0.2.0`。
- `package-lock.json`：依赖和版本同步。
- `astro.config.mjs`：启用 server output 和 Vercel adapter。
- `src/pages/essays/index.astro`：改为通过内容访问层读取随笔。
- `src/pages/essays/[slug].astro`：从静态路径改为动态 slug 查询。
- `src/pages/reviews.astro`：改为通过内容访问层读取书影音。
- `src/pages/timeline.astro`：改为通过内容访问层读取时间线。
- `src/components/ReviewTabs.astro`：使用统一 `Review[]` 类型。
- `src/components/TimelineAxis.astro`：使用统一 `TimelineEvent[]` 类型。
- `README.md`：说明 Sanity 后台、动态渲染、内容安全规则。

---

## Task 1: 配置 Astro 动态运行环境

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`
- Create: `.env.example`
- Modify: `astro.config.mjs`

- [ ] **Step 1: 安装依赖**

Run:

```powershell
npm install @astrojs/vercel @sanity/client @sanity/image-url @portabletext/to-html
```

Expected:

- `package.json` 增加以上依赖。
- `package-lock.json` 更新。

- [ ] **Step 2: 忽略本地环境变量**

在 `.gitignore` 追加：

```gitignore
.env
.env.local
.env.*.local
!.env.example
```

- [ ] **Step 3: 新增环境变量示例**

创建 `.env.example`：

```txt
PUBLIC_SANITY_PROJECT_ID=
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_API_VERSION=2026-06-03
PUBLIC_CONTENT_SOURCE=auto
```

说明：

- `PUBLIC_CONTENT_SOURCE=auto`：有 Sanity project id 时读取 Sanity，没有时使用 fixture。
- 生产部署应该填写 `PUBLIC_SANITY_PROJECT_ID`。

- [ ] **Step 4: 启用 Astro server output**

替换 `astro.config.mjs`：

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [mdx()],
});
```

- [ ] **Step 5: 验证**

Run:

```powershell
npm run test
npm run build
```

Expected:

- Vitest 通过。
- Astro server build 通过。

- [ ] **Step 6: 提交**

Run:

```powershell
git add package.json package-lock.json .gitignore .env.example astro.config.mjs
git commit -m "chore: configure dynamic astro runtime"
```

---

## Task 2: 增加统一内容类型和 fixture

**Files:**

- Create: `src/lib/content/types.ts`
- Create: `src/lib/content/fixtures.ts`
- Create: `tests/sanity-mappers.test.ts`

- [ ] **Step 1: 定义统一内容类型**

创建 `src/lib/content/types.ts`：

```ts
export type ReviewCategory = 'music' | 'book' | 'film';

export type PortableBlock = Record<string, unknown>;

export interface Essay {
  title: string;
  slug: string;
  date: Date;
  summary: string;
  tags: string[];
  mood?: string;
  body: PortableBlock[];
}

export interface ReviewCover {
  src: string;
  alt: string;
}

export interface Review {
  title: string;
  slug: string;
  category: ReviewCategory;
  creator: string;
  year: number;
  date: Date;
  rating: number;
  cover?: ReviewCover;
  summary: string;
  tags: string[];
  moments: string[];
  body: PortableBlock[];
}

export interface TimelineEvent {
  title: string;
  slug: string;
  date: Date;
  summary: string;
  tags: string[];
  body: PortableBlock[];
}
```

- [ ] **Step 2: 增加 fixture 内容**

创建 `src/lib/content/fixtures.ts`：

```ts
import type { Essay, Review, TimelineEvent } from './types';

const paragraph = (text: string) => [
  {
    _type: 'block',
    _key: text.slice(0, 12),
    style: 'normal',
    children: [{ _type: 'span', _key: `${text.slice(0, 8)}-span`, text }],
  },
];

export const fixtureEssays: Essay[] = [
  {
    title: '夜里散步',
    slug: 'night-walk',
    date: new Date('2026-06-02'),
    summary: '一段关于夜晚、步行和把念头放慢的短记。',
    tags: ['日常', '安静'],
    mood: '安静',
    body: paragraph('夜里散步的时候，很多白天没有位置的念头会慢慢浮上来。'),
  },
  {
    title: '小房间',
    slug: 'small-room',
    date: new Date('2026-06-01'),
    summary: '关于私人空间和缓慢整理的一点想法。',
    tags: ['自我', '写作'],
    body: paragraph('一个小房间并不只是空间，也是把自己重新收拢起来的方法。'),
  },
  {
    title: '把声音留住',
    slug: 'hold-the-sound',
    date: new Date('2026-05-28'),
    summary: '有些专辑不是被听完，而是被反复带回某个时刻。',
    tags: ['音乐', '记忆'],
    body: paragraph('声音有时比文字更先抵达某个记忆的位置。'),
  },
];

export const fixtureReviews: Review[] = [
  {
    title: 'After Hours',
    slug: 'album-after-hours',
    category: 'music',
    creator: 'The Weeknd',
    year: 2020,
    date: new Date('2026-06-02'),
    rating: 8.5,
    cover: { src: '/covers/reviews/after-hours.svg', alt: 'After Hours 的风格化封面' },
    summary: '霓虹、疲惫和一点危险的浪漫。',
    tags: ['夜晚', '流行'],
    moments: ['夜里走路'],
    body: paragraph('这张专辑像一条被灯光拖长的夜路。'),
  },
  {
    title: '私人语言',
    slug: 'book-private-language',
    category: 'book',
    creator: '维特根斯坦',
    year: 1953,
    date: new Date('2026-06-01'),
    rating: 8,
    cover: { src: '/covers/reviews/private-language.svg', alt: '私人语言的风格化封面' },
    summary: '有些问题不是为了回答，而是为了把问题本身看清。',
    tags: ['哲学', '语言'],
    moments: [],
    body: paragraph('它让我重新意识到语言不是透明容器。'),
  },
  {
    title: '晚春',
    slug: 'film-late-spring',
    category: 'film',
    creator: '小津安二郎',
    year: 1949,
    date: new Date('2026-05-30'),
    rating: 9,
    cover: { src: '/covers/reviews/late-spring.svg', alt: '晚春的风格化封面' },
    summary: '克制到几乎透明，却让人很难不被击中。',
    tags: ['日本电影', '安静'],
    moments: [],
    body: paragraph('小津的克制不是冷，而是让情绪自己慢慢显影。'),
  },
];

export const fixtureTimelineEvents: TimelineEvent[] = [
  {
    title: '开始搭个人网站',
    slug: 'website-begins',
    date: new Date('2026-06-02'),
    summary: '把个人网站从想法推进到设计。',
    tags: ['创作'],
    body: paragraph('这是重新整理表达方式的一个开始。'),
  },
  {
    title: '确定聊天入口',
    slug: 'chat-entrance',
    date: new Date('2026-06-01'),
    summary: '把 AI 聊天作为网站的第一入口。',
    tags: ['AI', '网站'],
    body: paragraph('入口是聊天，也是一种让内容被重新靠近的方式。'),
  },
  {
    title: '整理书影音',
    slug: 'music-archive',
    date: new Date('2026-05-30'),
    summary: '决定把音乐、书籍、影视放在同一个私人索引里。',
    tags: ['书影音'],
    body: paragraph('这些记录不是排名，而是某个时刻被击中的痕迹。'),
  },
];
```

- [ ] **Step 3: 增加 fixture 测试**

创建 `tests/sanity-mappers.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { fixtureEssays, fixtureReviews, fixtureTimelineEvents } from '../src/lib/content/fixtures';

describe('content fixtures', () => {
  it('provide stable sample data for local and e2e fallback', () => {
    expect(fixtureEssays.map((essay) => essay.slug)).toContain('night-walk');
    expect(fixtureReviews.some((review) => review.category === 'book')).toBe(true);
    expect(fixtureTimelineEvents[0].date).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 4: 验证并提交**

Run:

```powershell
npm run test -- tests/sanity-mappers.test.ts
git add src/lib/content/types.ts src/lib/content/fixtures.ts tests/sanity-mappers.test.ts
git commit -m "feat: add normalized content fixtures"
```

Expected:

- 新测试通过。

---

## Task 3: 增加 Sanity 查询、图片和映射层

**Files:**

- Create: `src/lib/sanity/client.ts`
- Create: `src/lib/sanity/queries.ts`
- Create: `src/lib/sanity/image.ts`
- Create: `src/lib/content/sanityMappers.ts`
- Modify: `tests/sanity-mappers.test.ts`

- [ ] **Step 1: 创建 Sanity client**

创建 `src/lib/sanity/client.ts`：

```ts
import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2026-06-03';

export const isSanityConfigured = Boolean(projectId && dataset);

export const sanityClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: 'published',
    })
  : null;
```

- [ ] **Step 2: 创建查询**

创建 `src/lib/sanity/queries.ts`：

```ts
const bodyField = 'body[]{..., children[]{...}}';

export const essaysQuery = `*[_type == "essay" && published == true] | order(date desc) {
  title, "slug": slug.current, date, summary, tags, mood, ${bodyField}
}`;

export const essayBySlugQuery = `*[_type == "essay" && published == true && slug.current == $slug][0] {
  title, "slug": slug.current, date, summary, tags, mood, ${bodyField}
}`;

export const reviewsQuery = `*[_type == "review" && published == true] | order(date desc) {
  title, "slug": slug.current, category, creator, year, date, rating, cover, summary, tags, moments, ${bodyField}
}`;

export const timelineQuery = `*[_type == "timeline" && published == true] | order(date desc) {
  title, "slug": slug.current, date, summary, tags, ${bodyField}
}`;
```

- [ ] **Step 3: 创建图片 helper**

创建 `src/lib/sanity/image.ts`：

```ts
import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function getSanityImageUrl(source: unknown, width = 264, height = 348): string | undefined {
  if (!builder || !source) {
    return undefined;
  }

  return builder.image(source).width(width).height(height).fit('crop').auto('format').url();
}
```

- [ ] **Step 4: 创建 mapper**

创建 `src/lib/content/sanityMappers.ts`：

```ts
import { getSanityImageUrl } from '../sanity/image';
import type { Essay, PortableBlock, Review, ReviewCategory, TimelineEvent } from './types';

interface SanityBaseDocument {
  title?: string;
  slug?: string;
  date?: string;
  summary?: string;
  tags?: string[];
  body?: PortableBlock[];
}

interface SanityEssayDocument extends SanityBaseDocument {
  mood?: string;
}

interface SanityReviewDocument extends SanityBaseDocument {
  category?: ReviewCategory;
  creator?: string;
  year?: number;
  rating?: number;
  cover?: unknown;
  moments?: string[];
}

function dateOrEpoch(value?: string): Date {
  return value ? new Date(value) : new Date(0);
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function portableBody(value: unknown): PortableBlock[] {
  return Array.isArray(value) ? (value as PortableBlock[]) : [];
}

export function mapSanityEssay(doc: SanityEssayDocument): Essay {
  return {
    title: text(doc.title),
    slug: text(doc.slug),
    date: dateOrEpoch(doc.date),
    summary: text(doc.summary),
    tags: stringArray(doc.tags),
    mood: doc.mood,
    body: portableBody(doc.body),
  };
}

export function mapSanityReview(doc: SanityReviewDocument): Review {
  const title = text(doc.title);

  return {
    title,
    slug: text(doc.slug),
    category: doc.category ?? 'music',
    creator: text(doc.creator),
    year: typeof doc.year === 'number' ? doc.year : 0,
    date: dateOrEpoch(doc.date),
    rating: typeof doc.rating === 'number' ? doc.rating : 0,
    cover: {
      src: getSanityImageUrl(doc.cover) ?? '/covers/reviews/after-hours.svg',
      alt: `${title} 封面`,
    },
    summary: text(doc.summary),
    tags: stringArray(doc.tags),
    moments: stringArray(doc.moments),
    body: portableBody(doc.body),
  };
}

export function mapSanityTimelineEvent(doc: SanityBaseDocument): TimelineEvent {
  return {
    title: text(doc.title),
    slug: text(doc.slug),
    date: dateOrEpoch(doc.date),
    summary: text(doc.summary),
    tags: stringArray(doc.tags),
    body: portableBody(doc.body),
  };
}
```

- [ ] **Step 5: 替换 mapper 测试**

替换 `tests/sanity-mappers.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { fixtureEssays, fixtureReviews, fixtureTimelineEvents } from '../src/lib/content/fixtures';
import { mapSanityEssay, mapSanityReview, mapSanityTimelineEvent } from '../src/lib/content/sanityMappers';

describe('content fixtures', () => {
  it('provide stable sample data for local and e2e fallback', () => {
    expect(fixtureEssays.map((essay) => essay.slug)).toContain('night-walk');
    expect(fixtureReviews.some((review) => review.category === 'book')).toBe(true);
    expect(fixtureTimelineEvents[0].date).toBeInstanceOf(Date);
  });
});

describe('Sanity mappers', () => {
  it('maps essay documents into normalized essays', () => {
    const essay = mapSanityEssay({
      title: '夜里散步',
      slug: 'night-walk',
      date: '2026-06-02',
      summary: '一段关于夜晚和走路的短记。',
      tags: ['日常'],
      mood: '安静',
      body: [{ _type: 'block' }],
    });

    expect(essay.date).toBeInstanceOf(Date);
    expect(essay.slug).toBe('night-walk');
    expect(essay.tags).toEqual(['日常']);
  });

  it('maps review documents with a cover fallback', () => {
    const review = mapSanityReview({
      title: 'After Hours',
      slug: 'album-after-hours',
      category: 'music',
      creator: 'The Weeknd',
      year: 2020,
      date: '2026-06-02',
      rating: 8.5,
      summary: '霓虹、疲惫和一点危险的浪漫。',
      tags: ['夜晚'],
      moments: ['夜里走路'],
      body: [],
    });

    expect(review.cover?.src).toBe('/covers/reviews/after-hours.svg');
    expect(review.rating).toBe(8.5);
  });

  it('maps timeline documents without private notes', () => {
    const event = mapSanityTimelineEvent({
      title: '开始搭个人网站',
      slug: 'website-begins',
      date: '2026-06-02',
      summary: '把个人网站从想法推进到设计。',
      tags: ['创作'],
      body: [],
    });

    expect(event.summary).toContain('个人网站');
    expect(Object.keys(event)).not.toContain('privateNotes');
  });
});
```

- [ ] **Step 6: 验证并提交**

Run:

```powershell
npm run test -- tests/sanity-mappers.test.ts
git add src/lib/sanity src/lib/content/sanityMappers.ts tests/sanity-mappers.test.ts
git commit -m "feat: add sanity content mappers"
```

Expected:

- mapper 测试通过。

---

## Task 4: 增加内容访问 API

**Files:**

- Create: `src/lib/content/index.ts`
- Modify: `tests/sanity-mappers.test.ts`

- [ ] **Step 1: 创建内容访问 API**

创建 `src/lib/content/index.ts`：

```ts
import { sanityClient } from '../sanity/client';
import { essayBySlugQuery, essaysQuery, reviewsQuery, timelineQuery } from '../sanity/queries';
import { fixtureEssays, fixtureReviews, fixtureTimelineEvents } from './fixtures';
import { mapSanityEssay, mapSanityReview, mapSanityTimelineEvent } from './sanityMappers';
import type { Essay, Review, TimelineEvent } from './types';

function shouldUseFixtures() {
  return !sanityClient || import.meta.env.PUBLIC_CONTENT_SOURCE === 'fixture';
}

export async function getEssays(): Promise<Essay[]> {
  if (shouldUseFixtures()) {
    return fixtureEssays;
  }

  const docs = await sanityClient!.fetch(essaysQuery);
  return docs.map(mapSanityEssay);
}

export async function getEssayBySlug(slug: string): Promise<Essay | undefined> {
  if (shouldUseFixtures()) {
    return fixtureEssays.find((essay) => essay.slug === slug);
  }

  const doc = await sanityClient!.fetch(essayBySlugQuery, { slug });
  return doc ? mapSanityEssay(doc) : undefined;
}

export async function getReviews(): Promise<Review[]> {
  if (shouldUseFixtures()) {
    return fixtureReviews;
  }

  const docs = await sanityClient!.fetch(reviewsQuery);
  return docs.map(mapSanityReview);
}

export async function getTimelineEvents(): Promise<TimelineEvent[]> {
  if (shouldUseFixtures()) {
    return fixtureTimelineEvents;
  }

  const docs = await sanityClient!.fetch(timelineQuery);
  return docs.map(mapSanityTimelineEvent);
}
```

- [ ] **Step 2: 增加内容访问测试**

在 `tests/sanity-mappers.test.ts` 顶部增加：

```ts
import { getEssayBySlug, getEssays, getReviews, getTimelineEvents } from '../src/lib/content';
```

在文件末尾追加：

```ts
describe('content access API', () => {
  it('uses fixture content when Sanity is not configured', async () => {
    await expect(getEssayBySlug('night-walk')).resolves.toMatchObject({ title: '夜里散步' });
    await expect(getEssays()).resolves.toHaveLength(3);
    await expect(getReviews()).resolves.toHaveLength(3);
    await expect(getTimelineEvents()).resolves.toHaveLength(3);
  });
});
```

- [ ] **Step 3: 验证并提交**

Run:

```powershell
npm run test -- tests/sanity-mappers.test.ts
git add src/lib/content/index.ts tests/sanity-mappers.test.ts
git commit -m "feat: add content access api"
```

Expected:

- 内容访问 API 走 fixture fallback 时测试通过。

---

## Task 5: 创建独立 Sanity Studio

**Files:**

- Create: `studio/`
- Create: `studio/schemaTypes/essay.ts`
- Create: `studio/schemaTypes/review.ts`
- Create: `studio/schemaTypes/timeline.ts`
- Modify: `studio/schemaTypes/index.ts`
- Modify: `studio/sanity.config.ts`
- Create: `studio/.env.example`

- [ ] **Step 1: 初始化 Studio**

Run:

```powershell
npm create sanity@latest -- --template clean --typescript --output-path studio
```

Expected:

- 根据 CLI 提示登录或创建 Sanity 账号。
- 使用 dataset `production`。
- 生成 `studio/package.json`、`studio/sanity.config.ts`、`studio/sanity.cli.ts`。

- [ ] **Step 2: 创建随笔 schema**

创建 `studio/schemaTypes/essay.ts`：

```ts
import { defineField, defineType } from 'sanity';

export const essay = defineType({
  name: 'essay',
  title: '随笔',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '标题', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'date', title: '日期', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'summary', title: '摘要', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(180) }),
    defineField({ name: 'tags', title: '标签', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'mood', title: '心情/状态', type: 'string' }),
    defineField({ name: 'body', title: '正文', type: 'array', of: [{ type: 'block' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'published', title: '发布', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
```

- [ ] **Step 3: 创建书影音 schema**

创建 `studio/schemaTypes/review.ts`：

```ts
import { defineField, defineType } from 'sanity';

export const review = defineType({
  name: 'review',
  title: '书影音',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '标题', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'category',
      title: '类型',
      type: 'string',
      options: {
        list: [
          { title: '音乐', value: 'music' },
          { title: '书籍', value: 'book' },
          { title: '影视', value: 'film' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'creator', title: '创作者', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'year', title: '年份', type: 'number', validation: (Rule) => Rule.required().integer().min(0) }),
    defineField({ name: 'date', title: '记录日期', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'rating', title: '评分', type: 'number', validation: (Rule) => Rule.required().min(0).max(10) }),
    defineField({ name: 'cover', title: '封面', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'summary', title: '短评', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(180) }),
    defineField({ name: 'tags', title: '标签', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'moments', title: '触发时刻/记忆点', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'body', title: '正文评价', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'published', title: '发布', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'title', subtitle: 'creator', media: 'cover' } },
});
```

- [ ] **Step 4: 创建时间线 schema**

创建 `studio/schemaTypes/timeline.ts`：

```ts
import { defineField, defineType } from 'sanity';

export const timeline = defineType({
  name: 'timeline',
  title: '时间线',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '标题', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title', maxLength: 96 }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'date', title: '日期', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'summary', title: '公开摘要', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(180) }),
    defineField({ name: 'tags', title: '标签', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'body', title: '正文/补充说明', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'published', title: '发布', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
```

- [ ] **Step 5: 导出 schema**

替换 `studio/schemaTypes/index.ts`：

```ts
import { essay } from './essay';
import { review } from './review';
import { timeline } from './timeline';

export const schemaTypes = [essay, review, timeline];
```

- [ ] **Step 6: 确认 Studio config**

确认 `studio/sanity.config.ts` 使用 `schemaTypes`：

```ts
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name: 'default',
  title: 'personal-website',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
```

- [ ] **Step 7: 新增 Studio env 示例**

创建 `studio/.env.example`：

```txt
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=production
```

- [ ] **Step 8: 验证并提交**

Run:

```powershell
cd studio
npm install
npm run build
cd ..
git add studio
git commit -m "feat: add sanity studio schemas"
```

Expected:

- Studio build 通过。

---

## Task 6: 增加 Portable Text 正文渲染

**Files:**

- Create: `src/components/PortableBody.astro`

- [ ] **Step 1: 创建正文渲染组件**

创建 `src/components/PortableBody.astro`：

```astro
---
import { toHTML } from '@portabletext/to-html';
import type { PortableBlock } from '../lib/content/types';

interface Props {
  value?: PortableBlock[];
}

const { value = [] } = Astro.props;
const html = value.length > 0 ? toHTML(value) : '';
---

{html ? <Fragment set:html={html} /> : <p>这段内容还在整理中。</p>}
```

- [ ] **Step 2: 验证并提交**

Run:

```powershell
npm run test
git add src/components/PortableBody.astro
git commit -m "feat: render portable text content"
```

Expected:

- 测试通过。

---

## Task 7: 改造随笔页面

**Files:**

- Modify: `src/pages/essays/index.astro`
- Modify: `src/pages/essays/[slug].astro`

- [ ] **Step 1: 改造随笔索引页 frontmatter**

替换 `src/pages/essays/index.astro` 的 frontmatter：

```astro
---
import ContentLayout from '../../layouts/ContentLayout.astro';
import { getEssays } from '../../lib/content';

export const prerender = false;

const essays = (await getEssays()).sort((a, b) => b.date.valueOf() - a.date.valueOf());
const years = [...new Set(essays.map((essay) => String(essay.date.getFullYear())))];
const tags = [...new Set(essays.flatMap((essay) => essay.tags))];
---
```

模板引用从 `essay.data.*` 改为：

```astro
href={`/essays/${essay.slug}`}
data-year={essay.date.getFullYear()}
data-tags={essay.tags.join(',')}
datetime={essay.date.toISOString()}
{essay.date.toLocaleDateString('zh-CN')}
{essay.title}
{essay.summary}
{essay.mood && <span>{essay.mood}</span>}
{essay.tags.map((tag) => <span>{tag}</span>)}
```

- [ ] **Step 2: 改造随笔详情页**

替换 `src/pages/essays/[slug].astro`：

```astro
---
import PortableBody from '../../components/PortableBody.astro';
import ContentLayout from '../../layouts/ContentLayout.astro';
import { getEssayBySlug } from '../../lib/content';

export const prerender = false;

const slug = Astro.params.slug ?? '';
const essay = await getEssayBySlug(slug);

if (!essay) {
  Astro.response.status = 404;
}
---

{essay ? (
  <ContentLayout title={essay.title} eyebrow={essay.date.toLocaleDateString('zh-CN')}>
    <article class="prose">
      <p class="lead">{essay.summary}</p>
      <PortableBody value={essay.body} />
    </article>
  </ContentLayout>
) : (
  <ContentLayout title="没有找到这篇随笔" eyebrow="404">
    <article class="prose">
      <p class="lead">它可能还没有发布，或者已经被重新整理到了别处。</p>
    </article>
  </ContentLayout>
)}
```

- [ ] **Step 3: 验证并提交**

Run:

```powershell
npm run test
npm run build
git add src/pages/essays/index.astro -- "src/pages/essays/[slug].astro"
git commit -m "feat: load essays from content api"
```

Expected:

- 测试和构建通过。

---

## Task 8: 改造书影音和时间线页面

**Files:**

- Modify: `src/pages/reviews.astro`
- Modify: `src/components/ReviewTabs.astro`
- Modify: `src/pages/timeline.astro`
- Modify: `src/components/TimelineAxis.astro`

- [ ] **Step 1: 改造书影音页面**

替换 `src/pages/reviews.astro`：

```astro
---
import ReviewTabs from '../components/ReviewTabs.astro';
import ContentLayout from '../layouts/ContentLayout.astro';
import { getReviews } from '../lib/content';

export const prerender = false;

const reviews = (await getReviews()).sort((a, b) => b.date.valueOf() - a.date.valueOf());
---

<ContentLayout title="书影音" eyebrow="Reviews" description="不是为了客观排名，而是保存某个时刻被作品击中的方式。">
  <ReviewTabs reviews={reviews} />
</ContentLayout>
```

- [ ] **Step 2: 改造 ReviewTabs 类型和字段**

替换 `src/components/ReviewTabs.astro` 的 frontmatter：

```astro
---
import type { Review } from '../lib/content/types';

interface Props {
  reviews: Review[];
}

const { reviews } = Astro.props;
const categories = [
  { key: 'music', label: '音乐' },
  { key: 'book', label: '书籍' },
  { key: 'film', label: '影视' },
] as const;
---
```

卡片字段改为：

```astro
{reviews.filter((review) => review.category === category.key).map((review) => (
  <article class="review-card">
    <img class="review-card__cover" src={review.cover?.src ?? '/covers/reviews/after-hours.svg'} alt={review.cover?.alt ?? `${review.title} 封面`} loading="lazy" />
    <div class="review-card__body">
      <p class="review-card__meta">{review.creator} · {review.year}</p>
      <h2>{review.title}</h2>
      <p>{review.summary}</p>
      <strong>{review.rating.toFixed(1)}</strong>
      <div class="tag-row">
        {review.tags.map((tag) => <span>{tag}</span>)}
        {review.moments.map((moment) => <span>{moment}</span>)}
      </div>
    </div>
  </article>
))}
```

- [ ] **Step 3: 改造时间线页面**

替换 `src/pages/timeline.astro`：

```astro
---
import TimelineAxis from '../components/TimelineAxis.astro';
import ContentLayout from '../layouts/ContentLayout.astro';
import { getTimelineEvents } from '../lib/content';

export const prerender = false;

const events = (await getTimelineEvents()).sort((a, b) => b.date.valueOf() - a.date.valueOf());
---

<ContentLayout title="时间线" eyebrow="Timeline" description="一些公开的坐标点。更私人的意义不在这里展开。">
  <TimelineAxis events={events} />
</ContentLayout>
```

- [ ] **Step 4: 改造 TimelineAxis**

替换 `src/components/TimelineAxis.astro`：

```astro
---
import type { TimelineEvent } from '../lib/content/types';

interface Props {
  events: TimelineEvent[];
}

const { events } = Astro.props;
---

<ol class="timeline-axis" aria-label="时间线">
  {events.map((event) => (
    <li>
      <time datetime={event.date.toISOString()}>{event.date.toLocaleDateString('zh-CN')}</time>
      <div>
        <h2>{event.title}</h2>
        <p>{event.summary}</p>
        <div class="tag-row">
          {event.tags.map((tag) => <span>{tag}</span>)}
        </div>
      </div>
    </li>
  ))}
</ol>
```

- [ ] **Step 5: 验证并提交**

Run:

```powershell
npm run test
npm run build
git add src/pages/reviews.astro src/components/ReviewTabs.astro src/pages/timeline.astro src/components/TimelineAxis.astro
git commit -m "feat: load reviews and timeline from content api"
```

Expected:

- 测试和构建通过。

---

## Task 9: 更新 e2e 与 README

**Files:**

- Modify: `e2e/smoke.spec.ts`
- Modify: `playwright.config.ts`
- Modify: `README.md`

- [ ] **Step 1: 确认 e2e 启动命令**

检查 `playwright.config.ts`。

如果它已经使用 `npm run dev`，保持不变。若它使用静态 preview，改为：

```ts
webServer: {
  command: 'npm run dev -- --host 127.0.0.1',
  url: 'http://127.0.0.1:4321',
  reuseExistingServer: !process.env.CI,
}
```

- [ ] **Step 2: 保留关键 e2e 行为**

`e2e/smoke.spec.ts` 继续检查 fixture 内容：

```ts
await expect(page.getByText('把声音留住')).toBeVisible();
await expect(page.getByText('私人语言')).toBeVisible();
await expect(page.getByText('晚春')).toBeVisible();
await expect(page.getByText('这件事对我意味着重新整理自己的表达方式')).toHaveCount(0);
```

- [ ] **Step 3: 更新 README**

创建或更新 `README.md`：

````md
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

- `essay`: 随笔
- `review`: 书影音
- `timeline`: 时间线

前台只展示 `published = true` 的内容。草稿不会出现在前台。

## 动态渲染

内容页通过 Astro 服务端/按请求渲染从 Sanity 读取内容。Sanity 发布新内容后，访客刷新页面即可看到更新，不需要每次重新部署前台。

## 内容安全

不要把真实人格说明书、ChatGPT 历史、近期状态摘要、私人笔记、私密 RAG 材料提交到公开 GitHub 仓库。

v0.2.0 只处理公开内容和普通草稿。

## 验证

```bash
npm run test
npm run build
npm run test:e2e
```
````

- [ ] **Step 4: 验证并提交**

Run:

```powershell
npm run test
npm run build
npm run test:e2e
git add README.md playwright.config.ts e2e/smoke.spec.ts
git commit -m "docs: document sanity content workflow"
```

Expected:

- 测试、构建、e2e 全部通过。
- 如果 `playwright.config.ts` 和 `e2e/smoke.spec.ts` 没有变化，不要把它们加入提交。

---

## Task 10: 升级版本并做最终验证

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: 升级版本号**

Run:

```powershell
npm version 0.2.0 --no-git-tag-version
```

- [ ] **Step 2: 最终验证**

Run:

```powershell
npm run test
npm run build
npm run test:e2e
```

Expected:

- Vitest 通过。
- Astro build 通过。
- Playwright 通过。

- [ ] **Step 3: 提交**

Run:

```powershell
git add package.json package-lock.json
git commit -m "chore: bump version to 0.2.0"
```

- [ ] **Step 4: 合并后打 tag**

实现分支合并回 `main` 后再运行：

```powershell
git tag -a v0.2.0 -m "v0.2.0: Sanity content backend"
git push origin main
git push origin v0.2.0
```

---

## 自检

规格覆盖：

- 独立 Sanity Studio：Task 5。
- 不做 `/admin`：README 明确说明主站不提供 `/admin`，没有任务创建该路由。
- 动态内容渲染：Task 1、Task 7、Task 8。
- 只展示已发布内容：Task 3 的查询和 Task 5 的 `published` 字段。
- 本地/测试 fixture：Task 2、Task 4。
- 三类内容模型：Task 5。
- README 和内容安全规则：Task 9。
- 验证：Task 1、Task 3、Task 4、Task 7、Task 8、Task 9、Task 10。

占位扫描：

- 计划中没有未完成标记词。
- 外部 Sanity 项目创建由 Task 5 的 CLI 步骤处理。
- 部署适配器第一版选择 Vercel adapter；如果之后改用其他部署平台，需要单独调整 adapter。

类型一致性：

- 页面消费 `Essay`、`Review`、`TimelineEvent`。
- 组件消费统一类型，不再消费 Astro Content Collection entry。
- Sanity mapper 返回的类型与页面和组件使用的类型一致。
