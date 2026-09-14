import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';

/** Stats — hairline grid with scramble-in values. */
export default function Stats() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('.stat-item').forEach((el, i) => {
      gsap.from(el, {
        opacity: 0, y: 30, duration: .8, delay: i * .08, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });

    // Scramble values into place
    gsap.utils.toArray<HTMLElement>('.stat-value').forEach((el) => {
      const final = el.dataset.value ?? '';
      gsap.to(el, {
        duration: 1.8,
        ease: 'power2.out',
        scrambleText: {
          text: final,
          chars: '01$∞≡⊕',
          speed: .8,
        },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  }, { scope: ref });

  const data = [
    { label: 'Target Price',  value: '$1',  sub: 'USD — always',        accent: false },
    { label: 'Governance',    value: '0',   sub: 'Human votes required', accent: true  },
    { label: 'Network State', value: '∞',   sub: 'Uptime commitment',    accent: false },
    { label: 'Rule Set',      value: '1',   sub: 'Invariant to defend',  accent: true  },
  ];

  return (
    <section id="stats" ref={ref}>
      <div className="stats-grid">
        {data.map((d, i) => (
          <div className="stat-item" key={i}>
            <span className="stat-label">{d.label}</span>
            <div
              className={`stat-value${d.accent ? ' stat-accent' : ''}`}
              data-value={d.value}
            >
              {d.value}
            </div>
            <div className="stat-sub">{d.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
