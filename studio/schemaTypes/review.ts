import { defineField, defineType } from 'sanity';

export const review = defineType({
  name: 'review',
  title: '书影音',
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
