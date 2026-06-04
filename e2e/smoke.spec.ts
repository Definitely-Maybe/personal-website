import { expect, test } from '@playwright/test';

test('homepage sends a simulated chat reply and moves composer into active state', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '我们从哪里开始呢？' })).toBeVisible();
  await page.getByLabel('输入问题').fill('你最近在想什么？');
  await page.getByRole('button', { name: '发送' }).click();
  await expect(page.locator('.chat-home--active')).toBeVisible();
  await expect(page.getByText('最近我在想怎么把一些松散的内容收拢起来')).toBeVisible();
});

test('essays can be filtered by tag and keep pagination state valid', async ({ page }) => {
  await page.goto('/essays');
  await expect(page.getByRole('heading', { name: '随笔' })).toBeVisible();
  await page.getByRole('button', { name: '音乐' }).click();
  await expect(page.getByText('把声音留住')).toBeVisible();
  await expect(page.getByText('夜里散步')).toBeHidden();
  await expect(page.getByText('没有符合这个筛选的随笔。')).toBeHidden();
});

test('reviews tabs expose only the selected category with rating and detail links', async ({ page }) => {
  await page.goto('/reviews');
  await expect(page.getByRole('heading', { name: '书影音' })).toBeVisible();
  await expect(page.getByRole('tab', { name: '音乐' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: /After Hours/ })).toBeVisible();
  await expect(page.getByText('4.3/5')).toBeVisible();
  await expect(page.getByText('记录于 2026.06.02')).toBeVisible();

  await page.getByRole('tab', { name: '书籍' }).click();
  await expect(page.getByRole('link', { name: /私人语言/ })).toBeVisible();
  await expect(page.getByText('After Hours')).toBeHidden();

  await page.getByRole('tab', { name: '影视' }).click();
  await expect(page.getByRole('link', { name: /晚春/ })).toBeVisible();
  await expect(page.getByText('私人语言')).toBeHidden();
});

test('review detail pages show rating, record date, and long review state', async ({ page }) => {
  await page.goto('/reviews/album-after-hours');
  await expect(page.getByRole('heading', { name: 'After Hours' })).toBeVisible();
  await expect(page.getByText('4.3/5')).toBeVisible();
  await expect(page.getByText('记录于 2026.06.02')).toBeVisible();
  await expect(page.getByText('这张专辑像一条被灯光拖长的夜路。')).toBeVisible();

  await page.goto('/reviews/book-private-language');
  await expect(page.getByRole('heading', { name: '私人语言' })).toBeVisible();
  await expect(page.getByText('这条记录目前只有短评。')).toBeVisible();
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
  await expect(page.getByRole('link', { name: '随笔', exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('问我一首歌、一篇随笔，或者一个适合今天的问题')).toBeVisible();
});

test('desktop sidebar stays visible while content scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/reviews');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByRole('link', { name: '未命名的小站' })).toBeInViewport();
  await expect(page.getByRole('link', { name: '书影音', exact: true })).toBeInViewport();
});
