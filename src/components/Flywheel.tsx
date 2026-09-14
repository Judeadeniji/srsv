import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { useMaskedReveal } from '../lib/anim';

/** Flywheel — about-page artifact: four stations on one clockwise loop. */
export default function Flywheel() {
  const ref = useRef<HTMLElement>(null);
  useMaskedReveal(ref);

  useGSAP(() => {
    const arcs = gsap.utils.toArray<SVGPathElement>('.fw-ring');
    arcs.forEach((arc, i) => {
      const len = arc.getTotalLength();
      gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(arc, {
        strokeDashoffset: 0, duration: 1.1, delay: i * .16, ease: 'power2.inOut',
        scrollTrigger: { trigger: '.fw-diagram', start: 'top 72%', once: true },
      });
    });
    gsap.from('.fw-label', {
      opacity: 0, y: 10, duration: .7, stagger: .13, ease: 'power2.out',
      scrollTrigger: { trigger: '.fw-diagram', start: 'top 68%', once: true },
    });
    gsap.from('.fw-hub', {
      opacity: 0, duration: .9, delay: .8,
      scrollTrigger: { trigger: '.fw-diagram', start: 'top 68%', once: true },
    });
    // Orbiting dot traces the loop forever
    gsap.to('.fw-orbit-dot', {
      svgOrigin: '260 235', rotation: 360, duration: 14, ease: 'none', repeat: -1,
    });
  }, { scope: ref });

  const items = [
    { num: '01', title: 'Adoption',        body: 'Every new charter is paid in ETH. The treasury takes in hard assets that strengthen and defend $STANDARD.' },
    { num: '02', title: 'Expansion',       body: 'Licenses to expand banks permanently shrink the float. Emissions are met with burns to control runway inflation.' },
    { num: '03', title: 'Fees',            body: 'Every trade deepens protocol liquidity, stacks the hard reserve in surplus, and funds buybacks in deficit. Volume in either direction feeds the bank.' },
    { num: '04', title: 'Monetary policy', body: 'Policy is decided in real time. If capital leaves: the rate cuts, fees flip to buy-and-burn, and the exit fee adjusts. The system gets more defensive the worse it gets.' },
  ];

  return (
    <section id="flywheel" ref={ref}>
      <div className="fw-inner">
        <div className="fw-copy">
          <span className="charters-kicker">The Loop</span>
          <h2 className="charters-heading" data-split>The <em className="hl">flywheel</em>.</h2>
          <div className="fw-list">
            {items.map((it) => (
              <div className="fw-item" key={it.num}>
                <p className="fw-num">{it.num}</p>
                <div>
                  <p className="fw-title">{it.title}</p>
                  <p className="fw-body">{it.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <figure className="fw-diagram">
          <svg viewBox="0 40 520 400" role="img" aria-label="Four flywheels — adoption, expansion, fees, and monetary policy — drawn as stations on one clockwise loop">
            <defs>
              <marker id="fw-arr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto">
                <path d="M2 1.5 L8 5 L2 8.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            <path className="fw-ring" d="M 325.8 100.2 A 150 150 0 0 1 405.5 198.7" markerEnd="url(#fw-arr)" />
            <path className="fw-ring" d="M 405.5 271.3 A 150 150 0 0 1 325.8 369.8" markerEnd="url(#fw-arr)" />
            <path className="fw-ring" d="M 194.2 369.8 A 150 150 0 0 1 114.5 271.3" markerEnd="url(#fw-arr)" />
            <path className="fw-ring" d="M 114.5 198.7 A 150 150 0 0 1 194.2 100.2" markerEnd="url(#fw-arr)" />
            <circle className="fw-orbit-dot" cx="410" cy="235" r="4" />
            <g className="fw-label">
              <text className="fw-title-t" x="260" y="80" textAnchor="middle">ADOPTION</text>
              <text className="fw-sub-t" x="260" y="98" textAnchor="middle">charters · ETH in</text>
            </g>
            <g className="fw-label">
              <text className="fw-title-t" x="422" y="231" textAnchor="middle">EXPANSION</text>
              <text className="fw-sub-t" x="422" y="250" textAnchor="middle">licenses purchased</text>
            </g>
            <g className="fw-label">
              <text className="fw-title-t" x="260" y="382" textAnchor="middle">FEES</text>
              <text className="fw-sub-t" x="260" y="400" textAnchor="middle">reserves and buybacks</text>
            </g>
            <g className="fw-label">
              <text className="fw-title-t" x="98" y="222" textAnchor="middle">MONETARY</text>
              <text className="fw-title-t" x="98" y="239" textAnchor="middle">POLICY</text>
              <text className="fw-sub-t" x="98" y="259" textAnchor="middle">rate cuts and exit fees</text>
            </g>
            <g className="fw-hub">
              <text x="260" y="230" textAnchor="middle">HARD ASSETS IN</text>
              <text x="260" y="252" textAnchor="middle">SOFT SUPPLY OUT</text>
            </g>
          </svg>
        </figure>
      </div>
    </section>
  );
}
