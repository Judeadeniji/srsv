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
            STANDARD is not a stablecoin, and it is not a DAO. It is a closed
            monetary economy run by an autonomous central bank — 4,000 lines of
            immutable code. One currency. One market. One signal: net ETH flow
            through the canonical pool. Capital flows in, issuance loosens and
            hard reserves stack. Capital flows out, the bank buys back and
            burns. No committee. No vote. No human override.
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
