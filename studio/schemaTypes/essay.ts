import { defineField, defineType } from 'sanity';

export const essay = defineType({
  name: 'essay',
  title: '随笔',
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
    defineField({ name: 'summary', title: '摘要', type: 'text', rows: 3, validation: (Rule) => Rule.required().max(180) }),
    defineField({ name: 'tags', title: '标签', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'mood', title: '心情/状态', type: 'string' }),
    defineField({ name: 'body', title: '正文', type: 'array', of: [{ type: 'block' }], validation: (Rule) => Rule.required() }),
    defineField({ name: 'published', title: '发布', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'title', subtitle: 'date' } },
});
