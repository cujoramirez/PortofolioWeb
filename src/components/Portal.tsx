/**
 * The portal: where a link that would leave the page opens instead. A window grows out of the
 * link over the page and holds what this site has on the destination: the résumé itself, a
 * certificate's image, a paper's details, a project, a profile's outline. Other sites do not
 * let themselves be displayed inside a page, so the way out is stated in the window (a new tab,
 * or a code to scan with a phone) rather than taken for the visitor. See lib/outbound.ts.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import Dialog from './Dialog';
import Picture, { ladder } from './Picture';
import SocialIcon from './SocialIcon';
import { ArrowUpRight, CheckIcon, CloseIcon, CopyIcon } from './icons';
import { certificates, experiences, firstSentence, papers, projects, splitTitle, type Certificate, type Paper, type Project } from '../content/data';
import { HERO, LINKS, OWNER, SECTIONS } from '../content/site';
import { decrypt, magnet, spark } from '../lib/micro';
import { motionAllowed } from '../lib/motion';
import type { Outbound } from '../lib/outbound';
import { qrPath } from '../lib/qr';
import './portal.css';

/** Interface text new with the portal (2026-10-10). */
const COPY = {
  kind: { resume: 'Résumé', profile: 'Profile', paper: 'Paper', certificate: 'Certificate', project: 'Project', video: 'Video', site: 'Link' },
  open: 'Open in a new tab',
  copy: 'Copy link',
  copied: 'Copied',
  cite: 'Copy citation',
  download: 'Download',
  scan: 'Scan to open on a phone',
  framed: (host: string) => `Other sites cannot display ${host} inside their pages. This is what this page holds about it.`,
  noPdf: 'This browser cannot show a PDF inside a page. This is an outline of it.',
} as const;

type Found =
  | { kind: 'resume' }
  | { kind: 'profile'; site: string }
  | { kind: 'paper'; paper: Paper }
  | { kind: 'certificate'; cert: Certificate }
  | { kind: 'project'; project: Project }
  | { kind: 'video'; id: string; project?: Project }
  | { kind: 'site' };

const same = (a: string, b: string) => a.replace(/\/$/, '') === b.replace(/\/$/, '');

/** What this site knows about an address. */
function resolve(href: string): Found {
  const url = new URL(href);
  if (url.origin === location.origin && url.pathname === LINKS.resume) return { kind: 'resume' };
  // A YouTube video plays here: its player is made to be placed in other pages.
  const video = url.hostname === 'youtu.be' ? url.pathname.slice(1) : /(^|\.)youtube\.com$/.test(url.hostname) && url.pathname === '/watch' ? url.searchParams.get('v') : null;
  if (video) return { kind: 'video', id: video, project: projects.find((p) => p.demo === href || p.links.includes(href)) };
  const site = HERO.socials.find((s) => same(s.href, href));
  if (site) return { kind: 'profile', site: site.label };
  const paper = papers.find((p) => p.doi && href.includes(p.doi));
  if (paper) return { kind: 'paper', paper };
  const cert = certificates.find((c) => same(c.link, href));
  if (cert) return { kind: 'certificate', cert };
  const project = projects.find((p) => [p.demo, p.github, ...p.links].some((l) => l && same(l, href)));
  if (project) return { kind: 'project', project };
  return { kind: 'site' };
}

const step = (i: number) => ({ '--i': i }) as CSSProperties;
const sectionTitle = (id: string) => SECTIONS.find((s) => s.id === id)?.title ?? '';

