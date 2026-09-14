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
    { num: '001', icon: '◯', title: 'Single Invariant',   body: 'The protocol has one job: keep RSV equal to $1.00. Every mechanism flows from this single invariant.' },
    { num: '002', icon: '⊞', title: 'Collateral System',  body: 'Approved banks hold qualified collateral. The protocol enforces collateral ratios mechanically and continuously.' },
    { num: '003', icon: '↔', title: 'Supply Elasticity',  body: 'RSV supply expands and contracts based on price signal alone. No human triggers. Always-on monetary policy.' },
    { num: '004', icon: '◻', title: 'Charter Framework',  body: 'Banks earn the right to mint RSV through an onchain charter defining limits, obligations, and revocation conditions.' },
    { num: '005', icon: '⌀', title: 'Zero Governance',    body: 'There is no governance token. No DAO vote can change protocol rules. Parameters are set at genesis.' },
    { num: '006', icon: '⬡', title: 'Transparency Layer', body: 'All operations are observable onchain. Minting events, charter states, reserve positions — fully public, always.' },
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
