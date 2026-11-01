import { useEffect, useState } from 'react';

const KEY = 'latiniq_theme';

export function useTheme() {
  const [light, setLight] = useState(() => localStorage.getItem(KEY) === 'light');
  useEffect(() => {
    document.body.classList.toggle('light-mode', light);
    localStorage.setItem(KEY, light ? 'light' : 'dark');
  }, [light]);
  return { light, toggle: () => setLight(l => !l) };
}
