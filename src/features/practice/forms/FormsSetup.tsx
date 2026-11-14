import { useState } from 'react';
import { ChevronLeft } from '../../../components/icons';
import { formsConfigHasQuestions, type FormsConfig } from '../../../lib/formsQuestions';
import { FormsFilterGroups } from './FormsFilterGroups';
import type { FormsLength, FormsSettings } from './formsSettings';

interface Props {
  initial: FormsSettings;
  onStart: (s: FormsSettings) => void;
  onBack: () => void;
}

export function FormsSetup({ initial, onStart, onBack }: Props) {
  const [config, setConfig] = useState<FormsConfig>(initial.config);
  const [length, setLength] = useState<FormsLength>(initial.length);
  const ok = formsConfigHasQuestions(config);

  return (
    <div className="screen active" style={{ padding: '0 16px' }}>
      <div className="intro-card">
        <button className="btn-back" onClick={onBack}><ChevronLeft size={18} />Practice</button>
        <h1 className="intro-title">Forms</h1>
        <p className="intro-desc">Build any form from its dictionary entry, or name a form you see. Choose what to practice below.</p>
        <FormsFilterGroups config={config} onChange={setConfig} />
        <div className="intro-config">
          <label htmlFor="forms-length">Session length</label>
          <select
            id="forms-length"
            className="select"
            value={String(length)}
            onChange={e => setLength(e.target.value === 'endless' ? 'endless' : e.target.value === '20' ? 20 : 10)}
          >
            <option value="10">10 questions</option>
            <option value="20">20 questions</option>
            <option value="endless">Endless</option>
          </select>
        </div>
        {!ok && <p className="form-error">No forms match these settings. Turn on more options.</p>}
        <button className="btn-primary" disabled={!ok} onClick={() => onStart({ config, length })}>Start session</button>
      </div>
    </div>
  );
}
