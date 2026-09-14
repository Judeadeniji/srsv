import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { scrollTop, scrollToTarget } from '../lib/scroll';

/** Footer — giant wordmark reveal, live UTC clock, unofficial-concept notice. */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    // Giant wordmark rises from below
    gsap.from('.footer-wordmark span', {
      yPercent: 100,
      duration: 1.1,
      stagger: .05,
      ease: 'power4.out',
      scrollTrigger: { trigger: '.footer-wordmark', start: 'top 92%', once: true },
    });

    // Live UTC clock
    const tick = () => {
      if (clockRef.current) {
        clockRef.current.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, { scope: ref });

  return (
    <footer id="footer" ref={ref}>
      <div className="footer-top">
        <a href="/" className="footer-logo" onClick={(e) => { e.preventDefault(); scrollTop(); }}>
          <div className="footer-logo-mark" />
          Standard Reserve
        </a>
        <ul className="footer-links">
          <li><a href="#manifesto" onClick={(e) => { e.preventDefault(); scrollToTarget('#manifesto'); }}>Protocol</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollToTarget('#features'); }}>Architecture</a></li>
          <li><a href="https://x.com/standard_rsv" target="_blank" rel="noopener">X / Twitter</a></li>
          <li><a href="https://www.standardreserve.xyz/app/" target="_blank" rel="noopener">App</a></li>
        </ul>
        <div className="footer-meta">
          <span className="footer-clock">UTC <span ref={clockRef}>00:00:00</span></span>
          <span className="footer-copy">Unofficial concept — not affiliated with Standard Reserve</span>
          <span className="footer-copy">&copy; {new Date().getFullYear()} Standard Reserve</span>
          <span className="footer-copy" style={{ marginTop: '0.2rem' }}>
            Design by <a href="https://x.com/pauline_fathima" target="_blank" rel="noopener" style={{ color: 'inherit' }}>Pauline Fathima</a>
          </span>
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        {'RESERVE'.split('').map((ch, i) => <span key={i}>{ch}</span>)}
      </div>
    </footer>
  );
}
