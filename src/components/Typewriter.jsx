import { useEffect, useState } from 'react';

// Types each phrase, pauses, deletes it, then moves to the next one.
// Screen readers get the full sentence once instead of the moving text.
export default function Typewriter({ prefix, words }) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reduce) return;
    const word = words[i % words.length];
    let delay = deleting ? 38 : 75;
    if (!deleting && text === word) delay = 1700;
    if (deleting && text === '') delay = 280;
    const t = setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === '') {
        setDeleting(false);
        setI((n) => n + 1);
      } else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, words, reduce]);

  return (
    <p className="typer">
      <span className="sr-only">
        {prefix} {words.join(', ')}.
      </span>
      <span aria-hidden="true">
        {prefix} <b>{reduce ? words[0] : text}</b>
        <i className="caret" />
      </span>
    </p>
  );
}
