import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { useMaskedReveal } from '../lib/anim';

/** Bank glyph — Standard's tower mark. */
export const BankGlyph = (props: React.SVGProps<SVGSVGElement>) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" {...props}>
    <g fill="currentColor">
      <path d="M11.4 2 9.9 4.2 V14.6 H8.9 V17.2 H7.8 V20 H11.4 Z" />
      <path d="M12.6 2.9 14.1 5.0 V15.0 H15.1 V17.5 H16.2 V20 H12.6 Z" />
      <path d="M11.4 8.9 H12.6 V9.3 H11.4 Z" />
    </g>
  </svg>
);

/** Charters — about-page artifact: corner-borders card with branch grid. */
export default function Charters() {
  const ref = useRef<HTMLElement>(null);
  useMaskedReveal(ref);

  useGSAP(() => {
    gsap.from('.charter-card', {
      opacity: 0, y: 44, duration: .9, ease: 'power3.out',
      scrollTrigger: { trigger: '.charter-card', start: 'top 78%', once: true },
    });
    // Slots fill one by one — the charter comes to life
    gsap.from('.charter-slot--filled', {
      opacity: 0, scale: .5, duration: .45, ease: 'back.out(2.2)', stagger: .11,
      scrollTrigger: { trigger: '.charter-grid', start: 'top 80%', once: true },
    });
    gsap.from('.charter-stat', {
      opacity: 0, y: 20, duration: .7, stagger: .1, ease: 'power2.out',
      scrollTrigger: { trigger: '.charter-stats', start: 'top 88%', once: true },
    });
  }, { scope: ref });

  return (
    <section id="charters" ref={ref}>
      <div className="charters-inner">
        <div className="charters-copy">
          <span className="charters-kicker">Charters</span>
          <h2 className="charters-heading" data-split>
            It all begins with <em className="hl">charters</em>.
          </h2>
          <p className="charters-body" data-split>
            A bank charter is a soulbound NFT — a license to run your own bank
            and receive RSV issuance. The genesis issue is 1,000 Founding
            Charters. Afterwards, new charters are auctioned in ETH at a pace
            set by monetary policy.
          </p>
          <p className="charters-body" data-split>
            Bankers grow by buying expansion licenses for new branches. The
            licenses are paid in RSV — and fully burned. New charters change
            who splits the pie. Never the size of it.
          </p>
          <div className="charter-stats">
            <div className="charter-stat">
              <p className="charter-stat-num">1,000</p>
              <p className="charter-stat-label">Founding Charters</p>
            </div>
            <div className="charter-stat">
              <p className="charter-stat-num">09.14</p>
              <p className="charter-stat-label">The Genesis Mint</p>
            </div>
            <div className="charter-stat">
              <p className="charter-stat-num">0</p>
              <p className="charter-stat-label">Vesting, unlocks, or insider allocation</p>
            </div>
          </div>
        </div>

        <div className="charter-card corner-borders">
          <div className="charter-head">
            <span>Bank charter № 0042</span>
            <span className="charter-count">7 / 10 branches</span>
          </div>
          <div className="charter-grid">
            {Array.from({ length: 7 }).map((_, i) => (
              <div className="charter-slot charter-slot--filled" key={i}><BankGlyph /></div>
            ))}
            {['08', '09', '10'].map((n) => (
              <div className="charter-slot charter-slot--empty" key={n}>{n}</div>
            ))}
          </div>
          <p className="charter-foot">
            Each branch is won through a dutch auction and paid in RSV that is fully burned.
          </p>
        </div>
      </div>
    </section>
  );
}
