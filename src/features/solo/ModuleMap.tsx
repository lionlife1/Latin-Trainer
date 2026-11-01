import type { ModuleContent } from '../../lib/types';
import { isUnlocked, type Progress } from './progressStore';

interface Props {
  modules: ModuleContent[];
  progress: Progress;
  onOpen: (m: ModuleContent) => void;
}

export function ModuleMap({ modules, progress, onOpen }: Props) {
  return (
    <main className="module-map">
      <div className="map-title">
        <span className="map-title-line">SELECT MODULE</span>
      </div>
      <div className="module-grid">
        {modules.map(mod => {
          const unlocked = isUnlocked(mod, progress);
          const completed = progress[mod.id]?.completed === true;
          return (
            <div
              key={mod.id}
              className={`module-card ${unlocked ? 'unlocked' : 'locked'} ${completed ? 'completed' : ''}`}
              title={unlocked ? undefined : `Requires: ${mod.prerequisites.join(', ')}`}
              onClick={() => unlocked && onOpen(mod)}
              role="button"
            >
              <div className="module-num">{mod.badge}</div>
              <div className="module-info">
                <div className="module-name">{mod.title}</div>
                <div className="module-tagline">{mod.tagline}</div>
              </div>
              <div className="module-right">
                {unlocked ? (
                  <>
                    <div className={`module-progress-pill ${completed ? 'done' : ''}`}>{completed ? '✓ Done' : 'Start'}</div>
                    <div className="module-xp-label">+{mod.xp_reward} XP</div>
                  </>
                ) : (
                  <div className="module-lock-icon">🔒</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
