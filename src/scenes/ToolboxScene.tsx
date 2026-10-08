/**
 * Toolbox: the tools on a globe (a Fibonacci sphere of DOM items that always face the viewer).
 * Each item is a logo above its name; items on the far side show only a dim logo, so labels
 * never pile up. Scrolling turns the globe; dragging spins it too (mouse or touch; horizontal
 * drags spin, vertical swipes still scroll), with a short glide after release.
 * Reduced motion and the low tier: the same tools as grouped chips with logos.
 */
import { useEffect, useRef } from 'react';
import TechIcon from '../components/TechIcon';
import { CATEGORIES, technologies } from '../components/techData';
import { gsap } from '../lib/gsap';
import { decryptOnView } from '../lib/micro';
import { useScene } from '../lib/useScene';
import './toolbox.css';

/** Unit vectors on a Fibonacci sphere. */
const POINTS = technologies.map((_, i, all) => {
  const n = all.length;
  const y = 1 - (2 * (i + 0.5)) / n;
  const r = Math.sqrt(1 - y * y);
  const phi = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(phi) * r, y, z: Math.sin(phi) * r };
});
// Spread categories around the globe instead of clustering them in bands.
const ORDER = technologies.map((_, i) => i).sort((a, b) => ((a * 7) % technologies.length) - ((b * 7) % technologies.length));

