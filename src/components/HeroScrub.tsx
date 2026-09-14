import { useLayoutEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { frameUrls } from '../lib/frames';
import Magnetic from './Magnetic';
import Seal from './Seal';

/**
 * HeroScrub — two acts:
 *   1. Cover: solid paper editorial plane that fades away as you scroll.
 *   2. Reveal: canvas frame-scrub plays full-bleed beneath; HUD fades in.
 * Following content slides over the fixed canvas like a curtain.
 */
export default function HeroScrub() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const coverRef    = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef  = useRef<HTMLSpanElement>(null);
  const tweenRef    = useRef<gsap.core.Tween | null>(null);

  // ── Load & scrub frames ──────────────────────────────────────────────────
  useLayoutEffect(() => {
    if (!frameUrls.length) return;

    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext('2d')!;
    const total  = frameUrls.length;
    const images: HTMLImageElement[] = [];

    for (let i = 0; i < total; i++) {
      const img = new Image();
      img.src = frameUrls[i];
      images.push(img);
    }

    // Render at DEVICE resolution with a cover-fit so the 1280x720 source is
    // resampled once by the browser's best filter — not stretched by CSS.
    let vw = 0, vh = 0;
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = Math.round(window.innerWidth * dpr);
      vh = Math.round(window.innerHeight * dpr);
      canvas.width = vw;
      canvas.height = vh;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    };
    fit();

    const drawCover = (img: HTMLImageElement) => {
      const iw = img.naturalWidth, ih = img.naturalHeight;
      if (!iw || !ih) return false;
      const s = Math.max(vw / iw, vh / ih);          // cover math
      const dw = iw * s, dh = ih * s;
      ctx.clearRect(0, 0, vw, vh);
      ctx.drawImage(img, (vw - dw) / 2, (vh - dh) / 2, dw, dh);
      return true;
    };

    const draw = (f: number) => {
      const idx = Math.min(Math.round(f), total - 1);
      const img = images[idx];
      if (img?.complete && img.naturalWidth) drawCover(img);
    };

    // Draw first frame immediately so canvas isn't blank
    images[0].onload = () => draw(0);
    draw(0);

    const onResize = () => { fit(); draw(state.f); };
    window.addEventListener('resize', onResize);

    const state = { f: 0 };
    tweenRef.current = gsap.to(state, {
      f: total - 1,
      ease: 'none',
      onUpdate: () => {
        draw(state.f);
        const pct = (state.f / (total - 1)) * 100;
        if (progressRef.current) progressRef.current.style.width = `${pct}%`;
        if (counterRef.current)  counterRef.current.textContent  = `${Math.round(pct).toString().padStart(3, '0')}`;
      },
      scrollTrigger: {
        // Canvas layer is position:fixed in CSS; this section is a tall
        // transparent spacer. Scrub across its full scrollable range.
        id: 'hero-scrub-st',
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
    });

    return () => {
      tweenRef.current?.kill();
      ScrollTrigger.getById('hero-scrub-st')?.kill();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // ── Entrance + cover exit + HUD reveal ───────────────────────────────────
  useGSAP(() => {
    gsap.set('.hs-eyebrow',   { opacity: 0, y: 16 });
    gsap.set('.hs-title-word span', { yPercent: 108 });
    gsap.set('.hs-statement', { opacity: 0, y: 14 });
    gsap.set('.hs-strip-cell', { opacity: 0, y: 14 });
    gsap.set('.hs-scroll-hint', { opacity: 0 });

    const contours = gsap.utils.toArray<SVGPathElement>('.hs-contours path');
    contours.forEach((p) => {
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .35 });
    tl.to('.hs-eyebrow',         { opacity: 1, y: 0, duration: .9 }, 0)
      .to('.hs-title-word span', { yPercent: 0, stagger: .13, duration: 1.1 }, .2)
      .to('.hs-statement',       { opacity: 1, y: 0, duration: .8 }, .9)
      .to(contours,              { strokeDashoffset: 0, duration: 2.2, stagger: .18, ease: 'power2.inOut' }, .5)
      .to('.hs-strip-cell',      { opacity: 1, y: 0, stagger: .07, duration: .8 }, 1.15)
      .to('.hs-scroll-hint',     { opacity: 1, duration: .8 }, 1.6);

    // Parallax: canvas drifts up slightly while the hero scrubs
    // (tiny 1.03 headroom only — overscale would resample past native res)
    gsap.to('.hs-canvas', {
      yPercent: -2.5,
      scale: 1.03,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    // Cover lifts: solid paper fades away, revealing the frame scrub beneath
    gsap.to(
      [coverRef.current, '.hs-contours', '.hs-scroll-hint'],
      {
        autoAlpha: 0,
        y: -60,
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=820',
          scrub: true,
        },
      }
    );

    // Scrub HUD (counter, progress, seal) surfaces as the cover lifts
    gsap.fromTo(
      ['.scrub-counter', '.scrub-progress-bar', '.hs-seal-wrap'],
      { opacity: 0 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=650',
          scrub: true,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <div id="hero-scrub" ref={sectionRef}>
      <div className="hs-canvas-wrap">
        <canvas ref={canvasRef} className="hs-canvas" />
        <div className="hs-canvas-scrim" />
        <div className="hs-canvas-fade" />
      </div>

      {/* Cover — solid paper plane that fades to reveal the frame scrub */}
      <div className="hs-cover" ref={coverRef}>
        <div className="hs-cover-grid">
          <div className="hs-text">
            <span className="hs-eyebrow">Standard Reserve — Est. {new Date().getFullYear()}</span>
            <h1 className="hs-title">
              <div className="hs-title-word"><span>The <em className="hl">sovereign</em></span></div>
              <div className="hs-title-word"><span><em className="hl">onchain</em> central bank.</span></div>
            </h1>
            <p className="hs-statement"><span className="hs-statement-dash" />The bank is code.</p>
          </div>
          <div className="hs-strip">
            <span className="hs-strip-cell">Currency — $STANDARD</span>
            <span className="hs-strip-cell">Charter № 001–1000</span>
            <span className="hs-strip-cell">The Genesis — 09.14</span>
            <span className="hs-strip-cta">
              <Magnetic>
                <a href="https://www.standardreserve.xyz/app/" className="hero-cta" target="_blank" rel="noopener">
                  Launch App ↗
                </a>
              </Magnetic>
              <Magnetic>
                <a href="https://www.standardreserve.xyz/whitepaper/" className="hero-cta-ghost" target="_blank" rel="noopener">
                  Whitepaper
                  <svg className="cta-arrow" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                  </svg>
                </a>
              </Magnetic>
            </span>
          </div>
        </div>

        <svg className="hs-contours" viewBox="0 0 400 500" aria-hidden="true">
          <path d="M-32 474 Q170 54 430 360" />
          <path d="M-42 505 Q174 92 438 392" />
          <path d="M-50 538 Q180 128 448 426" />
        </svg>

        <div className="hs-scroll-hint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </div>

      <div className="scrub-progress-bar" ref={progressRef} />
      <div className="scrub-counter">
        <span ref={counterRef}>000</span>%
      </div>

      <div className="hs-seal-wrap"><Seal /></div>
    </div>
  );
}
