import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  role: 'author' | 'reviewer' | 'editor' | 'admin';
  full_name: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session) {
          if (event === 'SIGNED_IN') {
            setLoading(true);
          }
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error('Error fetching profile:', error);
        setUser(null);
      } else if (data) {
        setUser({
          id: data.id,
          email: data.email,
          role: data.role,
          full_name: data.full_name,
          status: data.status,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (user) {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'User logout',
        entity_type: 'users',
        entity_id: user.id
      });
    }
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
