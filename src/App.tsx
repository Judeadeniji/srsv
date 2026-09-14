import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { initScroll, lockScroll, unlockScroll, scrollToTarget, scrollTop } from './lib/scroll';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, ScrollToPlugin);

// ─── Frame data ──────────────────────────────────────────────────────────────
const frameModules = import.meta.glob(
  './assets/video_frames/frame_*.jpg',
  { eager: true, import: 'default' }
) as Record<string, string>;
const frameUrls = Object.keys(frameModules).sort().map(k => frameModules[k]);

// ─── Preloader ────────────────────────────────────────────────────────────────
function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef  = useRef<HTMLDivElement>(null);
  const numRef   = useRef<HTMLSpanElement>(null);
  const barRef   = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(() => {
    const counter = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => setGone(true),
    });

    tl.to(counter, {
        v: 100,
        duration: 2.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = `${Math.round(counter.v)}`;
          if (barRef.current) barRef.current.style.transform = `scaleX(${counter.v / 100})`;
        },
      })
      // wordmark mask reveal
      .from('.pl-word span', { yPercent: 110, duration: .9, stagger: .045, ease: 'power3.out' }, 0)
      .from('.pl-meta', { opacity: 0, y: 12, duration: .6, ease: 'power2.out' }, .4)
      // exit: panels slide up + wordmark lifts away
      .to('.pl-word span', { yPercent: -110, duration: .7, stagger: .04, ease: 'power3.in' }, '+=.25')
      .to('.pl-meta, .pl-count', { opacity: 0, y: -10, duration: .4, ease: 'power2.in' }, '<')
      .to('.pl-panel', {
        yPercent: -100,
        duration: .9,
        stagger: .07,
        ease: 'power4.inOut',
        onComplete: onDone,
      }, '-=.2')
      .to(rootRef.current, { autoAlpha: 0, duration: .01 }, '>');

    return () => { tl.kill(); };
  }, { scope: rootRef });

  if (gone) return null;

  return (
    <div className="preloader" ref={rootRef}>
      <div className="pl-panels">
        <div className="pl-panel" />
        <div className="pl-panel" />
        <div className="pl-panel" />
        <div className="pl-panel" />
        <div className="pl-panel" />
      </div>
      <div className="pl-content">
        <div className="pl-word">
          {'STANDARD RESERVE'.split('').map((ch, i) => (
            <span key={i} className="pl-ch">{ch === ' ' ? '\u00A0' : ch}</span>
          ))}
        </div>
        <div className="pl-row">
          <span className="pl-meta">Sovereign Onchain Central Bank</span>
          <span className="pl-count">
            <span ref={numRef}>0</span>%
          </span>
        </div>
        <div className="pl-bar"><div className="pl-bar-fill" ref={barRef} /></div>
      </div>
    </div>
  );
}

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
function Magnetic({ children, strength = 0.35 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;

    const xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { xTo(0); yTo(0); };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return <span className="magnetic" ref={ref}>{children}</span>;
}

// ─── Custom Cursor ────────────────────────────────────────────────────────────
function Cursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const mouse   = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const ring    = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [label, setLabel] = useState('');

  useEffect(() => {
    const dot    = dotRef.current!;
    const ringEl = ringRef.current!;
    let rafId: number;

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      gsap.set(dot, { x: e.clientX, y: e.clientY });
    };

    const tick = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12;
      gsap.set(ringEl, { x: ring.current.x, y: ring.current.y });
      rafId = requestAnimationFrame(tick);
    };

    const onEnter = (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-cursor]');
      const text = t?.getAttribute('data-cursor') ?? '';
      setLabel(text);
      gsap.to(ringEl, {
        width: text ? 84 : 60,
        height: text ? 84 : 60,
        borderColor: 'transparent',
        backgroundColor: 'rgba(26,26,24,.92)',
        duration: .25,
      });
      gsap.to(dot, { opacity: 0, duration: .2 });
      if (text && labelRef.current) {
        gsap.fromTo(labelRef.current,
          { opacity: 0, scale: .6 },
          { opacity: 1, scale: 1, duration: .3, ease: 'back.out(2)' });
      }
    };
    const onLeave = () => {
      setLabel('');
      gsap.to(ringEl, {
        width: 36, height: 36,
        borderColor: 'currentColor',
        backgroundColor: 'transparent',
        duration: .25,
      });
      gsap.to(dot, { opacity: 1, duration: .2 });
    };

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, [data-cursor]').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    rafId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot"  ref={dotRef} />
      <div id="cursor-ring" ref={ringRef}>
        <span className="cursor-label" ref={labelRef}>{label}</span>
      </div>
    </>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const hidden = useRef(false);

  useGSAP(() => {
    gsap.to('#nav .nav-item', { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out', delay: .3 });

    // Hide on scroll down, show on scroll up
    ScrollTrigger.create({
      start: 'top top-=10',
      onUpdate: (self) => {
        if (self.direction === 1 && self.scroll() > 120 && !hidden.current) {
          hidden.current = true;
          gsap.to(navRef.current, { yPercent: -110, duration: .5, ease: 'power3.out' });
        } else if (self.direction === -1 && hidden.current) {
          hidden.current = false;
          gsap.to(navRef.current, { yPercent: 0, duration: .5, ease: 'power3.out' });
        }
      },
    });
  }, { scope: navRef });

  return (
    <nav id="nav" ref={navRef}>
      <a href="/" className="nav-logo nav-item" onClick={(e) => { e.preventDefault(); scrollTop(); }}>
        <div className="nav-logo-mark" />
        Standard Reserve
      </a>
      <div className="nav-links nav-item">
        <a href="#manifesto" onClick={(e) => { e.preventDefault(); scrollToTarget('#manifesto'); }}>Protocol</a>
        <a href="#features" onClick={(e) => { e.preventDefault(); scrollToTarget('#features'); }}>Architecture</a>
        <a href="#final-cta" onClick={(e) => { e.preventDefault(); scrollToTarget('#final-cta'); }}>Network</a>
      </div>
      <Magnetic>
        <a href="https://www.standardreserve.xyz/app/" className="nav-cta-btn nav-item" target="_blank" rel="noopener">
          Launch App <span className="arr">↗</span>
        </a>
      </Magnetic>
    </nav>
  );
}

// ─── Rotating seal ────────────────────────────────────────────────────────────
function Seal() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="seal" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="seal-svg">
        <defs>
          <path id="seal-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="seal-text">
          <textPath href="#seal-circle">
            STANDARD RESERVE · SOVEREIGN · ONCHAIN · RSV ·
          </textPath>
        </text>
      </svg>
      <span className="seal-mark">◆</span>
    </div>
  );
}

