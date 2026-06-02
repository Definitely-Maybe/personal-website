# Personal Website Design

## Summary

Build a Chinese personal website and blog with a ChatGPT-like AI chat homepage. The first version prioritizes the content spaces: essays, reviews, timeline, guestbook, and about page. The AI chat is simulated in v1, but the content model and component boundaries should prepare for future RAG.

The site should feel private, clear, fresh, and warm. It is not a resume site. It is closer to a personal archive and conversational entrance into the author's writing, taste, and recent thoughts.

## Technical Direction

- Framework: Astro.
- Content: Markdown/MDX with Astro Content Collections.
- Language: Chinese.
- First version: static-first, no real AI API, no database, no auth.
- Future direction: public RAG first, then authenticated RAG with private context.

Astro is preferred because the site is content-heavy and should remain lightweight while still allowing future server/API integrations.

## Page Structure

The site uses an application-like layout inspired by ChatGPT rather than a traditional blog homepage.

The right-side main area should feel like a full workspace. The chat homepage uses a centered stage, but content index pages should occupy the available right-side width. Long-form article bodies may keep a narrower reading width inside that workspace.

### `/`

The homepage is the AI chat experience.

- Centered opening line, for example: "我们从哪里开始呢？"
- Chat input below the opening line.
- Suggested prompts below or near the input.
- Simulated message flow.
- Loading state for simulated replies.
- Sidebar navigation.

The AI is presented as a conversational persona derived from the author's public writing and hidden persona configuration, not as the author being personally online.

### Sidebar

The sidebar has two regions.

Top region: site modules.

- 和我聊天
- 随笔
- 书影音
- 时间线
- 访客簿
- 关于

Bottom region: chat list.

Example simulated conversations:

- 今天适合听什么？
- 随机聊一篇随笔
- 你最近在想什么？
- 介绍一下这个网站

On mobile, the sidebar is collapsed behind a menu button.

### `/essays`

Essay list page with summaries, dates, tags, and optional mood labels.

### `/essays/[slug]`

Essay detail page rendered from MDX.

### `/reviews`

Reviews page for books, music, and film/TV. The page uses three tabs:

- 音乐
- 书籍
- 影视

The navigation label is "书影音". The route is `/reviews`.

Review entries should include covers. Music can use square covers; books and film/TV can use poster-like vertical covers. V1 may use locally stored cover artwork or stylized placeholder covers until the author supplies final assets.

### `/timeline`

Timeline page with a restrained coordinate-axis feeling.

- A clear but light axis.
- Nodes as coordinate points or ticks.
- Dates as coordinate labels.
- Events grouped by year where useful.
- Light hover highlighting is allowed.
- No flashy animation.
- Mobile layout becomes a vertical axis.

Public visitors see only public event fields. Private meaning or commentary is not shown.

### `/guestbook`

Semi-real guestbook.

- Shows a form with name and message fields.
- Submit button is disabled or labeled as not yet open.
- Shows a quiet empty state.
- No real submission in v1.

### `/about`

About page for the author and the website. It should be personal and brief rather than resume-like.

### No Public Persona Page

There is no `/persona` route and no public "人格说明书" module. The persona configuration is hidden and only influences AI behavior.

## Content Model

All content should be structured so it can later be indexed for RAG.

### Essays Collection

Each essay is an MDX file.

Frontmatter:

- `title`: essay title.
- `date`: publish date.
- `summary`: short summary.
- `tags`: string array.
- `mood`: optional atmosphere or emotional label.
- `visibility`: defaults to `public`.

Body:

- Essay content.

Used by:

- Essay list.
- Essay detail.
- Future public RAG.

### Reviews Collection

Each review is an MDX file.

Frontmatter:

- `title`: work title.
- `category`: `music`, `book`, or `film`.
- `creator`: artist, author, director, or main creator.
- `date`: record date.
- `year`: work release year.
- `rating`: numeric or display rating.
- `summary`: one-line impression.
- `cover.src`: local cover image path.
- `cover.alt`: accessible cover description.
- `tags`: string array.
- `moments`: optional contexts, moods, or moments.
- `visibility`: defaults to `public`.

Body:

- Long-form review.

Used by:

- `/reviews` tabs.
- Future public RAG for music/book/film recommendations.

### Timeline Collection

Each timeline event can be an MDX entry or structured content collection entry.

Public frontmatter:

- `title`: event title.
- `date`: event date.
- `summary`: public summary.
- `tags`: string array.
- `visibility`: defaults to `public`.

Private notes:

- Meaning, interpretation, or private commentary about the event.
- Visible only to the owner.
- Editable only by the owner.
- Not shown in v1.
- Future authenticated RAG may use it only for summary or paraphrase, not direct quotation.

### Guestbook

V1 has no persistent guestbook data. The UI includes:

- Name field.
- Message field.
- Disabled or inactive submit button.
- Empty state copy.

