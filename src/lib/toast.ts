/** A one-line status toast (glass pill, bottom centre), announced politely to screen readers. */
let host: HTMLElement | null = null;
let timer = 0;

export function toast(text: string, ms = 3200): void {
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast glass mono';
    host.setAttribute('role', 'status');
    document.body.appendChild(host);
  }
  const el = host;
  // one frame later: the live region exists before its text changes, and the rise transition runs
  requestAnimationFrame(() => {
    el.textContent = text;
    el.dataset.on = '1';
  });
  window.clearTimeout(timer);
  timer = window.setTimeout(() => (el.dataset.on = '0'), ms);
}