function Dossier({ found, label, host }: { found: Found; label: string; host: string }) {
  let title = label || host;
  let body: ReactNode = null;
  let note: string = COPY.framed(host);
  if (found.kind === 'resume') {
    title = OWNER;
    note = COPY.noPdf;
    body = (
      <>
        <p className="portal__text portal__rise" style={step(2)}>
          {HERO.role}
        </p>
        <section className="portal__rise" style={step(3)}>
          <h4 className="portal__label mono">{sectionTitle('experience')}</h4>
          <ol className="portal__list">
            {experiences.map((x) => (
              <li key={x.role + x.year}>
                <span>
                  {x.role}, {x.company}
                </span>
                <span className="mono">{x.year}</span>
              </li>
            ))}
          </ol>
        </section>
      </>
    );
  } else if (found.kind === 'profile') {
    title = OWNER;
    body = (
      <>
        <p className="portal__text portal__rise" style={step(3)}>
          {HERO.role}
        </p>
        {found.site === 'Google Scholar' ? (
          <section className="portal__rise" style={step(4)}>
            <h4 className="portal__label mono">{sectionTitle('papers')}</h4>
            <ol className="portal__list">
              {papers.map((p) => (
                <li key={p.title}>
                  <span>{p.title}</span>
                  <span className="mono">
                    {p.venue} · {p.year}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : found.site === 'LinkedIn' ? (
          <section className="portal__rise" style={step(4)}>
            <h4 className="portal__label mono">{sectionTitle('experience')}</h4>
            <ol className="portal__list">
              {experiences.slice(0, 3).map((x) => (
                <li key={x.role + x.year}>
                  <span>
                    {x.role}, {x.company}
                  </span>
                  <span className="mono">{x.year}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <ul className="portal__facts mono portal__rise" style={step(4)}>
            {HERO.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </>
    );
  } else if (found.kind === 'paper') {
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
          <figure className="portal__plate portal__rise" style={step(3)}>
            <Picture img={img} sizes="(min-width: 900px) 720px, 92vw" alt="" className="portal__img" eager />
          </figure>
        ) : null}
      </>
    );
  } else if (found.kind === 'video') {
    const [name, sub] = found.project ? splitTitle(found.project.title) : [label || host, null];
    return (
      <div className="portal__dossier">
        <div className="portal__video portal__rise" style={step(1)}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(found.id)}?rel=0&playsinline=1`}
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
  } else if (found.kind === 'project') {
    const [name, sub] = splitTitle(found.project.title);
    const img = ladder('projects', found.project.image);
    title = name;
    body = (
      <>
        {sub ? (
          <p className="portal__lead portal__rise" style={step(2)}>
            {sub}
          </p>
        ) : null}
        {img ? (
          <figure className="portal__plate portal__rise" style={step(3)}>
            <Picture img={img} sizes="(min-width: 900px) 720px, 92vw" alt="" className="portal__img" eager />
          </figure>
        ) : null}
        <p className="portal__text portal__rise" style={step(4)}>
          {firstSentence(found.project.description)}
        </p>
        <ul className="chips portal__rise" style={step(5)} aria-label="Technologies">
          {found.project.technologies.slice(0, 8).map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
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
        {note}
      </p>
    </div>
  );
}

export default function Portal({ link, open, onClose }: { link: Outbound | null; open: boolean; onClose: () => void }) {
  const found = useMemo(() => (link ? resolve(link.href) : null), [link]);
  const [copied, setCopied] = useState('');
  const [launching, setLaunching] = useState(false);
  const timers = useRef<number[]>([]);
  const address = useRef<HTMLSpanElement>(null);
  const exit = useRef<HTMLAnchorElement>(null);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    setCopied('');
    setLaunching(false);
  }, [link]);
  // the address prints itself once, and the way out leans toward the pointer
  useEffect(() => {
    if (!open || !link) return undefined;
    if (address.current) decrypt(address.current, 0.8);
    return exit.current ? magnet(exit.current, 0.22) : undefined;
  }, [open, link]);

  const url = link ? new URL(link.href) : null;
  const host = url?.hostname.replace(/^www\./, '') ?? '';
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  // a code to scan is for a screen that is not the phone: beside the dossier, where there is room
  const wide = mouse && window.matchMedia('(min-width: 768px)').matches;
  const code = useMemo(() => (link && wide ? qrPath(link.href) : null), [link, wide]);
  // A PDF in a frame needs a viewer made for one. Phones have none: Chrome on Android shows
  // nothing, and iOS draws the first page at its full size, over whatever is beside the frame.
  const pdf = mouse && (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled !== false;

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
  const flat = (found?.kind === 'resume' && pdf) || found?.kind === 'video';
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
  // Touch: the bar is a handle. The window follows the finger down 1:1; let go past a quarter
  // of the screen and it closes, short of that it springs back.
  const drag = useRef<{ id: number; from: number } | null>(null);
  const pull = (event: PointerEvent<HTMLElement>) => {
    const win = event.currentTarget.parentElement;
    if (!win) return;
    if (event.type === 'pointerdown') {
      if (event.pointerType === 'mouse' || (event.target as Element).closest('button')) return;
      drag.current = { id: event.pointerId, from: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
      win.removeAttribute('data-level');
      return;
    }
    if (!drag.current || drag.current.id !== event.pointerId) return;
    const by = Math.max(0, event.clientY - drag.current.from);
    if (event.type === 'pointermove') {
      win.style.setProperty('--dy', `${by.toFixed(0)}px`);
      win.style.setProperty('--drag', Math.min(1, by / innerHeight).toFixed(3));
      return;
    }
    drag.current = null;
    if (event.type === 'pointerup' && by > innerHeight * 0.25) return onClose();
    win.setAttribute('data-level', '');
    win.style.setProperty('--dy', '0px');
    win.style.setProperty('--drag', '0');
  };

  const paper = found?.kind === 'paper' ? found.paper : null;
  const citation = paper ? `${paper.authors} (${paper.year}). ${paper.title}. ${paper.venue}. https://doi.org/${paper.doi}` : '';
  const name = found?.kind === 'profile' ? found.site : found?.kind === 'resume' ? HERO.resume.label : link?.label || host;
  const shown = url ? `${host}${url.pathname.replace(/\/$/, '')}${url.search}` : '';

  return (
    <Dialog open={open} onClose={onClose} title={name} hideTitle className={`portal${found ? ` portal--${found.kind}` : ''}`}>
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
                <span className="portal__site">
                  {found.kind === 'profile' ? <SocialIcon name={found.site} size={18} /> : null}
                  <span>{found.kind === 'profile' ? found.site : COPY.kind[found.kind]}</span>
                </span>
                <span className="portal__address mono" title={link.href} ref={address} data-text={shown}>
                  {shown}
                </span>
                <button type="button" className="icon-btn" aria-label={copied === 'link' ? COPY.copied : COPY.copy} title={COPY.copy} onClick={copy('link', link.href)}>
                  {copied === 'link' ? <CheckIcon /> : <CopyIcon />}
                </button>
                <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
                  <CloseIcon />
                </button>
              </header>
              <div className="portal__body">
                {found.kind === 'resume' && pdf ? (
                  <iframe className="portal__pdf" src={`${LINKS.resume}#view=FitH`} title={HERO.resume.label} />
                ) : (
                  <Dossier found={found} label={link.label} host={host} />
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
