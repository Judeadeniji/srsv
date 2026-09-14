import { useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';

/** Custom cursor: trailing ring with optional data-cursor label + instant dot. */
export default function Cursor() {
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
