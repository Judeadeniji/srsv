import { useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap';
import { useMaskedReveal } from '../lib/anim';

// ─── Figure data ──────────────────────────────────────────────────────────────
const seeded = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// Chart 1 — net flow per epoch (§4): diverging bars around the zero line
const NETFLOW = [+62, -38, +85, -20, +30, -95, +45, -60, +12, -75, +90, -28, +55, -42];

// Chart 2 — policy multiplier steps (§5): m reacts to the signal, two-epoch memory
const MULTIPLIER = [0.25, 0.5, 0.5, 0.75, 1, 1, 1.5, 1.75, 2, 1.5, 1, 0.75];
const stepPath = (() => {
  const x0 = 40, x1 = 680, y = (m: number) => 260 - m * 110;
  const dx = (x1 - x0) / (MULTIPLIER.length - 1);
  let d = `M ${x0} ${y(MULTIPLIER[0])}`;
  MULTIPLIER.forEach((m, i) => {
    if (i === 0) return;
    const cx = x0 + i * dx;
    d += ` H ${cx} V ${y(m)}`;
  });
  return d;
})();

// Chart 3 — price defense (§1): the peg oscillates around $1.00
const pricePath = (() => {
  const rnd = seeded(42);
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = 40 + t * 640;
    const p = 1 + 0.055 * Math.sin(t * 9.4) + 0.022 * Math.sin(t * 27 + 1.7) + (rnd() - .5) * 0.014;
    const y = 150 - (p - 1) * 1050;
    pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
})();

/** Charts — whitepaper figures as scroll-drawn SVG plates. */
export default function Charts() {
  const ref = useRef<HTMLElement>(null);
  useMaskedReveal(ref);

  useGSAP(() => {
    gsap.utils.toArray<HTMLElement>('.chart-block').forEach((block) => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: block, start: 'top 80%', end: 'top 22%', scrub: .6 },
      });

      // Diverging bars grow from the zero line
      block.querySelectorAll<SVGRectElement>('.chart-bar').forEach((bar, i) => {
        const v = parseFloat(bar.dataset.v ?? '0');
        const base = parseFloat(bar.dataset.base ?? '150');
        const h = Math.abs(v);
        tl.fromTo(bar,
          { attr: { height: 0, y: base } },
          { attr: { height: h, y: v > 0 ? base - h : base }, ease: 'none', duration: .8 },
          i * .05);
      });

      // Lines draw themselves
      block.querySelectorAll<SVGPathElement>('path[data-draw]').forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        tl.to(p, { strokeDashoffset: 0, ease: 'none', duration: 1.6 }, 0);
      });

      // Dot traces the price path
      const dot = block.querySelector<SVGCircleElement>('.chart-dot');
      const trace = block.querySelector<SVGPathElement>('path[data-trace]');
      if (dot && trace) {
        const len = trace.getTotalLength();
        const prog = { t: 0 };
        tl.to(prog, {
          t: 1, ease: 'none', duration: 1.6,
          onUpdate: () => {
            const pt = trace.getPointAtLength(prog.t * len);
            gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } });
          },
        }, 0);
      }

      // Axis labels + legends settle in
      tl.from(block.querySelectorAll('.chart-fade'), { opacity: 0, y: 8, stagger: .04, duration: .4 }, 0);
    });
  }, { scope: ref });

  return (
    <section id="charts" ref={ref}>
      <div className="charts-inner">
        <div className="charts-head">
          <div>
            <span className="charts-kicker chart-fade">The Mechanics</span>
            <h2 className="charts-heading" data-split>One signal.<br />One lever.</h2>
          </div>
          <p className="charts-desc" data-split>
            Every figure below is computed from the protocol's own rules — the
            same functions the contracts run. Nothing discretionary. Nothing
            hidden.
          </p>
        </div>

        {/* ── Fig. 1 — The net flow signal ── */}
        <div className="chart-block">
          <div className="chart-meta">
            <span className="chart-num chart-fade">Fig. 01 — §4</span>
            <h3 className="chart-title chart-fade">The net flow signal</h3>
            <p className="chart-note chart-fade">
              Gross ETH in minus gross ETH out, per epoch. The policy signal
              sums the trailing two — one manipulated hour cannot swing the rate.
            </p>
            <div className="chart-legend chart-fade">
              <span className="legend-key"><i className="key-solid" /> ETH in</span>
              <span className="legend-key"><i className="key-outline" /> ETH out</span>
            </div>
          </div>
          <figure className="chart-fig">
            <svg viewBox="0 0 720 300" role="img" aria-label="Diverging bar chart of net ETH flow per epoch">
              <line className="chart-zero" x1="40" y1="150" x2="680" y2="150" />
              <line className="chart-grid" x1="40" y1="40" x2="680" y2="40" />
              <line className="chart-grid" x1="40" y1="260" x2="680" y2="260" />
              {NETFLOW.map((v, i) => {
                const slot = (640 / NETFLOW.length);
                const x = 40 + i * slot + slot * 0.24;
                return (
                  <rect
                    key={i}
                    className={`chart-bar ${v > 0 ? 'chart-bar-in' : 'chart-bar-out'}`}
                    x={x}
                    width={slot * 0.52}
                    data-v={v}
                    data-base={150}
                  />
                );
              })}
              <text className="chart-axis chart-fade" x="40" y="26">+ ETH in</text>
              <text className="chart-axis chart-fade" x="40" y="284">− ETH out</text>
              <text className="chart-axis chart-fade" x="680" y="144" textAnchor="end">epoch n →</text>
            </svg>
            <figcaption className="chart-caption chart-fade">
              F<sub>n</sub> = bought − sold · signal<sub>n</sub> = F<sub>n−1</sub> + F<sub>n−2</sub>
            </figcaption>
          </figure>
        </div>

        {/* ── Fig. 2 — The multiplier ── */}
        <div className="chart-block">
          <div className="chart-meta">
            <span className="chart-num chart-fade">Fig. 02 — §5</span>
            <h3 className="chart-title chart-fade">The policy multiplier</h3>
            <p className="chart-note chart-fade">
              Issuance runs at a base rate scaled by m. Inflow loosens, outflow
              tightens — a slow lever with two-epoch memory, stepped by code.
            </p>
          </div>
          <figure className="chart-fig">
            <svg viewBox="0 0 720 300" role="img" aria-label="Step chart of the policy multiplier m over epochs">
              <line className="chart-grid" x1="40" y1="40" x2="680" y2="40" />
              <line className="chart-grid" x1="40" y1="260" x2="680" y2="260" />
              <line className="chart-target" x1="40" y1="150" x2="680" y2="150" />
              <path className="chart-line chart-line-accent" d={stepPath} data-draw />
              {MULTIPLIER.map((m, i) => (
                <circle key={i} className="chart-pip chart-fade" cx={40 + i * (640 / (MULTIPLIER.length - 1))} cy={260 - m * 110} r="3" />
              ))}
              <text className="chart-axis chart-fade" x="40" y="26">expand · m 2.0</text>
              <text className="chart-axis chart-fade" x="40" y="284">contract · m 0.25</text>
              <text className="chart-axis chart-fade" x="672" y="144" textAnchor="end">neutral m = 1</text>
            </svg>
            <figcaption className="chart-caption chart-fade">
              I<sub>n</sub> = base rate × d × m<sub>n</sub> — streamed second by second, pro rata to branches
            </figcaption>
          </figure>
        </div>

        {/* ── Fig. 3 — The defense ── */}
        <div className="chart-block">
          <div className="chart-meta">
            <span className="chart-num chart-fade">Fig. 03 — §1</span>
            <h3 className="chart-title chart-fade">The defense of the peg</h3>
            <p className="chart-note chart-fade">
              Above target, supply expands and reserves stack. Below target,
              buybacks burn supply. The mechanism is the market itself.
            </p>
            <div className="chart-legend chart-fade">
              <span className="legend-key"><i className="key-band" /> expansion</span>
              <span className="legend-key"><i className="key-band key-band-b" /> contraction</span>
            </div>
          </div>
          <figure className="chart-fig">
            <svg viewBox="0 0 720 300" role="img" aria-label="Price line oscillating around the one dollar target">
              <rect className="chart-band" x="40" y="30" width="640" height="120" />
              <rect className="chart-band chart-band-b" x="40" y="150" width="640" height="120" />
              <line className="chart-target" x1="40" y1="150" x2="680" y2="150" />
              <path className="chart-line" d={pricePath} data-draw data-trace />
              <circle className="chart-dot" cx="40" cy="150" r="5" />
              <text className="chart-axis chart-fade" x="40" y="26">expansion · supply minted</text>
              <text className="chart-axis chart-fade" x="40" y="284">contraction · supply burned</text>
              <text className="chart-axis chart-fade" x="672" y="144" textAnchor="end">target $1.00</text>
            </svg>
            <figcaption className="chart-caption chart-fade">
              Every path through the economy either burns RSV or brings the bank hard assets
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
