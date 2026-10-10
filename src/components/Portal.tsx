/**
 * The portal: a window that grows out of a link over the page, for the links that have the
 * destination itself to show or more of it than their surroundings say (lib/outbound.ts decides
 * which). It holds the résumé's PDF, a paper's details, a certificate at full size or a video,
 * with the way on to the site itself stated in the window rather than taken for the visitor.
 * A window that only repeated what the page already said was a second click on the way out
 * (the owner: "why would u click twice to go to a channel?"), so profiles and plain project
 * links do not open one.
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import Dialog from './Dialog';
import Picture, { ladder, type Ladder } from './Picture';
import { ArrowUpRight, CheckIcon, CloseIcon, CopyIcon } from './icons';
import { certificates, papers, projects, splitTitle, type Certificate, type Paper, type Project } from '../content/data';
import { HERO, LINKS } from '../content/site';
import { decrypt, magnet, spark } from '../lib/micro';
import { motionAllowed } from '../lib/motion';
import { showsPdf, type Outbound } from '../lib/outbound';
import images from '../data/images.json';
import { qrPath } from '../lib/qr';
import { player } from '../lib/youtube';
import './portal.css';

/** Interface text new with the portal (2026-10-10). */
const COPY = {
  kind: { resume: 'Résumé', paper: 'Paper', certificate: 'Certificate', video: 'Video', site: 'Link' },
  open: 'Open in a new tab',
  copy: 'Copy link',
  copied: 'Copied',
  cite: 'Copy citation',
  download: 'Download',
  scan: 'Scan to open on a phone',
  zoomIn: 'Zoom in',
  zoomOut: 'Zoom out',
  framed: (host: string) => `Other sites cannot display ${host} inside their pages. This is what this page holds about it.`,
} as const;

type Found =
  | { kind: 'resume' }
  | { kind: 'paper'; paper: Paper }
  | { kind: 'certificate'; cert: Certificate }
  | { kind: 'video'; src: string; project?: Project }
  | { kind: 'site' };

const same = (a: string, b: string) => a.replace(/\/$/, '') === b.replace(/\/$/, '');

/** What there is to show for an address. */
function resolve(href: string): Found {
  const url = new URL(href);
  if (url.origin === location.origin && url.pathname === LINKS.resume) return { kind: 'resume' };
  const paper = papers.find((p) => p.doi && href.includes(p.doi));
  if (paper) return { kind: 'paper', paper };
  const cert = certificates.find((c) => same(c.link, href));
  if (cert) return { kind: 'certificate', cert };
  const src = player(href);
  if (src) return { kind: 'video', src, project: projects.find((p) => [p.demo, ...p.links].some((l) => l && same(l, href))) };
  return { kind: 'site' };
}

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * A picture that a tap enlarges around the point that was tapped, and a second tap fits again.
 * Enlarged, it scrolls under the finger as any page does. On a phone a certificate or a page of
 * the résumé is too small to read at the width of the screen.
 */
