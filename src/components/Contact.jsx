import { useState } from 'react';
import { profile } from '../data/profile.js';
import { GitHubIcon, LinkedInIcon, MailIcon } from './icons.jsx';

export default function Contact() {
  const [copied, setCopied] = useState('');

  const copyEmail = () => {
    try {
      navigator.clipboard.writeText(profile.email).then(
        () => setCopied('Email copied.'),
        () => setCopied(`Copy this address: ${profile.email}`)
      );
    } catch {
      setCopied(`Copy this address: ${profile.email}`);
    }
    setTimeout(() => setCopied(''), 3000);
  };

  const handle = profile.github.replace(/^https?:\/\/(www\.)?github\.com\//, '@');

  return (
    <section id="contact" className="cta rv">
      <p className="label">Contact</p>
      <h2>
        Let's <em>work</em> together.
      </h2>
      <p>{profile.availability}</p>

      <div className="contact-grid">
        <div className="contact-card spot">
          <span className="contact-ico"><MailIcon size={22} /></span>
          <span className="contact-txt">
            <b>Gmail</b>
            <span>{profile.email}</span>
          </span>
          <div className="contact-acts">
            <button type="button" className="contact-btn" onClick={copyEmail}>Copy</button>
            <a className="contact-btn" href={`mailto:${profile.email}`}>Send ↗</a>
          </div>
        </div>

        <a className="contact-card spot" href={profile.linkedin} target="_blank" rel="noopener">
          <span className="contact-ico"><LinkedInIcon size={22} /></span>
          <span className="contact-txt">
            <b>LinkedIn</b>
            <span>{profile.name}</span>
          </span>
          <div className="contact-acts">
            <span className="contact-btn">Connect ↗</span>
          </div>
        </a>

        <a className="contact-card spot" href={profile.github} target="_blank" rel="noopener">
          <span className="contact-ico"><GitHubIcon size={22} /></span>
          <span className="contact-txt">
            <b>GitHub</b>
            <span>{handle}</span>
          </span>
          <div className="contact-acts">
            <span className="contact-btn">Follow ↗</span>
          </div>
        </a>
      </div>
      <span className="copied" aria-live="polite">{copied}</span>
    </section>
  );
}
