/**
 * Vercel Web Analytics, added the way Vercel documents for a plain page: a queue for calls made
 * before the script arrives, then the script the deployment serves. Its npm package did the same
 * from a React wrapper that was 3.5 KB of the first bundle. Only a Vercel deployment has the
 * script (a local preview of the build asks for it and gets a 404), and the script itself sends
 * nothing from an automated browser, so a headless test never shows a visit.
 */
type Queued = Window & { va?: (...args: unknown[]) => void; vaq?: unknown[][] };

let started = false;

export function startAnalytics(): void {
  if (started || import.meta.env.DEV) return;
  started = true;
  const w = window as Queued;
  w.va ??= (...args) => (w.vaq ??= []).push(args);
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  document.head.appendChild(script);
}
