// Placeholder device frames shown until a real screenshot is set in profile.js
export default function Mockup({ kind, screenshot, title }) {
  if (screenshot) {
    return (
      <div className="shot">
        <img src={screenshot} alt={`Screenshot of ${title}`} style={{ width: '100%', borderRadius: '12px 12px 0 0', display: 'block' }} />
      </div>
    );
  }

  return (
    <div className="shot">
      <span className="note">[Replace with screenshot]</span>
      {kind === 'laptop' && (
        <div className="laptop">
          <div className="screen">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sk" style={{ width: 90, height: 12 }} />
              <div style={{ width: 54, height: 20, borderRadius: 999, background: 'var(--accent)' }} />
            </div>
            {['chip-ok', 'chip-low', 'chip-ok', 'chip-ok'].map((c, i) => (
              <div className="trow" key={i}>
                <div className="sk" />
                <div className={c} />
                <div className="sk" />
              </div>
            ))}
          </div>
        </div>
      )}
      {kind === 'phone' && (
        <div className="phone">
          <div className="screen">
            <div className="msg me"><div className="sk" style={{ width: 80 }} /></div>
            <div className="msg ai">
              <div className="sk" style={{ width: 110, marginBottom: 6 }} />
              <div className="sk" style={{ width: 80 }} />
            </div>
            <div className="msg me"><div className="sk" style={{ width: 60 }} /></div>
            <div className="typing"><i /><i /><i /></div>
          </div>
        </div>
      )}
      {kind === 'doc' && (
        <div className="doc">
          <div className="sk" style={{ width: '70%', height: 14 }} />
          <div className="sk" style={{ width: '45%' }} />
          <div style={{ height: 6 }} />
          <div className="sk" />
          <div className="sk" />
          <div className="sk" style={{ width: '85%' }} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 46, marginTop: 4 }}>
            {[
              ['40%', 'var(--lilac)'],
              ['70%', 'var(--accent)'],
              ['55%', 'var(--peach)'],
              ['90%', 'var(--mint)'],
            ].map(([h, bg], i) => (
              <div key={i} style={{ flex: 1, height: h, borderRadius: 4, background: bg }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
