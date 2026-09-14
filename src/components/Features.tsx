import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { useMaskedReveal } from '../lib/anim';

/** Features — pinned horizontal scroll of protocol capability panels. */
export default function Features() {
  const outerRef  = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const trackRef  = useRef<HTMLDivElement>(null);
  const stRef     = useRef<ScrollTrigger | null>(null);
  useMaskedReveal(outerRef);

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

      return tween;
    };

    let tween = init();
    const onResize = () => {
      tween.kill();
      ScrollTrigger.getById('features-hscroll')?.kill();
      tween = init();
    };
    window.addEventListener('resize', onResize);

    return () => {
      tween.kill();
      ScrollTrigger.getById('features-hscroll')?.kill();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const features = [
    {
      tag: 'Monetary Policy',
      title: 'Automated Stability Engine',
      body: 'The protocol expands RSV supply when price rises above target, and contracts it when below. Fully mechanical. No committee. No delay.',
      glyph: '≡',
    },
    {
      tag: 'Charter System',
      title: 'Onchain Bank Charters',
      body: 'Entities can apply for bank charters — permission to mint RSV against approved collateral. Grants and revocations execute onchain.',
      glyph: '⊕',
    },
    {
      tag: 'Architecture',
      title: 'Sovereign Network State',
      body: 'Standard Reserve operates as a sovereign monetary system — not subject to governance, political actors, or human consensus.',
      glyph: '◈',
    },
    {
      tag: 'Transparency',
      title: 'Live Protocol Dashboard',
      body: 'Every operation is observable in real time. Watch minting events, charter state, and supply changes as they happen on the network.',
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
                <h3 className="feature-title" data-split>{f.title}</h3>
                <p className="feature-body" data-split>{f.body}</p>
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
