import { useRef, useState } from 'react';
import { gsap, useGSAP } from '../lib/gsap';

/** Preloader — counting loader with wordmark mask reveal and panel wipe exit. */
export default function Preloader({ onDone }: { onDone: () => void }) {
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
