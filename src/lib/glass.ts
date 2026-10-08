/**
 * Liquid-glass helpers: the Chromium-only refraction filter (mounted once) and a pointer-tracked
 * specular highlight. The highlight moves with a transform set straight from the pointer
 * position (no easing, which would read as lag) and fades out where it is when the pointer leaves.
 */
import { lowTier } from './motion';

let installed = false;

/** Mount the refraction filter and enable it on Chromium (other engines ignore url() backdrops). */
export function installGlass() {
  if (installed) return;
  installed = true;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands ?? [];
  const chromium = brands.some((b) => /Chromium/i.test(b.brand));
  if (!chromium || lowTier()) return;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  // Static turbulence -> displacement: bends the backdrop at the glass edges; never animates.
  svg.innerHTML = `<defs><filter id="liquid-glass" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="noise"/>
<feGaussianBlur in="noise" stdDeviation="1.2" result="soft"/>
<feDisplacementMap in="SourceGraphic" in2="soft" scale="10" xChannelSelector="R" yChannelSelector="G"/>
</filter></defs>`;
  document.body.appendChild(svg);
  document.documentElement.classList.add('refract');
}

/** Pointer-tracked specular on `el` (which must contain .glass__specwrap > .glass__spec). */
export function trackSpecular(el: HTMLElement): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const spec = el.querySelector<HTMLElement>('.glass__spec');
  if (!spec) return () => {};
  const move = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    spec.style.setProperty('--px', `${e.clientX - r.left}px`);
    spec.style.setProperty('--py', `${e.clientY - r.top}px`);
    el.dataset.spec = 'on';
  };
  const leave = () => {
    el.dataset.spec = 'off';
  };
  el.addEventListener('pointermove', move, { passive: true });
  el.addEventListener('pointerleave', leave);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', leave);
  };
}
