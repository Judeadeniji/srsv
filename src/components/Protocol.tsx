import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { useMaskedReveal } from '../lib/anim';

/** Protocol — primitive operations grid with hover-spin glyphs. */
export default function Protocol() {
  const ref = useRef<HTMLElement>(null);
  useMaskedReveal(ref);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('.protocol-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 48, duration: .85, delay: (i % 3) * .08, ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', once: true },
      });
    });

    // Icon spin on hover
    gsap.utils.toArray<HTMLElement>('.protocol-card').forEach((card) => {
      const icon = card.querySelector('.card-icon-wrap');
      card.addEventListener('mouseenter', () => {
        gsap.fromTo(icon, { rotate: 0 }, { rotate: 90, duration: .5, ease: 'back.out(1.6)' });
      });
    });
  }, { scope: ref });

  const cards = [
    { num: '001', icon: '◯', title: 'Single Invariant',   body: 'One currency, one market, one signal. Every mechanism in the economy flows from net ETH flow through the canonical pool.' },
    { num: '002', icon: '⊞', title: 'Hard Reserve',       body: 'In expansion, trading fees route to the expansion vault — buying tokenized gold and deepening protocol-owned liquidity.' },
    { num: '003', icon: '↔', title: 'Supply Elasticity',  body: 'Issuance loosens on inflow and tightens on outflow. The money supply breathes with the capital that backs it.' },
    { num: '004', icon: '◻', title: 'Full Burn Economy',  body: 'Expansion licenses and charters are paid in $STANDARD and fully burned. Spending removes supply — permanently.' },
    { num: '005', icon: '⌀', title: 'Zero Governance',    body: 'No governance token. No DAO vote. Parameters are set at genesis and enforced by code the bank cannot disobey.' },
    { num: '006', icon: '⬡', title: 'Inverted Bank Run',  body: 'Withdrawals mint supply, but the resolution fee burns half and pays the rest to the bankers who stayed. Sprinters fund the still.' },
  ];

  return (
    <section id="protocol" ref={ref}>
      <div className="protocol-inner">
        <div className="protocol-header">
          <h2 className="protocol-heading" data-split>
            Protocol<br />
            Primitives.
          </h2>
          <p className="protocol-desc" data-split>
            The architecture of Standard Reserve is defined by a small number of
            primitive operations. Each one is necessary. None is optional.
            Together they enforce the invariant without human intervention.
          </p>
        </div>
        <div className="protocol-cards">
          {cards.map((c, i) => (
            <div className="protocol-card" key={i} data-cursor="">
              <span className="card-num">{c.num}</span>
              <div className="card-icon-wrap">{c.icon}</div>
              <h4 className="card-title">{c.title}</h4>
              <p className="card-body">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
