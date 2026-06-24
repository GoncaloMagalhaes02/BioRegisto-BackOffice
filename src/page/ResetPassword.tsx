import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  // Quando o utilizador chega pelo link do email, o Supabase cria uma sessão de recuperação
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setValidSession(true);
      }
    });

    // Verificar se já há sessão (caso o evento tenha disparado antes)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidSession(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast.error("A palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }
    if (
      !/[a-z]/.test(password) ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      toast.error(
        "A palavra-passe deve conter pelo menos uma minúscula, uma maiúscula e um número.",
      );
      return;
    }
    if (password !== confirm) {
      toast.error("As palavras-passe não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success("Palavra-passe alterada com sucesso!");
      await supabase.auth.signOut(); // terminar a sessão de recuperação
      navigate("/login");
    } catch (error) {
      console.log("Erro:", error);
      toast.error("Não foi possível alterar a palavra-passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white rounded-lg border border-stone-200 p-8 w-full max-w-md">
        <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-[#2D5A3D]" />
        </div>
        <h2 className="text-xl font-medium mb-1 text-center">
          Nova palavra-passe
        </h2>
        <p className="text-sm text-stone-500 mb-6 text-center">
          Define a tua nova palavra-passe de acesso.
        </p>

        {!validSession ? (
          <p className="text-sm text-stone-400 text-center py-4">
            A validar o link de recuperação...
          </p>
        ) : (
          <>
            <label className="text-xs text-stone-500 uppercase">
              Nova palavra-passe
            </label>
            <Input
              type="password"
              className="mt-1 mb-4 bg-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label className="text-xs text-stone-500 uppercase">
              Confirmar palavra-passe
            </label>
            <Input
              type="password"
              className="mt-1 mb-5 bg-white"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-medium ${
                loading
                  ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                  : "bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d]"
              }`}
            >
              {loading ? "A guardar..." : "Alterar palavra-passe"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
