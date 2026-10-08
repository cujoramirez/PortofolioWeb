/**
 * Certificates: four featured tiles flip in (rotateY 90 -> 0, staggered) as they scroll in; each
 * opens the certificate. "View all" opens the full set in a dialog.
 */
import { useEffect, useRef } from 'react';
import Dialog from '../components/Dialog';
import Picture, { ladder } from '../components/Picture';
import { ArrowUpRight } from '../components/icons';
import { certificates, featuredCertificates, type Certificate } from '../content/data';
import { gsap } from '../lib/gsap';
import { magnet, spotlight } from '../lib/micro';
import { useScene } from '../lib/useScene';
import { useHashDialog } from './useHashDialog';
import './certificates.css';

function Tile({ cert, sizes }: { cert: Certificate; sizes: string }) {
  const img = ladder('certificates', cert.image);
  return (
    <a className="cert card has-spot" href={cert.link} target="_blank" rel="noopener noreferrer" data-cursor="View">
      <span className="cert__plate">{img ? <Picture img={img} sizes={sizes} alt="" className="cert__img" /> : null}</span>
      <span className="cert__text">
        <span className="cert__title">{cert.title}</span>
        <span className="cert__issuer mono">
          {cert.issuer} <ArrowUpRight size={13} />
        </span>
      </span>
    </a>
  );
}

export default function CertificatesScene() {
  const root = useRef<HTMLDivElement>(null);
  const archive = useHashDialog('#all-certificates');

  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const undo = [
      ...[...el.querySelectorAll<HTMLElement>('.certs__wall .cert')].map(spotlight),
      ...[...el.querySelectorAll<HTMLElement>('.certs__foot .btn')].map((b) => magnet(b)),
    ];
    return () => undo.forEach((fn) => fn());
  }, []);

  useScene(root, ({ variant, section }) => {
    const tiles = section.querySelectorAll('.certs__wall > li');
    gsap.fromTo(
      tiles,
      { rotateY: variant === 'mobile' ? 60 : 90, opacity: 0 },
      {
        rotateY: 0,
        opacity: 1,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section.querySelector('.certs__wall'), start: 'top 88%', end: 'top 40%', scrub: 0.6 },
      },
    );
    return undefined;
  });

  return (
    <div ref={root} className="certs wrap">
      <h2 id="certificates-title" className="heading">
        Certificates
      </h2>
      <p className="lede">Coursework in machine learning, computer vision and software from NVIDIA, Kaggle and freeCodeCamp.</p>
      <div className="certs__persp persp">
        <ul className="certs__wall stage">
          {featuredCertificates.map((c) => (
            <li key={c.title}>
              <Tile cert={c} sizes="(min-width: 1024px) 290px, (min-width: 640px) 45vw, 92vw" />
            </li>
          ))}
        </ul>
      </div>
      <div className="certs__foot">
        <button type="button" className="btn btn--secondary" onClick={archive.show}>
          View all {certificates.length} certificates
        </button>
      </div>

      <Dialog open={archive.open} onClose={archive.hide} title={`All ${certificates.length} certificates`} full>
        <ul className="certs__all wrap">
          {certificates.map((c) => (
            <li key={c.title}>
              <Tile cert={c} sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 92vw" />
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
