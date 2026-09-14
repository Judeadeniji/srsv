import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Create the Lenis singleton and wire it into GSAP's ticker. */
export function initScroll(): Lenis {
  if (lenis) return lenis;

  lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

/** Stop page scrolling (used while the preloader runs). */
export function lockScroll() {
  lenis?.stop();
  document.documentElement.classList.add('no-scroll');
}

/** Resume page scrolling. */
export function unlockScroll() {
  lenis?.start();
  document.documentElement.classList.remove('no-scroll');
}

/** Smooth-scroll to an anchor target or absolute position. */
export function scrollToTarget(target: string | HTMLElement | number, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.6 });
  } else if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' });
  } else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
    el?.scrollIntoView({ behavior: 'smooth' });
  }
}

export function scrollTop() {
  scrollToTarget(0);
}

export { gsap, ScrollTrigger };
