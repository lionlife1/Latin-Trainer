import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** Teacher header. Students get StudentShell instead. */
export function AppHeader({ subtitle, children }: { subtitle: string; children?: ReactNode }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="wordmark">Latin<span>IQ</span></Link>
        <div className="header-subtitle">{subtitle}</div>
        <div className="header-meta">{children}</div>
      </div>
    </header>
  );
}
