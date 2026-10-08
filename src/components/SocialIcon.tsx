/**
 * The four link icons the menu needs, copied from src/data/tech-icons.json (built by
 * scripts/build-tech-icons.mjs) so the menu, which ships in the first bundle, does not pull in
 * every Toolbox logo. Same drawing rules as TechIcon.
 */
const ICONS: Record<string, { kind: 'brand' | 'glyph'; path: string }> = {
  "LinkedIn": { kind: "glyph", path: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z M8 10.5V17 M8 7.2v.01 M12 17v-6.5 M12 13.5c0-1.8 1.3-3 3-3s3 1.2 3 3V17" },
  "GitHub": { kind: "brand", path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
  "Google Scholar": { kind: "brand", path: "M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" },
  "Email": { kind: "glyph", path: "M3 6.5h18v11H3Z M3.5 7l8.5 6.5L20.5 7" },
};

export default function SocialIcon({ name, size = 20 }: { name: string; size?: number }) {
  const icon = ICONS[name];
  if (!icon) return null;
  const glyph = icon.kind === 'glyph';
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill={glyph ? 'none' : 'currentColor'}
      stroke={glyph ? 'currentColor' : 'none'}
      strokeWidth={glyph ? 1.6 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={icon.path} />
    </svg>
  );
}