export default function ToolboxScene() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hint = root.current?.querySelector<HTMLElement>('.toolbox__hint');
    return hint ? decryptOnView([hint], 'top 80%') : undefined;
  }, []);

  useScene(root, ({ section }) => {
    const globe = section.querySelector<HTMLElement>('.globe');
    if (!globe) return undefined;
    const items = gsap.utils.toArray<HTMLElement>('.globe__item', globe);
    const labels = items.map((el) => el.querySelector<HTMLElement>('.globe__label'));
    const state = { turn: 0, spin: 0, tilt: -12 };
    // phones have less room between items, so only the front-most few carry names
    const [from, span] = section.classList.contains('is-mobile') ? [0.55, 0.3] : [0.05, 0.4];

    // Layout numbers the name pass needs, read once (and again on refresh), never per frame.
    const box = { widths: [] as number[], icon: 28, drop: 16, persp: 1400 };
    const measure = () => {
      box.widths = labels.map((l) => l?.offsetWidth ?? 0);
      box.icon = items[0]?.querySelector<HTMLElement>('.globe__icon')?.offsetWidth ?? 28;
      // the name's centre sits this far under the item's centre (icon, gap, then the name)
      const name = labels.find(Boolean);
      if (name && items[0]) box.drop = (items[0].offsetHeight - name.offsetHeight) / 2;
      box.persp = parseFloat(getComputedStyle(globe.parentElement as HTMLElement).perspective) || 1400;
    };
    measure();

    const near = items.map(() => 0);
    const at = items.map(() => [0, 0]);
    const order = items.map((_, i) => i);
    const render = () => {
      const R = globe.offsetWidth / 2;
      const a = ((state.turn + state.spin) * Math.PI) / 180;
      const b = (state.tilt * Math.PI) / 180;
      const [ca, sa, cb, sb] = [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b)];
      items.forEach((el, i) => {
        const p = POINTS[ORDER[i]];
        const x1 = p.x * ca + p.z * sa;
        const z1 = -p.x * sa + p.z * ca;
        const y2 = p.y * cb - z1 * sb;
        const z2 = p.y * sb + z1 * cb;
        el.style.transform = `translate3d(${(x1 * R).toFixed(1)}px, ${(y2 * R).toFixed(1)}px, ${(z2 * R).toFixed(1)}px) translate(-50%, -50%)`;
        el.style.opacity = (0.16 + 0.84 * ((z2 + 1) / 2) ** 1.5).toFixed(3);
        near[i] = z2;
        at[i] = [x1 * R, y2 * R];
      });
      // Names only on the near side (the far side is logos only), and nearest first: a name shows
      // only where no nearer logo or name already sits. Without this pass they piled up
      // ("PostgreSQL" under "ASP.NET MVC", "HTML" under "JS").
      const taken: number[][] = [];
      const free = (r: number[]) => !taken.some((o) => r[0] < o[2] && r[2] > o[0] && r[1] < o[3] && r[3] > o[1]);
      order.sort((p, q) => near[q] - near[p]);
      for (const i of order) {
        // nearer items draw larger under the stage's perspective
        const m = box.persp / (box.persp - near[i] * R);
        const [x, y] = [at[i][0] * m, at[i][1] * m];
        const logo = (box.icon / 2 + 2) * m;
        const label = labels[i];
        let shown = Math.min(1, Math.max(0, (near[i] - from) / span));
        if (label && shown > 0) {
          const [w, h] = [(box.widths[i] / 2 + 4) * m, 9 * m];
          const rect = [x - w, y + box.drop * m - h, x + w, y + box.drop * m + h];
          if (free(rect)) taken.push(rect);
          else shown = 0;
        }
        if (label) label.style.opacity = shown.toFixed(3);
        taken.push([x - logo, y - box.drop * m - logo, x + logo, y - box.drop * m + logo]);
      }
    };
    render();

    // Scroll turns the globe 0 -> 300 degrees across the section.
    gsap.to(state, {
      turn: 300,
      tilt: 12,
      ease: 'none',
      onUpdate: render,
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onRefresh: () => {
          measure();
          render();
        },
      },
    });

    // Drag to spin: the globe follows the pointer 1:1, then glides a moment after release.
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let velocity = 0;
    let glide: gsap.core.Tween | null = null;
    const down = (e: PointerEvent) => {
      dragging = true;
      glide?.kill();
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      velocity = 0;
      globe.setPointerCapture(e.pointerId);
      globe.classList.add('is-dragging');
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const deg = dx * 0.35;
      state.spin += deg;
      state.tilt = Math.max(-28, Math.min(28, state.tilt - dy * 0.15));
      velocity = deg / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      render();
    };
    const up = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      globe.classList.remove('is-dragging');
      if (globe.hasPointerCapture(e.pointerId)) globe.releasePointerCapture(e.pointerId);
      const target = state.spin + velocity * 420;
      glide = gsap.to(state, { spin: target, duration: 0.9, ease: 'power3.out', onUpdate: render });
    };
    globe.addEventListener('pointerdown', down);
    globe.addEventListener('pointermove', move);
    globe.addEventListener('pointerup', up);
    globe.addEventListener('pointercancel', up);

    return () => {
      glide?.kill();
      globe.removeEventListener('pointerdown', down);
      globe.removeEventListener('pointermove', move);
      globe.removeEventListener('pointerup', up);
      globe.removeEventListener('pointercancel', up);
      items.forEach((el) => {
        el.style.transform = '';
        el.style.opacity = '';
      });
      labels.forEach((l) => l && (l.style.opacity = ''));
    };
  });

  return (
    <div ref={root} className="toolbox">
      <div className="toolbox__sticky">
        <div className="toolbox__head wrap">
          <h2 id="toolbox-title" className="heading">
            Tools I use
          </h2>
          <p className="lede">From the model to the app: the languages, frameworks and libraries behind the work on this page.</p>
          <p className="toolbox__hint mono" aria-hidden="true">
            Drag the globe to spin it
          </p>
        </div>

        <div className="toolbox__persp persp" aria-hidden="true">
          <ul className="globe stage" data-cursor="Drag">
            {ORDER.map((idx) => (
              <li key={technologies[idx].name} className="globe__item">
                <TechIcon name={technologies[idx].name} size={28} className="globe__icon" />
                <span className="globe__label">{technologies[idx].name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="toolbox__groups wrap">
          {CATEGORIES.map((category) => (
            <section key={category} className="toolbox__group" aria-label={category}>
              <h3 className="mono toolbox__cat">{category}</h3>
              <ul className="chips">
                {technologies
                  .filter((t) => t.category === category)
                  .map((t) => (
                    <li key={t.name} className="chip toolbox__chip">
                      <TechIcon name={t.name} size={15} />
                      {t.name}
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
