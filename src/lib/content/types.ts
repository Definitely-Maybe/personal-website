export type ReviewCategory = 'music' | 'book' | 'film';

export type PortableBlock = {
  _type: string;
  _key?: string;
  [key: string]: unknown;
};

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
  /** 0 to 5, supports one decimal place. */
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
