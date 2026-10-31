import { useState } from 'react';
import type { EndlessConfig } from '../../lib/types';

const LABELS: [keyof EndlessConfig, string][] = [
  ['stdAct', 'Standard (Active)'],
  ['stdPass', 'Standard (Passive)'],
  ['dep', 'Deponents'],
  ['irr', 'Irregulars'],
];

export function EndlessModal({ onCancel, onStart }: { onCancel: () => void; onStart: (c: EndlessConfig) => void }) {
  const [cfg, setCfg] = useState<EndlessConfig>({ stdAct: true, stdPass: true, dep: true, irr: true });
  const none = !Object.values(cfg).some(Boolean);
  return (
    <div className="feedback-overlay" style={{ alignItems: 'center' }}>
      <div className="feedback-card modal-card">
        <h2 className="intro-title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Endless Configuration</h2>
        <p className="muted" style={{ marginBottom: 24 }}>Select the verb types you want to grind.</p>
        <div className="checkbox-list">
          {LABELS.map(([k, label]) => (
            <label key={k}>
              <input type="checkbox" checked={cfg[k]} onChange={e => setCfg({ ...cfg, [k]: e.target.checked })} />
              {label}
            </label>
          ))}
        </div>
        {none && <p className="form-error">Select at least one verb category.</p>}
        <div className="row-end">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={none} onClick={() => onStart(cfg)}>Start Grinding ⚡</button>
        </div>
      </div>
    </div>
  );
}
