import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '../../lib/supabase';

export interface Profile {
  id: string;
  role: 'teacher' | 'student';
  display_name: string;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({ session: null, profile: null, loading: false, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  // Whose profile is loaded (or null when signed out): a different user means we're loading again.
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    const load = async (s: Session | null) => {
      if (!s) {
        loadedFor.current = null;
        setSession(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      if (s.user.id !== loadedFor.current) setLoading(true);
      const { data } = await sb.from('profiles').select('id, role, display_name').eq('id', s.user.id).maybeSingle();
      loadedFor.current = s.user.id;
      setSession(s);
      setProfile((data as Profile | null) ?? null);
      setLoading(false);
    };
    sb.auth.getSession().then(({ data }) => load(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
      // signInWithPassword resolves only after this callback runs, and pages navigate right after.
      // Flag loading synchronously so RequireRole waits instead of redirecting to the login page.
      if ((s?.user.id ?? null) !== loadedFor.current) setLoading(true);
      // Defer: supabase-js warns against awaiting other calls inside this callback.
      setTimeout(() => load(s), 0);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase?.auth.signOut();
  };

  return <AuthContext.Provider value={{ session, profile, loading, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
