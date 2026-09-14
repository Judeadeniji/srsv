import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { useMaskedReveal } from '../lib/anim';

/** Manifesto — editorial split statement + body copy. */
export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  useMaskedReveal(ref);

  useGSAP(() => {
    gsap.from('.manifesto-overline', {
      opacity: 0, y: 24, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '.manifesto-overline', start: 'top 85%', once: true },
    });
    gsap.from('.manifesto-link', {
      opacity: 0, y: 20, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '.manifesto-link', start: 'top 90%', once: true },
    });
  }, { scope: ref });

  return (
    <section id="manifesto" ref={ref}>
      <div className="manifesto-inner">
        <div className="manifesto-left">
          <span className="manifesto-overline">The Protocol</span>
          <p className="manifesto-statement" data-split>
            A sovereign monetary<br />
            system with a single<br />
            <em>invariant objective.</em>
          </p>
        </div>
        <div className="manifesto-right">
          <p className="manifesto-body" data-split>
            Standard Reserve is not a stablecoin. It is not a DAO. It is a
            fully autonomous onchain central bank — governed only by the rules
            encoded in its protocol. It tracks one number: the price of RSV.
            It expands and contracts supply to defend that price. No exceptions.
            No governance theatre. No human override.
          </p>
          <a href="https://www.standardreserve.xyz/app/" className="manifesto-link" target="_blank" rel="noopener">
            <span className="ml-text">Explore the protocol</span>
            <span className="ml-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
