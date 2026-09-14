import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { scrollTop, scrollToTarget } from '../lib/scroll';
import Magnetic from './Magnetic';

/** Fixed nav — fades in, hides on scroll down, returns on scroll up. */
export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const hidden = useRef(false);

  useGSAP(() => {
    gsap.to('#nav .nav-item', { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out', delay: .3 });

    ScrollTrigger.create({
      start: 'top top-=10',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 120 && !hidden.current) {
          hidden.current = true;
          gsap.to(navRef.current, { yPercent: -110, duration: .5, ease: 'power3.out' });
        } else if (self.direction === -1 && hidden.current) {
          hidden.current = false;
          gsap.to(navRef.current, { yPercent: 0, duration: .5, ease: 'power3.out' });
        }
      },
    });
  }, { scope: navRef });

  return (
    <nav id="nav" ref={navRef}>
      <a href="/" className="nav-logo nav-item" onClick={(e) => { e.preventDefault(); scrollTop(); }}>
        <div className="nav-logo-mark" />
        Standard Reserve
      </a>
      <div className="nav-links nav-item">
        <a href="#manifesto" onClick={(e) => { e.preventDefault(); scrollToTarget('#manifesto'); }}>Protocol</a>
        <a href="#features" onClick={(e) => { e.preventDefault(); scrollToTarget('#features'); }}>Architecture</a>
        <a href="#final-cta" onClick={(e) => { e.preventDefault(); scrollToTarget('#final-cta'); }}>Network</a>
      </div>
      <Magnetic>
        <a href="https://www.standardreserve.xyz/app/" className="nav-cta-btn nav-item" target="_blank" rel="noopener">
          Launch App <span className="arr">↗</span>
        </a>
      </Magnetic>
    </nav>
  );
}
