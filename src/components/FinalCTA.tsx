import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import Magnetic from './Magnetic';

/** FinalCTA — the finale; page theme flips to dark while in view. */
export default function FinalCTA() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    // Retuned cascade for the finale: heading lands hardest, legal whispers in last
    const seq: Array<[string, number]> = [
      ['.live-badge', 0],
      ['.final-heading', .12],
      ['.final-sub', .24],
      ['.btn-group', .34],
      ['.final-disclaimer', .5],
    ];
    seq.forEach(([sel, delay], i) => {
      gsap.from(sel, {
        opacity: 0, y: 48 - i * 8, duration: .95, delay, ease: 'power3.out',
        scrollTrigger: { trigger: sel, start: 'top 88%', once: true },
      });
    });

    // Flip to dark theme as the finale pins
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 55%',
      end: 'bottom 60%',
      onEnter:     () => document.documentElement.setAttribute('data-color-mode', 'dark'),
      onEnterBack: () => document.documentElement.setAttribute('data-color-mode', 'dark'),
      onLeaveBack: () => document.documentElement.setAttribute('data-color-mode', 'light'),
      onLeave:     () => document.documentElement.setAttribute('data-color-mode', 'dark'),
    });
  }, { scope: ref });

  return (
    <section id="final-cta" ref={ref}>
      <div className="final-cta-inner">
        <div className="live-badge">
          <div className="pulse" /> Live Network
        </div>
        <h2 className="final-heading">
          One rule.<br />
          <em>Enforced forever.</em>
        </h2>
        <p className="final-sub">
          The Standard Reserve is live. Bank charters are open.
          The protocol is running. There is no team to ask, no vote to wait for.
          The network state is available now.
        </p>
        <div className="btn-group">
          <Magnetic strength={0.45}>
            <a href="https://www.standardreserve.xyz/app/" className="btn-primary" target="_blank" rel="noopener">
              Launch App ↗
            </a>
          </Magnetic>
          <Magnetic strength={0.45}>
            <a href="https://x.com/standard_rsv" className="btn-outline" target="_blank" rel="noopener">
              Follow on X ↗
            </a>
          </Magnetic>
        </div>
        <div className="final-disclaimer">
          <p>
            This is an unofficial concept page, built for design demonstration
            only. It is not affiliated with, endorsed by, or connected to
            Standard Reserve — the official site is standardreserve.xyz.
          </p>
          <p>
            STANDARD is an experimental onchain protocol. It holds no deposits,
            offers no accounts, and is not a regulated financial institution.
            Nothing here is investment advice. Participate at your own risk.
          </p>
        </div>
      </div>
      <div className="final-orb" aria-hidden="true" />
    </section>
  );
}
