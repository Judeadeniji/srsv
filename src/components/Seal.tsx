import { useRef } from 'react';

/** Rotating circular seal with center mark — hero scrub HUD ornament. */
export default function Seal() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div className="seal" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="seal-svg">
        <defs>
          <path id="seal-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text className="seal-text">
          <textPath href="#seal-circle">
            STANDARD RESERVE · SOVEREIGN · ONCHAIN · $STANDARD ·
          </textPath>
        </text>
      </svg>
      <span className="seal-mark">◆</span>
    </div>
  );
}
