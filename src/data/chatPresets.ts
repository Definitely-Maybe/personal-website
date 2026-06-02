export const suggestedPrompts = ['你最近在想什么？', '最近听了什么？', '随机聊一篇随笔', '介绍一下这个网站'];

const replies = [
  {
    keywords: ['你是谁', '介绍', '网站'],
    reply:
      '我是这个网站的对话入口，一个先被模拟出来的 AI 分身。现在我还没有接入真正的 AI，但我会慢慢从随笔、书影音和时间线里长出更具体的回答。',
  },
  {
    keywords: ['音乐', '听', '歌'],
    reply:
      '如果你想从声音开始，可以先去 /reviews 的音乐标签看看。那里会放一些评分、短评，以及适合在什么时刻听的记录。',
  },
  {
    keywords: ['随笔', '文章'],
    reply:
      '随笔更像这个网站的呼吸。你可以从 /essays 进去，那里会放生活、城市、关系和一些还没有定型的念头。',
  },
  {
    keywords: ['时间线', '最近', '想什么'],
    reply:
      '最近我在想怎么把一些松散的内容收拢起来：随笔、书影音、时间线，还有这个像对话入口一样的首页。更私人的部分不会被原文展开。',
  },
];

export function getSimulatedReply(input: string): string {
  const normalized = input.trim().toLowerCase();
  const match = replies.find((item) => item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase())));

  return (
    match?.reply ??
    '我还没有接入真正的 AI，所以现在只能给出一段模拟回答。等公开 RAG 接上以后，我会从已经发布的文字和书影音记录里找线索。'
  );
}
