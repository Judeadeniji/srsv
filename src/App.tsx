import { useCallback, useEffect } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { initScroll, lockScroll, unlockScroll } from './lib/scroll';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import HeroScrub from './components/HeroScrub';
import Manifesto from './components/Manifesto';
import Stats from './components/Stats';
import Charts from './components/Charts';
import Features from './components/Features';
import Protocol from './components/Protocol';
import Charters from './components/Charters';
import Flywheel from './components/Flywheel';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

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
        {/* The story: hook → thesis → proof → pillars → rules → mechanics →
            participation → compounding → close */}
        <HeroScrub />    {/* Hook — "The bank is code." */}
        <Manifesto />    {/* Thesis — what it is, what it is not */}
        <Stats />        {/* Proof — the invariant, quantified */}
        <Features />     {/* Pillars — the machine at a glance */}
        <Protocol />     {/* Rules — the six primitives it runs on */}
        <Charts />       {/* Mechanics — the rules in motion, the math */}
        <Charters />     {/* Participation — your way into the economy */}
        <Flywheel />     {/* Compounding — why it gets stronger every epoch */}
        <FinalCTA />     {/* Close — one rule, enforced forever */}
      </main>
      <Footer />
    </>
  );
}
