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

export const reviewBySlugQuery = `*[_type == "review" && published == true && slug.current == $slug][0] {
  title, "slug": slug.current, category, creator, year, date, rating, cover, summary, tags, moments, ${bodyField}
}`;

export const timelineQuery = `*[_type == "timeline" && published == true] | order(date desc) {
  title, "slug": slug.current, date, summary, tags, ${bodyField}
}`;
