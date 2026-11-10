import { useRef, useState } from 'react';
import { profile } from '../data/profile.js';
import Button from './Button.jsx';

export default function Contact() {
  const [msg, setMsg] = useState('');
  const mailRef = useRef(null);

  const copy = () => {
    const select = () => {
      const r = document.createRange();
      r.selectNodeContents(mailRef.current);
      const s = getSelection();
      s.removeAllRanges();
      s.addRange(r);
      setMsg('Email selected. Copy it manually.');
    };
    try {
      navigator.clipboard.writeText(profile.email).then(() => setMsg('Email copied.'), select);
    } catch {
      select();
    }
  };

  return (
    <section id="contact" className="cta rv">
      <p className="label">Contact</p>
      <h2>
        Let's <em>work</em> together.
      </h2>
      <p>{profile.availability}</p>
      <div className="mailrow">
        <span className="addr" ref={mailRef}>{profile.email}</span>
        <Button small onClick={copy}>Copy email</Button>
      </div>
      <span className="copied" aria-live="polite">{msg}</span>
      <div className="row">
        <Button ghost href={profile.linkedin}>LinkedIn ↗</Button>
        <Button ghost href={profile.github}>GitHub ↗</Button>
      </div>
    </section>
  );
}
