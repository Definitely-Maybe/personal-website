import { defineField, defineType } from 'sanity';

export const timeline = defineType({
  name: 'timeline',
  title: '时间线',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: '标题', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: 'date', title: '日期', type: 'date', validation: (Rule) => Rule.required() }),
    defineField({ name: 'summary', title: '公开摘要', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(180) }),
    defineField({ name: 'tags', title: '标签', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'body', title: '正文/补充说明', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'published', title: '发布', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
