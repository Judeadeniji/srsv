import { SplitText, gsap, useGSAP } from './gsap';

/**
 * useMaskedReveal — splits every [data-split] element inside the scope into
 * masked lines and slides them up when scrolled into view.
 */
export function useMaskedReveal(scope: React.RefObject<HTMLElement | null>) {
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