// ─── HeroScrub — unified hero + scroll-scrub (one section, no duplicate) ──────
function HeroScrub() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
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

    const draw = (f: number) => {
      const idx = Math.min(Math.round(f), total - 1);
      const img = images[idx];
      if (img?.complete && img.naturalWidth) {
        if (!canvas.width) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    };

    // Draw first frame immediately so canvas isn't blank
    images[0].onload = () => {
      canvas.width  = images[0].naturalWidth;
      canvas.height = images[0].naturalHeight;
      draw(0);
    };
    if (images[0].complete && images[0].naturalWidth) {
      canvas.width  = images[0].naturalWidth;
      canvas.height = images[0].naturalHeight;
      draw(0);
    }

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
    };
  }, []);

  // ── Entrance + parallax on the frame canvas ─────────────────────────────
  useGSAP(() => {
    gsap.set('.hs-eyebrow',   { opacity: 0, y: 16 });
    gsap.set('.hs-title-word span', { yPercent: 108 });
    gsap.set('.hs-sub',       { opacity: 0, y: 20 });
    gsap.set('.hs-scroll-hint', { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: .35 });
    tl.to('.hs-eyebrow',         { opacity: 1, y: 0, duration: .9 }, 0)
      .to('.hs-title-word span', { yPercent: 0, stagger: .13, duration: 1.1 }, .2)
      .to('.hs-sub',             { opacity: 1, y: 0, duration: .9 }, .6)
      .to('.hs-scroll-hint',     { opacity: 1, duration: .8 }, 1.4);

    // Parallax: canvas drifts up slightly while the hero scrubs
    // (scale keeps the fixed layer covered at every offset)
    gsap.to('.hs-canvas', {
      yPercent: -5,
      scale: 1.12,
      ease: 'none',
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      },
    });

    // Fade the hero HUD out as the content curtain slides over the canvas
    gsap.to(
      [heroTextRef.current, '.hs-scroll-hint', '.scrub-counter', '.scrub-progress-bar', '.hs-seal-wrap'],
      {
        opacity: 0,
        y: -40,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'bottom 85%',
          end: 'bottom 45%',
          scrub: true,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <div id="hero-scrub" ref={sectionRef}>
      <div className="hs-canvas-wrap">
        <canvas ref={canvasRef} className="hs-canvas" />
        <div className="hs-canvas-fade" />
      </div>

      <div className="hs-text" ref={heroTextRef}>
        <span className="hs-eyebrow">The Standard Reserve</span>
        <h1 className="hs-title">
          <div className="hs-title-word"><span>Sovereign</span></div>
          <div className="hs-title-word"><span>Onchain</span></div>
          <div className="hs-title-word"><span><em>Central</em></span></div>
          <div className="hs-title-word"><span>Bank.</span></div>
        </h1>
        <div className="hs-sub">
          <p className="hs-tagline">
            Tracks one number. Defends its own currency.<br />
            Answers to no one.
          </p>
          <div className="hs-cta-group">
            <Magnetic>
              <a href="https://www.standardreserve.xyz/app/" className="hero-cta" target="_blank" rel="noopener">
                Launch App ↗
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#manifesto" className="hero-cta-ghost" onClick={(e) => { e.preventDefault(); scrollToTarget('#manifesto'); }}>
                Learn More
              </a>
            </Magnetic>
          </div>
        </div>
      </div>

      <div className="hs-scroll-hint">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>

      <div className="scrub-progress-bar" ref={progressRef} />
      <div className="scrub-counter">
        <span ref={counterRef}>000</span>%
      </div>

      <div className="hs-seal-wrap"><Seal /></div>
    </div>
  );
}

// ─── Reveal helper: SplitText masked lines ────────────────────────────────────
function useMaskedReveal(scope: React.RefObject<HTMLElement | null>) {
  return useGSAP(() => {
    const splits: SplitText[] = [];
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
      splits.push(split);
      gsap.from(split.lines, {
        yPercent: 115,
        duration: 1.1,
        stagger: .09,
        ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
    return () => splits.forEach(s => s.revert());
  }, { scope });
}

// ─── Manifesto ────────────────────────────────────────────────────────────────
function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  useMaskedReveal(ref);

  useGSAP(() => {
    gsap.from('.manifesto-overline', {
      opacity: 0, y: 24, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '.manifesto-overline', start: 'top 85%', once: true },
    });
    gsap.from('.manifesto-link', {
      opacity: 0, y: 20, duration: .8, ease: 'power3.out',
      scrollTrigger: { trigger: '.manifesto-link', start: 'top 90%', once: true },
    });
  }, { scope: ref });

  return (
    <section id="manifesto" ref={ref}>
      <div className="manifesto-inner">
        <div className="manifesto-left">
          <span className="manifesto-overline">The Protocol</span>
          <p className="manifesto-statement" data-split>
            A sovereign monetary<br />
            system with a single<br />
            <em>invariant objective.</em>
          </p>
        </div>
        <div className="manifesto-right">
          <p className="manifesto-body" data-split>
            Standard Reserve is not a stablecoin. It is not a DAO. It is a
            fully autonomous onchain central bank — governed only by the rules
            encoded in its protocol. It tracks one number: the price of RSV.
            It expands and contracts supply to defend that price. No exceptions.
            No governance theatre. No human override.
          </p>
          <a href="https://www.standardreserve.xyz/app/" className="manifesto-link" target="_blank" rel="noopener">
            <span className="ml-text">Explore the protocol</span>
            <span className="ml-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
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

// ─── Marquee — CSS scroll + GSAP velocity boost ───────────────────────────────
function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const track = trackRef.current!;
    const tween = gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      duration: 28,
      repeat: -1,
    });

    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 900, 5);
        gsap.to(tween, {
          timeScale: 1 + v,
          duration: .3,
          overwrite: true,
        });
        gsap.to(track, {
          skewX: gsap.utils.clamp(-6, 6, self.getVelocity() / -350),
          duration: .4,
          overwrite: 'auto',
        });
      },
    });

    // Ease back to normal after scroll stops
    let lastScroll = 0;
    ScrollTrigger.create({
      onUpdate: () => { lastScroll = Date.now(); },
    });
    const settle = setInterval(() => {
      if (Date.now() - lastScroll > 250) {
        gsap.to(tween, { timeScale: 1, duration: .8, overwrite: true });
        gsap.to(track, { skewX: 0, duration: .6, overwrite: 'auto' });
      }
    }, 300);

    return () => { tween.kill(); clearInterval(settle); };
  }, { scope: trackRef });

  const items = [
    'Bank Charters', 'Minting', 'Protocol Operations', 'Live Network State',
    'Autonomous', 'One Price', 'Onchain', 'Sovereign', 'RSV', 'Trustless',
  ];

  return (
    <div id="marquee-section">
      <div className="marquee-track" ref={trackRef} aria-hidden="true">
        {[...items, ...items].map((item, i) => (
          <span key={i} className={`marquee-item${i % 5 === 0 ? ' hi' : ''}`}>
            {item} <span className="dot" />
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Features — horizontal scroll ─────────────────────────────────────────────
function Features() {
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

// ─── Charts — whitepaper figures, drawn on scroll ─────────────────────────────
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
    const px = x0 + (i - 1) * dx;
    const cx = x0 + i * dx;
    d += ` H ${cx} V ${y(m)}`;
    void px;
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

function Charts() {
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

// ─── Protocol Cards ───────────────────────────────────────────────────────────
function Protocol() {
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

// ─── Final CTA — theme flips to dark while pinned ─────────────────────────────
function FinalCTA() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(() => {
    ['.live-badge', '.final-heading', '.final-sub', '.btn-group'].forEach((sel, i) => {
      gsap.from(sel, {
        opacity: 0, y: 44 - i * 5, duration: .9 + i * .06, ease: 'power3.out',
        scrollTrigger: { trigger: sel, start: 'top 85%', once: true },
      });
    });

    // Flip to dark theme as the finale pins
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top 55%',
      end: 'bottom 60%',
      onEnter:     () => document.documentElement.setAttribute('data-color-mode', 'dark'),
      onEnterBack: () => document.documentElement.setAttribute('data-color-mode', 'dark'),
      onLeaveBack: () => document.documentElement.setAttribute('data-color-mode', 'light'),
      onLeave:     () => document.documentElement.setAttribute('data-color-mode', 'dark'),
    });
  }, { scope: ref });

  return (
    <section id="final-cta" ref={ref}>
      <div className="final-cta-inner">
        <div className="live-badge">
          <div className="pulse" /> Live Network
        </div>
        <h2 className="final-heading">
          One rule.<br />
          <em>Enforced forever.</em>
        </h2>
        <p className="final-sub">
          The Standard Reserve is live. Bank charters are open.
          The protocol is running. There is no team to ask, no vote to wait for.
          The network state is available now.
        </p>
        <div className="btn-group">
          <Magnetic strength={0.45}>
            <a href="https://www.standardreserve.xyz/app/" className="btn-primary" target="_blank" rel="noopener">
              Launch App ↗
            </a>
          </Magnetic>
          <Magnetic strength={0.45}>
            <a href="https://x.com/standard_rsv" className="btn-outline" target="_blank" rel="noopener">
              Follow on X ↗
            </a>
          </Magnetic>
        </div>
      </div>
      <div className="final-orb" aria-hidden="true" />
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
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

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    initScroll();
    lockScroll();
    window.scrollTo(0, 0);
  }, []);

  const handlePreloaderDone = useCallback(() => {
    unlockScroll();
    ScrollTrigger.refresh();
  }, []);

  return (
    <>
      <Preloader onDone={handlePreloaderDone} />
      <Cursor />
      <Nav />
      <main>
        <HeroScrub />
        <Manifesto />
        <Stats />
        <Marquee />
        <Charts />
        <Features />
        <Protocol />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
