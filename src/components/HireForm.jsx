import { useRef, useState } from 'react';
import { profile } from '../data/profile.js';

const EMPTY = { name: '', email: '', company: '', message: '', hp: '' };

function check(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email so Steven can reply.';
  if (f.message.trim().length < 10) e.message = 'Add a few words about the role or project.';
  return e;
}

export default function HireForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | failed
  const [failMsg, setFailMsg] = useState('');
  const started = useRef(Date.now());

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;
    const errs = check(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const key = Object.keys(errs)[0];
      document.getElementById(`hire-${key}`)?.focus();
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, elapsed: Date.now() - started.current }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState('sent');
        return;
      }
      if (res.status === 400 && data.fields) {
        setErrors(data.fields);
        setState('idle');
        return;
      }
      setFailMsg(res.status === 429 ? 'Too many messages in a short time. Wait a minute and try again.' : "Your message couldn't be sent right now.");
      setState('failed');
    } catch {
      setFailMsg("Your message couldn't be sent. Check your connection and try again.");
      setState('failed');
    }
  };

  if (state === 'sent') {
    return (
      <div className="hire hire-done" role="status">
        <span className="hire-check" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
        </span>
        <h3>Message sent. Thanks, {form.name.split(' ')[0]}!</h3>
        <p>It's in Steven's inbox now. He usually replies within a day at {form.email}.</p>
        <button type="button" className="contact-btn" onClick={() => { setForm(EMPTY); setState('idle'); started.current = Date.now(); }}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="hire" onSubmit={submit} noValidate>
      <div className="hire-head">
        <h3>Hiring? Send me a message</h3>
        <p>It goes straight to my inbox.</p>
      </div>

      <div className="hire-grid">
        <div className="field">
          <label htmlFor="hire-name">Your name</label>
          <input id="hire-name" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Rina Putri" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'hire-name-err' : undefined} maxLength={80} />
          {errors.name && <span className="field-err" id="hire-name-err">{errors.name}</span>}
        </div>
        <div className="field">
          <label htmlFor="hire-email">Your email</label>
          <input id="hire-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="rina@company.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'hire-email-err' : undefined} maxLength={120} />
          {errors.email && <span className="field-err" id="hire-email-err">{errors.email}</span>}
        </div>
        <div className="field wide">
          <label htmlFor="hire-company">Company <span className="opt">(optional)</span></label>
          <input id="hire-company" value={form.company} onChange={set('company')} autoComplete="organization" placeholder="PT Maju Bersama" maxLength={100} />
        </div>
        <div className="field wide">
          <label htmlFor="hire-message">Message</label>
          <textarea id="hire-message" value={form.message} onChange={set('message')} rows={5} placeholder="Tell me about the role or project, the timeline, and how to reach you." aria-invalid={!!errors.message} aria-describedby={errors.message ? 'hire-message-err' : undefined} maxLength={3000} />
          {errors.message && <span className="field-err" id="hire-message-err">{errors.message}</span>}
        </div>
        {/* Hidden from people; bots tend to fill it in. Named so browser autofill leaves it alone. */}
        <div className="hp" aria-hidden="true">
          <label htmlFor="hire-hp">Leave this empty</label>
          <input id="hire-hp" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore value={form.hp} onChange={set('hp')} />
        </div>
      </div>

      {state === 'failed' && (
        <p className="hire-fail" role="alert">
          {failMsg} Email me directly at <b className="addr-inline">{profile.email}</b>.
        </p>
      )}

      <div className="hire-foot">
        <button type="submit" className="hire-send" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send message'}
          {state !== 'sending' && <span aria-hidden="true"> →</span>}
        </button>
        <span className="hire-note">Your email is only used to reply to you.</span>
      </div>
    </form>
  );
}
