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
