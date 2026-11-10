// Button / link with the ripple effect. Renders <a> when href is given.
export default function Button({ href, primary, small, ghost, className = '', children, onPointerDown, ...rest }) {
  const cls = ['btn', primary && 'primary', small && 'sm', ghost && 'ghost', className].filter(Boolean).join(' ');

  const ripple = (e) => {
    const b = e.currentTarget;
    const r = b.getBoundingClientRect();
    const s = Math.max(r.width, r.height) * 2.2;
    const d = document.createElement('span');
    d.className = 'rip';
    d.style.width = d.style.height = s + 'px';
    d.style.left = e.clientX - r.left - s / 2 + 'px';
    d.style.top = e.clientY - r.top - s / 2 + 'px';
    b.appendChild(d);
    setTimeout(() => d.remove(), 650);
    onPointerDown?.(e);
  };

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a className={cls} href={href} onPointerDown={ripple} {...(external ? { target: '_blank', rel: 'noopener' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} type="button" onPointerDown={ripple} {...rest}>
      {children}
    </button>
  );
}
