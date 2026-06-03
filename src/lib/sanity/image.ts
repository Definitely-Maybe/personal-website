import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './client';

const builder = sanityClient ? imageUrlBuilder(sanityClient) : null;

export function getSanityImageUrl(source: unknown, width = 264, height = 348): string | undefined {
  if (!builder || !source) {
    return undefined;
  }

  return builder.image(source).width(width).height(height).fit('crop').auto('format').url();
}
