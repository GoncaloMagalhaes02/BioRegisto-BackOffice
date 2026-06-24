import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("Erro a buscar perfil:", error);
      return;
    }

    // Se a conta foi desativada enquanto estava logado, faz logout
    if (data && !data.is_active) {
      await supabase.auth.signOut();
      toast.error("A sua conta foi desativada.");
      return;
    }

    setProfile(data);
  }

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (event === "PASSWORD_RECOVERY") return;

      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) return { error: authError.message };

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_active, role")
      .eq("id", authData.user.id)
      .single();

    if (profileError) {
      await supabase.auth.signOut();
      return { error: "Erro ao validar conta." };
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      return { error: "A sua conta foi desativada. Contacte o administrador." };
    }

    if (profile.role === "USER") {
      await supabase.auth.signOut();
      return {
        error: "Acesso negado. O backoffice é apenas para técnicos e admins.",
      };
    }

    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
