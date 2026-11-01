import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../features/solo/useTheme';

export function AppHeader({ subtitle, children }: { subtitle: string; children?: ReactNode }) {
  const theme = useTheme();
  return (
    <header className="app-header">
      <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>
        <span className="logo-latin">LATIN</span>
        <span className="logo-iq">IQ</span>
      </Link>
      <div className="header-subtitle">{subtitle}</div>
      <div className="header-meta">
        <button className="btn-ghost theme-btn" title="Toggle Theme" onClick={theme.toggle}>
          {theme.light ? '🌙' : '☀️'}
        </button>
        {children}
      </div>
    </header>
  );
}
