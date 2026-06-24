import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      toast.error("Indica o teu email.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (error) throw error;

      setSent(true);
    } catch (error) {
      toast.error("Não foi possível enviar o email de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white rounded-lg border border-stone-200 p-8 w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <div className="bg-green-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-[#2D5A3D]" />
            </div>
            <h2 className="text-xl font-medium mb-2">Verifica o teu email</h2>
            <p className="text-sm text-stone-500 mb-6">
              Se existir uma conta associada a <strong>{email}</strong>, foi
              enviado um link para recuperares a tua palavra-passe.
            </p>
            <Link
              to="/login"
              className="text-sm text-[#2D5A3D] hover:underline cursor-pointer"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-medium mb-1">
              Recuperar palavra-passe
            </h2>
            <p className="text-sm text-stone-500 mb-6">
              Indica o teu email e enviaremos um link para definires uma nova
              palavra-passe.
            </p>

            <label className="text-xs text-stone-500 uppercase">Email</label>
            <Input
              type="email"
              className="mt-1 mb-5 bg-white"
              placeholder="o-teu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              {loading ? "A enviar..." : "Enviar link de recuperação"}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 mt-5 text-sm text-stone-500 hover:text-stone-700 cursor-pointer"
            >
              <ArrowLeft size={15} />
              Voltar ao login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
