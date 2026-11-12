import { useEffect, useRef } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Projects from './components/Projects.jsx';
import Skills from './components/Skills.jsx';
import Badges from './components/Badges.jsx';
import Experience from './components/Experience.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Robo from './components/Robo.jsx';
import Terminal from './components/Terminal.jsx';
import { useReveal } from './hooks/useReveal.js';
import { useFx } from './hooks/useFx.js';
import Stats from './components/Stats.jsx';

// A shared link like sldev.my.id/#contact: the browser looks for #contact before React has built
// the page, so jump there ourselves once the page (and the first-visit intro screen) is ready.
function useHashLanding() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    let tries = 0;
    let timer = 0;
    const go = () => {
      const el = document.getElementById(id);
      if (document.getElementById('intro') || !el) {
        if (tries++ < 60) timer = setTimeout(go, 150); // up to ~9 s
        return;
      }
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    };
    timer = setTimeout(go, 60);
    return () => clearTimeout(timer);
  }, []);
}

export default function App() {
  // Robo exposes say()/act() so other sections can make him talk
  const roboRef = useRef(null);
  useReveal();
  useFx();
  useHashLanding();

  return (
    <>
      <div className="blobs" aria-hidden="true" />
      <Navbar />
      <main className="wrap">
        <Hero onTalk={() => roboRef.current?.intro()} />
        <Stats />
        <Experience />
        <Projects />
        <Skills />
        <Badges />
        <Contact />
        <Footer />
      </main>
      <Robo ref={roboRef} />
      <Terminal />
    </>
  );
}
