import { useRef } from 'react';
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

export default function App() {
  // Robo exposes say()/act() so other sections can make him talk
  const roboRef = useRef(null);
  useReveal();

  return (
    <>
      <div className="blobs" aria-hidden="true" />
      <Navbar />
      <main className="wrap">
        <Hero onTalk={() => roboRef.current?.intro()} />
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