Future versions may add storage, moderation, anti-spam, and real submission.

### Hidden Persona Configuration

The persona configuration is not public content.

It may include:

- Tone preferences.
- Boundaries.
- Things the AI should avoid.
- How to respond when it does not know.
- Taste and recommendation preferences.
- Rules for private material.

It influences AI responses but should not be directly displayed or quoted.

## AI And RAG Architecture

V1 implements a simulated AI chat, not a real API integration.

### V1 Simulated Chat

The chat should support:

- User sending a message.
- Simulated assistant loading state.
- Predefined responses based on simple keyword matching.
- Suggested prompt buttons.
- Sidebar chat list.

Example matching:

- "你是谁" -> explain the site and AI concept.
- "音乐" -> point to the reviews/music tab.
- "随笔" -> suggest sample essays.
- "时间线" -> explain the public timeline.
- Unknown input -> warm simulated response that admits the real AI is not connected yet.

### Conversation Voice

Visitors chat with the AI as "you". The AI replies as "I".

Example visitor question:

- "你最近在想什么？"

The AI should answer in first person while making clear it is a conversational persona, not the human author personally online.

The AI should not:

- Pretend to be real-time human presence.
- Make commitments on behalf of the author.
- Reveal hidden configuration.
- Quote private material directly.
- Invent facts absent from the content base.

### Future Public RAG

Available to all visitors.

Sources:

- Essays.
- Reviews.
- Public timeline fields.
- About page.

The assistant may cite or name public content sources.

### Hidden Persona Layer

Available as hidden prompt/configuration context.

- Affects tone and behavior.
- Not displayed to visitors.
- Not directly quoted.

### Future Authenticated RAG

Authenticated users may ask questions that use deeper private context, but the private material remains hidden.

Sources may include:

- Timeline private notes.
- Private notes.
- Recent state summaries.
- Summaries of imported ChatGPT history.
- Other owner-only materials.

Rules:

- Private material is visible only to the owner.
- Private material is editable only by the owner.
- Authenticated users cannot browse raw private material.
- Authenticated RAG may summarize or paraphrase private material.
- Authenticated RAG must not directly quote private material.
- Sensitive material should be answered at lower granularity.
- Some material may be marked owner-only and excluded from authenticated-user RAG.

The intended feeling is that people who care can sense what the author has recently been thinking, without exposing raw private records.

### Permissions Vocabulary

Future content may use permissions like:

- `public`: visible and quotable.
- `private_visible_owner`: visible only to owner.
- `rag_authenticated`: may be used for authenticated-user RAG.
- `never_quote`: may influence summary/paraphrase but cannot be quoted.
- `owner_only_rag`: only usable by the owner in private mode.

## Visual Style

The style should be minimal, fresh, warm, and not cold.

Principles:

- Generous whitespace.
- Light borders.
- Minimal shadows.
- Clear typography.
- Natural colors.
- No heavy tech aesthetic.
- No excessive card-heavy layout.
- No flashy animation.

Suggested palette:

- Background: warm off-white or soft gray-white.
- Sidebar: very light sage green or misty green-gray.
- Main text: near-black but softened.
- Accent: pale green-blue or soft cyan-green.
- Rating accent: muted gold or green-blue.

## Interaction Details

- The homepage should feel like a quiet ChatGPT-like interface.
- The opening line is visually central.
- The input box is rounded but not overly cute.
- Suggested prompts are lightweight controls.
- Chat messages should feel calm and readable.
- Content pages prioritize reading.
- Reviews have a light archive/catalog feeling.
- Reviews should occupy the available right-side workspace and use cover-led entries rather than tiny text-only cards.
- Timeline has a coordinate-axis feeling.
- Guestbook feels quiet and expectant.

## First Version Scope

V1 includes:

- Astro project.
- Chinese UI.
- ChatGPT-like homepage.
- Opening line.
- Chat input.
- Simulated chat messages.
- Sidebar with modules and chat list.
- Essays list and detail pages.
- Reviews page with music/book/film tabs.
- Coordinate-axis-style timeline.
- Semi-real guestbook with inactive form.
- About page.
- Hidden persona configuration file.
- Sample content.
- Responsive layout.

V1 does not include:

- Real OpenAI API integration.
- Real RAG retrieval.
- Login.
- Private mode.
- ChatGPT history import.
- Real guestbook submission.
- Database.
- Admin dashboard.
- Comment moderation.
- Site search.

V1 should still preserve clean boundaries for those future features.

## Verification

Before considering v1 implementation complete:

- Local dev server starts successfully.
- All routes render.
- Sidebar navigation works.
- Reviews tabs work.
- Sample essays render.
- Timeline renders without layout overlap.
- Guestbook inactive state is clear.
- Simulated chat can send a message and receive a response.
- Mobile layout does not break or overlap.
