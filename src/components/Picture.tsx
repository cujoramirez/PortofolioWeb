/** AVIF/WebP responsive image from the build-images manifest (src/data/images.json). */
import images from '../data/images.json';

export interface Ladder {
  widths: number[];
  avif: string[];
  webp: string[];
  width: number;
  height: number;
}

type Group = 'projects' | 'certificates';

export function ladder(group: Group, key: string): Ladder | undefined {
  return (images[group] as Record<string, Ladder>)[key];
}

export const portraitLadder: Ladder = images.hero;
export const aboutLadder: Ladder = images.about;

const set = (files: string[], widths: number[]) => files.map((f, i) => `${f} ${widths[i]}w`).join(', ');

interface PictureProps {
  img: Ladder;
  sizes: string;
  alt: string;
  className?: string;
  eager?: boolean;
}

export default function Picture({ img, sizes, alt, className, eager }: PictureProps) {
  return (
    <picture>
      <source type="image/avif" srcSet={set(img.avif, img.widths)} sizes={sizes} />
      <source type="image/webp" srcSet={set(img.webp, img.widths)} sizes={sizes} />
      <img
        className={className}
        src={img.webp[0]}
        width={img.width}
        height={img.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}
