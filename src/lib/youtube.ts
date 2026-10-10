/**
 * YouTube addresses the portal can play in place. Its player is made to sit in other pages,
 * unlike the site itself, so a demo need not send anyone to YouTube. A channel is not one of
 * them: its uploads are every video on it, and the newest led a lecture series' demo with a
 * conference talk. A playlist of the right videos would play.
 */
const EMBED = 'https://www.youtube-nocookie.com/embed/';

/** The player's address for a video or a playlist, or null when there is nothing to play. */
export function player(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  const video = host === 'youtu.be' ? url.pathname.slice(1) : host === 'youtube.com' && url.pathname === '/watch' ? url.searchParams.get('v') : null;
  if (video) return `${EMBED}${encodeURIComponent(video)}?rel=0&playsinline=1`;
  const list = host === 'youtube.com' && url.pathname === '/playlist' ? url.searchParams.get('list') : null;
  return list ? `${EMBED}videoseries?list=${encodeURIComponent(list)}&rel=0&playsinline=1` : null;
}
