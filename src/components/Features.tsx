import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';

/** Features — pinned horizontal scroll of protocol capability panels. */
export default function Features() {
  const outerRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef  = useRef<HTMLDivElement>(null);
  const stRef     = useRef<ScrollTrigger | null>(null);

  useLayoutEffect(() => {
    const outer  = outerRef.current!;
    const sticky = stickyRef.current!;
    const track  = trackRef.current!;

    const init = () => {
      const scrollDist = track.scrollWidth - window.innerWidth;
      outer.style.height = `${window.innerHeight + scrollDist}px`;

      if (stRef.current) stRef.current.kill();

      const tween = gsap.to(track, {
        x: () => -scrollDist,
        ease: 'none',
        scrollTrigger: {
          id: 'features-hscroll',
          trigger: outer,
          start: 'top top',
          end: `+=${scrollDist}`,
          scrub: 1,
          pin: sticky,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // ── Panel text reveals ──────────────────────────────────────────────
      // Deterministic: driven by the main scrub's progress instead of
      // containerAnimation triggers (which mis-fire for the first panel).
      const panels = gsap.utils.toArray<HTMLElement>('.feature-panel');
      const texts  = panels.map(p => Array.from(p.querySelectorAll('.feature-text > *')));
      const revealed = new Set<number>();

      texts.forEach(children => gsap.set(children, { opacity: 0, y: 26 }));

      const reveal = (i: number) => {
        if (i < 0 || i >= panels.length || revealed.has(i)) return;
        revealed.add(i);
        gsap.to(texts[i], {
          opacity: 1, y: 0, stagger: .09, duration: .75,
          ease: 'power3.out', overwrite: 'auto',
        });
      };

      // First panel: reveal when the section arrives
      const arrival = ScrollTrigger.create({
        trigger: outer,
        start: 'top 70%',
        onEnter:     () => reveal(0),
        onEnterBack: () => reveal(0),
      });

      // Later panels: reveal as the horizontal scrub passes each one
      const progress = ScrollTrigger.create({
        trigger: outer,
        start: 'top top',
        end: `+=${scrollDist}`,
        onUpdate: (self) => {
          // Panel i has entered once the track has traveled ~55% of the
          // way to it — text reveals while the panel slides in.
          const entered = self.progress * (panels.length - 1) + 0.45;
          for (let i = 0; i < panels.length; i++) {
            if (i <= entered) reveal(i);
          }
        },
      });

      // Per-panel parallax: visuals drift slower than text as the track moves
      gsap.utils.toArray<HTMLElement>('.feature-visual').forEach((visual) => {
        gsap.fromTo(visual,
          { x: 80 },
          {
            x: -80,
            ease: 'none',
            scrollTrigger: {
              trigger: visual,
              containerAnimation: tween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          });
      });

      return { tween, arrival, progress };
    };

    const ctx = init();
    const onResize = () => {
      ctx.tween.kill();
      ctx.arrival.kill();
      ctx.progress.kill();
      ScrollTrigger.getById('features-hscroll')?.kill();
      init();
    };
    window.addEventListener('resize', onResize);

    return () => {
      ctx.tween.kill();
      ctx.arrival.kill();
      ctx.progress.kill();
      ScrollTrigger.getById('features-hscroll')?.kill();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const features = [
    {
      tag: 'Monetary Policy',
      title: 'Automated Stability Engine',
      body: 'Issuance runs at a base rate scaled by the policy multiplier m. Capital flowing in loosens it; capital flowing out tightens it. Fully mechanical. No committee. No delay.',
      glyph: '≡',
    },
    {
      tag: 'Charter System',
      title: 'Onchain Bank Charters',
      body: 'Charters are soulbound licenses to operate a bank and receive $STANDARD issuance. New charters are auctioned in ETH, at a pace set by monetary policy.',
      glyph: '⊕',
    },
    {
      tag: 'Architecture',
      title: 'Sovereign Network State',
      body: 'Standard operates as a sovereign monetary system — not subject to governance, political actors, or human consensus. The bank is code, and code has no board.',
      glyph: '◈',
    },
    {
      tag: 'Transparency',
      title: 'Live Protocol Dashboard',
      body: 'Every mint, burn, auction, and fee route is observable onchain in real time. The bank cannot hide anything — it is code, and code is public.',
      glyph: '↯',
    },
  ];

  return (
    <div id="features" ref={outerRef}>
      <div className="features-sticky" ref={stickyRef}>
        <div className="features-track" ref={trackRef}>
          {features.map((f, i) => (
            <div className="feature-panel" key={i}>
              <div className="feature-text">
                <span className="feature-index">0{i + 1} / 0{features.length}</span>
                <span className="feature-tag">{f.tag}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-body">{f.body}</p>
                <a href="https://www.standardreserve.xyz/app/" className="feature-link" target="_blank" rel="noopener">
                  <span className="ml-text">Explore</span>
                  <span className="ml-arrow">↗</span>
                </a>
              </div>
              <div className="feature-visual">
                <div className="feature-visual-inner">
                  <div className="feature-ring" />
                  <div className="feature-ring" />
                  <div className="feature-ring" />
                  <span className="feature-icon-glyph">{f.glyph}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
