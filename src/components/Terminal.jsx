import { useCallback, useEffect, useRef, useState } from 'react';
import { profile } from '../data/profile.js';
import { run, complete } from '../terminal/commands.js';

// Anything on the page can open the terminal with: window.dispatchEvent(new Event('open-terminal'))
export const openTerminal = () => window.dispatchEvent(new Event('open-terminal'));

const PROMPT = 'steven@sldev:~$';
const QUICK = ['help', 'whoami', 'projects', 'skills', 'contact', 'cv', 'sudo hire steven'];
const WELCOME = [
  { t: `Welcome to ${profile.name}'s terminal.`, c: 'head' },
  { t: 'Type "help" to see the commands, or tap one below.', c: 'dim' },
];

function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'confetti';
  box.setAttribute('aria-hidden', 'true');
  const colors = ['#2563EB', '#7C3AED', '#16A34A', '#EA580C', '#111111'];
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('span');
    s.style.left = Math.random() * 100 + 'vw';
    s.style.background = colors[i % colors.length];
    s.style.animationDelay = Math.random() * 0.5 + 's';
    s.style.animationDuration = 1.6 + Math.random() * 1.4 + 's';
    s.style.setProperty('--r', Math.round(Math.random() * 720 - 360) + 'deg');
    s.style.setProperty('--x', Math.round(Math.random() * 160 - 80) + 'px');
    box.appendChild(s);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3400);
}

function scrollToProject(index) {
  const stack = document.querySelector('#work .stack');
  const cards = stack ? [...stack.children] : [];
  if (!cards[index]) return;
  const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
  // Cards are sticky, so measure their place in the normal flow instead of their current box
  let y = stack.getBoundingClientRect().top + scrollY;
  for (let i = 0; i < index; i++) y += cards[i].offsetHeight + gap;
  scrollTo({ top: y - 90, behavior: 'smooth' });
}

export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState([]); // { kind: 'in' | 'out', t, c, delay }
  const [input, setInput] = useState('');
  const history = useRef([]);
  const histIdx = useRef(-1);
  const inputRef = useRef(null);
  const bodyRef = useRef(null);
  const lastFocus = useRef(null);

  const show = useCallback(() => {
    lastFocus.current = document.activeElement;
    setOpen(true);
    setLines((l) => (l.length ? l : WELCOME.map((x) => ({ kind: 'out', ...x, delay: 0 }))));
  }, []);
  const hide = useCallback(() => {
    setOpen(false);
    lastFocus.current?.focus?.();
  }, []);

  // Open from the navbar button, footer link, console, or the ` key
  useEffect(() => {
    const onOpen = () => show();
    const onKey = (e) => {
      const t = e.target;
      const typing = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if (e.key === '`' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            lastFocus.current = document.activeElement;
            setLines((l) => (l.length ? l : WELCOME.map((x) => ({ kind: 'out', ...x, delay: 0 }))));
          }
          return !o;
        });
      }
    };
    addEventListener('open-terminal', onOpen);
    addEventListener('keydown', onKey);
    return () => {
      removeEventListener('open-terminal', onOpen);
      removeEventListener('keydown', onKey);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add('term-open');
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      clearTimeout(t);
      document.documentElement.classList.remove('term-open');
    };
  }, [open]);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const exec = (raw) => {
    const cmd = raw.trim();
    if (cmd) {
      history.current = [cmd, ...history.current.filter((h) => h !== cmd)].slice(0, 30);
    }
    histIdx.current = -1;
    const { lines: out, action } = run(cmd);
    if (action?.type === 'clear') {
      setLines([]);
      setInput('');
      return;
    }
    setLines((l) => [
      ...l,
      { kind: 'in', t: cmd },
      ...out.map((x, i) => ({ kind: 'out', ...(typeof x === 'string' ? { t: x } : x), delay: i * 0.035 })),
    ]);
    setInput('');

    switch (action?.type) {
      case 'close':
        hide();
        break;
      case 'copy': {
        // Only claim it was copied once the browser confirms it
        const note = (t, c) => setLines((l) => [...l, { kind: 'out', t, c }]);
        try {
          navigator.clipboard
            .writeText(action.text)
            .then(() => note('✓ Email copied to your clipboard.', 'ok'), () => note('Copy the address above.', 'dim'));
        } catch {
          note('Copy the address above.', 'dim');
        }
        break;
      }
      case 'download': {
        const a = document.createElement('a');
        a.href = action.href;
        a.download = 'Steven-Lim-CV.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        break;
      }
      case 'link':
        window.open(action.href, '_blank', 'noopener');
        break;
      case 'project':
        setTimeout(() => {
          hide();
          scrollToProject(action.index);
        }, 450);
        break;
      case 'ask':
        setTimeout(() => {
          hide();
          window.dispatchEvent(new CustomEvent('robo-ask', { detail: action.text }));
        }, 450);
        break;
      case 'konami':
        setTimeout(() => {
          hide();
          setTimeout(() => window.dispatchEvent(new Event('konami')), 250);
        }, 500);
        break;
      case 'hire':
        confetti();
        setTimeout(() => {
          hide();
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1200);
        break;
      default:
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      exec(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      setInput((v) => complete(v));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const i = Math.min(histIdx.current + 1, history.current.length - 1);
      if (i >= 0) {
        histIdx.current = i;
        setInput(history.current[i]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const i = histIdx.current - 1;
      histIdx.current = Math.max(i, -1);
      setInput(i >= 0 ? history.current[i] : '');
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hide();
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  if (!open) return null;

  return (
    <div className="term-backdrop" onMouseDown={(e) => e.target === e.currentTarget && hide()}>
      <div className="term" role="dialog" aria-modal="true" aria-label="Terminal">
        <div className="term-bar">
          <span className="term-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="term-title">steven@sldev — zsh</span>
          <button className="term-x" type="button" aria-label="Close terminal" onClick={hide}>×</button>
        </div>
        <div className="term-body" ref={bodyRef} aria-live="polite" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
          {lines.map((l, i) =>
            l.kind === 'in' ? (
              <p key={i} className="term-line in">
                <b>{PROMPT}</b> {l.t}
              </p>
            ) : (
              <p key={i} className={`term-line ${l.c || ''}`} style={{ animationDelay: `${l.delay || 0}s` }}>
                {l.t || ' '}
              </p>
            )
          )}
          <form
            className="term-input"
            onSubmit={(e) => {
              e.preventDefault();
              exec(input);
            }}
          >
            <label htmlFor="term-input"><b>{PROMPT}</b></label>
            <input
              id="term-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
              enterKeyHint="send"
              aria-label="Type a command"
            />
          </form>
        </div>
        <div className="term-quick" aria-label="Quick commands">
          {QUICK.map((q) => (
            <button key={q} type="button" onClick={() => exec(q)}>{q}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
