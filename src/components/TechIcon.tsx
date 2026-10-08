/** A technology's logo (Simple Icons mark, or a drawn glyph for tools without one). Decorative. */
import icons from '../data/tech-icons.json';

type Icon = { kind: 'brand' | 'glyph'; path: string };
const ICONS = icons as Record<string, Icon>;

export default function TechIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const icon = ICONS[name];
  if (!icon) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill={icon.kind === 'brand' ? 'currentColor' : 'none'}
      stroke={icon.kind === 'glyph' ? 'currentColor' : 'none'}
      strokeWidth={icon.kind === 'glyph' ? 1.6 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icon.path} />
    </svg>
  );
}