function Zoomable({ by, className, children }: { by: number; className?: string; children: (zoomed: boolean) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const at = useRef<{ fx: number; fy: number; x: number; y: number } | null>(null);
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    const frame = box.current?.getBoundingClientRect();
    if (!frame) return;
    const inner = event.currentTarget.getBoundingClientRect();
    // a key press has no position: the middle of what is in view
    const [x, y] = event.detail ? [event.clientX, event.clientY] : [frame.left + frame.width / 2, frame.top + frame.height / 2];
    at.current = { fx: (x - inner.left) / inner.width, fy: (y - inner.top) / inner.height, x: x - frame.left, y: y - frame.top };
    setZoomed((z) => !z);
  };
  useLayoutEffect(() => {
    const el = box.current;
    const inner = el?.firstElementChild as HTMLElement | null;
    const p = at.current;
    if (!el || !inner || !p) return;
    // the tapped point stays under the finger
    el.scrollLeft = p.fx * inner.offsetWidth - p.x;
    el.scrollTop = p.fy * inner.offsetHeight - p.y;
    if (!motionAllowed()) return;
    // The layout has already changed size. Only a transform plays: from the size it had.
    inner.style.transformOrigin = `${(p.fx * 100).toFixed(2)}% ${(p.fy * 100).toFixed(2)}%`;
    inner.animate([{ transform: `scale(${zoomed ? 1 / by : by})` }, { transform: 'none' }], { duration: 300, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)' });
  }, [zoomed, by]);
  return (
    <div ref={box} className={`portal__zoom${className ? ` ${className}` : ''}`}>
      <button type="button" className="portal__zoom-inner" aria-pressed={zoomed} aria-label={zoomed ? COPY.zoomOut : COPY.zoomIn} style={{ width: zoomed ? `${by * 100}%` : undefined }} onClick={toggle}>
        {children(zoomed)}
      </button>
    </div>
  );
}

const resumePages: Ladder[] = images.resume;

/** The résumé as pictures of its pages, where the PDF itself cannot be shown (lib/outbound.ts). */
function Pages() {
  return (
    <Zoomable by={2.6} className="portal__pages">
      {(zoomed) =>
        resumePages.map((page, i) => (
          <Picture
            key={page.avif[0]}
            img={page}
            sizes={zoomed ? '(min-width: 768px) 2000px, 260vw' : '(min-width: 768px) 820px, 100vw'}
            alt={`${COPY.kind.resume} ${i + 1} / ${resumePages.length}`}
            className="portal__page"
            eager={i === 0}
          />
        ))
      }
    </Zoomable>
  );
}

function Dossier({ found, label, host }: { found: Found; label: string; host: string }) {
  let title = label || host;
  let body: ReactNode = null;
  if (found.kind === 'video') {
    const [name, sub] = found.project ? splitTitle(found.project.title) : [label || host, null];
    return (
      <div className="portal__dossier">
        <div className="portal__video portal__rise" style={step(1)}>
          <iframe
            src={found.src}
            title={name}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <h3 className="portal__title portal__title--under portal__rise" style={step(2)}>
          {name}
        </h3>
        {sub ? (
          <p className="portal__text portal__rise" style={step(3)}>
            {sub}
          </p>
        ) : null}
      </div>
    );
  }
  if (found.kind === 'paper') {
    const p = found.paper;
    title = p.title;
    body = (
      <>
        <p className="portal__meta mono portal__rise" style={step(2)}>
          {p.venue} · {p.year}
        </p>
        <p className="portal__text portal__rise" style={step(3)}>
          {p.authors}
        </p>
        <p className="portal__text portal__rise" style={step(4)}>
          {p.description}
        </p>
        <ul className="chips portal__rise" style={step(5)} aria-label="Keywords">
          {p.keywords.map((k) => (
            <li key={k} className="chip">
              {k}
            </li>
          ))}
        </ul>
      </>
    );
  } else if (found.kind === 'certificate') {
    const img = ladder('certificates', found.cert.image);
    title = found.cert.title;
    body = (
      <>
        <p className="portal__meta mono portal__rise" style={step(2)}>
          {found.cert.issuer}
        </p>
        {img ? (
          <figure className="portal__plate portal__rise" style={{ ...step(3), '--ratio': img.width / img.height } as CSSProperties}>
            <Zoomable by={2.2}>{(zoomed) => <Picture img={img} sizes={zoomed ? '(min-width: 900px) 1580px, 200vw' : '(min-width: 900px) 720px, 92vw'} alt="" className="portal__img" eager />}</Zoomable>
          </figure>
        ) : null}
      </>
    );
  }
  return (
    <div className="portal__dossier">
      <h3 className="portal__title portal__rise" style={step(1)}>
        {title}
      </h3>
      {body}
      <p className="portal__framed portal__rise" style={step(6)}>
        {COPY.framed(host)}
      </p>
    </div>
  );
}

export default function Portal({ link, open, onClose }: { link: Outbound | null; open: boolean; onClose: () => void }) {
  const found = useMemo(() => (link ? resolve(link.href) : null), [link]);
  const [copied, setCopied] = useState('');
  const [launching, setLaunching] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const going = useRef(false);
  const timers = useRef<number[]>([]);
  const address = useRef<HTMLSpanElement>(null);
  const exit = useRef<HTMLAnchorElement>(null);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    setCopied('');
    setLaunching(false);
  }, [link]);
  useEffect(() => {
    if (!open) return;
    going.current = false;
    setLeaving(false);
  }, [open, link]);
  // Its exit plays before it closes (portal.css, .is-leaving), timed here: Safari cannot
  // transition a dialog that is closing, and showed none.
  const leave = useCallback(() => {
    if (going.current) return;
    going.current = true;
    setLeaving(true);
    timers.current.push(window.setTimeout(onClose, motionAllowed() ? 240 : 0));
  }, [onClose]);
  // the address prints itself once, and the way out leans toward the pointer
  useEffect(() => {
    if (!open || !link) return undefined;
    if (address.current) decrypt(address.current, 0.8);
    return exit.current ? magnet(exit.current, 0.22) : undefined;
  }, [open, link]);

  const url = link ? new URL(link.href) : null;
  const host = url?.hostname.replace(/^www\./, '') ?? '';
  // a code to scan is for a screen that is not the phone: beside the dossier, where there is room
  const wide = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 768px)').matches;
  const code = useMemo(() => (link && wide ? qrPath(link.href) : null), [link, wide]);

  const copy = (what: string, text: string) => (event: { currentTarget: HTMLElement }) => {
    const r = event.currentTarget.getBoundingClientRect();
    void navigator.clipboard?.writeText(text);
    spark(r.left + r.width / 2, r.top + r.height / 2);
    setCopied(what);
    timers.current.push(window.setTimeout(() => setCopied(''), 1600));
  };
  // The link still opens by itself: the window only flies out behind it, then closes.
  const launch = () => {
    setLaunching(true);
    timers.current.push(window.setTimeout(onClose, 420));
  };
  // A frame holds another document: it stays flat, or its text blurs and its clicks land off.
  const flat = found?.kind === 'resume' || found?.kind === 'video';
  // 1:1 with the pointer: the window leans toward it and a light follows it across the glass.
  // Level again when the pointer leaves (portal.css eases only the way back).
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !motionAllowed()) return;
    const el = event.currentTarget;
    const r = el.getBoundingClientRect();
    el.removeAttribute('data-level');
    el.style.setProperty('--gx', `${(event.clientX - r.left).toFixed(0)}px`);
    el.style.setProperty('--gy', `${(event.clientY - r.top).toFixed(0)}px`);
    if (flat) return;
    el.style.setProperty('--tx', ((event.clientX / innerWidth) * 2 - 1).toFixed(3));
    el.style.setProperty('--ty', ((event.clientY / innerHeight) * 2 - 1).toFixed(3));
  };
  const level = (event: PointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    el.setAttribute('data-level', '');
    el.style.setProperty('--tx', '0');
    el.style.setProperty('--ty', '0');
  };
  // Touch: the bar is a handle. The window follows the finger down 1:1. Let go past a third of
  // its height, or with a flick, and it closes; short of that it springs back.
  const drag = useRef<{ id: number; from: number; t: number; y: number; v: number } | null>(null);
  const pull = (event: PointerEvent<HTMLElement>) => {
    const win = event.currentTarget.parentElement;
    const sheet = win?.closest('dialog');
    if (!win || !sheet) return;
    if (event.type === 'pointerdown') {
      if (event.pointerType === 'mouse' || (event.target as Element).closest('button')) return;
      drag.current = { id: event.pointerId, from: event.clientY, t: event.timeStamp, y: event.clientY, v: 0 };
      event.currentTarget.setPointerCapture(event.pointerId);
      win.removeAttribute('data-level');
      return;
    }
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const by = Math.max(0, event.clientY - d.from);
    if (event.type === 'pointermove') {
      // speed over the last stretch of the gesture, in px per ms
      if (event.timeStamp - d.t > 16) Object.assign(d, { v: (event.clientY - d.y) / (event.timeStamp - d.t), t: event.timeStamp, y: event.clientY });
      sheet.style.setProperty('--dy', `${by.toFixed(0)}px`);
      sheet.style.setProperty('--drag', Math.min(1, by / win.offsetHeight).toFixed(3));
      return;
    }
    drag.current = null;
    win.setAttribute('data-level', '');
    if (event.type === 'pointerup' && (by > win.offsetHeight / 3 || (d.v > 0.6 && by > 24))) return leave();
    sheet.style.setProperty('--dy', '0px');
    sheet.style.setProperty('--drag', '0');
  };

  const paper = found?.kind === 'paper' ? found.paper : null;
  const citation = paper ? `${paper.authors} (${paper.year}). ${paper.title}. ${paper.venue}. https://doi.org/${paper.doi}` : '';
  const name = found?.kind === 'resume' ? HERO.resume.label : link?.label || host;
  const shown = url ? `${host}${url.pathname.replace(/\/$/, '')}${url.search}` : '';

  return (
    <Dialog open={open} onClose={leave} title={name} hideTitle className={`portal${found ? ` portal--${found.kind}` : ''}${leaving ? ' is-leaving' : ''}`}>
      {link && found ? (
        <>
          <div className="portal__space" aria-hidden="true">
            <span className="portal__rays" />
          </div>
          <div className="portal__stage" style={{ '--ox': `${link.x}px`, '--oy': `${link.y}px` } as CSSProperties}>
            <div className={`portal__window${launching ? ' is-launching' : ''}`} data-level="" onPointerMove={tilt} onPointerLeave={level}>
              <span className="portal__rim" aria-hidden="true">
                <i />
              </span>
              <span className="portal__glare" aria-hidden="true" />
              <header className="portal__bar" onPointerDown={pull} onPointerMove={pull} onPointerUp={pull} onPointerCancel={pull}>
                <span className="portal__site">{COPY.kind[found.kind]}</span>
                <span className="portal__address mono" title={link.href} ref={address} data-text={shown}>
                  {shown}
                </span>
                <button type="button" className="icon-btn" aria-label={copied === 'link' ? COPY.copied : COPY.copy} title={COPY.copy} onClick={copy('link', link.href)}>
                  {copied === 'link' ? <CheckIcon /> : <CopyIcon />}
                </button>
                <button type="button" className="icon-btn" aria-label="Close" onClick={leave}>
                  <CloseIcon />
                </button>
              </header>
              <div className="portal__body">
                {found.kind !== 'resume' ? (
                  <Dossier found={found} label={link.label} host={host} />
                ) : showsPdf() ? (
                  <iframe className="portal__pdf" src={`${LINKS.resume}#view=FitH`} title={HERO.resume.label} />
                ) : (
                  <Pages />
                )}
                <aside className="portal__aside">
                  {code ? (
                    <figure className="portal__qr">
                      <span className="portal__qr-plate">
                        <span className="portal__qr-clip">
                          <svg viewBox={`-2 -2 ${code.size + 4} ${code.size + 4}`} role="img" aria-label={COPY.scan} shapeRendering="crispEdges">
                            <path d={code.d} />
                          </svg>
                        </span>
                      </span>
                      <figcaption className="mono">{COPY.scan}</figcaption>
                    </figure>
                  ) : null}
                  <a
                    className="btn btn--primary portal__go"
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-portal-exit=""
                    onClick={launch}
                    // where a dialog puts focus when it opens: Enter again goes on to the address
                    ref={(el) => {
                      exit.current = el;
                      el?.setAttribute('autofocus', '');
                    }}
                  >
                    {COPY.open} <ArrowUpRight />
                  </a>
                  {paper ? (
                    <button type="button" className="btn btn--secondary" onClick={copy('cite', citation)}>
                      {copied === 'cite' ? COPY.copied : COPY.cite}
                    </button>
                  ) : null}
                  {found.kind === 'resume' ? (
                    <a className="btn btn--secondary" href={LINKS.resume} download>
                      {COPY.download}
                    </a>
                  ) : null}
                </aside>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </Dialog>
  );
}
