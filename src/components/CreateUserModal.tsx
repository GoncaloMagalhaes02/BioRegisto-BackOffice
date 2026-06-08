import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateUserModalProps {
  onCreated: () => void;
}

export default function CreateUserModal({ onCreated }: CreateUserModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
    role: "TECHNICIAN",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      email: "",
      password: "",
      username: "",
      full_name: "",
      role: "TECHNICIAN",
    });
  };

  const handleSubmit = async () => {
    if (
      !form.email.trim() ||
      !form.password.trim() ||
      !form.username.trim() ||
      !form.full_name.trim()
    ) {
      toast.error("Todos os campos são obrigatórios.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("A password deve ter pelo menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email: form.email.trim(),
          password: form.password,
          username: form.username.trim(),
          full_name: form.full_name.trim(),
          role: form.role,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Utilizador criado com sucesso!", {
        description: `${form.full_name} pode agora aceder com o email ${form.email}.`,
      });

      resetForm();
      setOpen(false);
      onCreated();
    } catch (error: any) {
      if (
        error.message?.includes("already") ||
        error.message?.includes("duplicate")
      ) {
        toast.error("Já existe um utilizador com este email ou username.");
      } else {
        console.log("Erro:", error);
        toast.error(error.message || "Erro ao criar utilizador.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-[#2D5A3D] text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#1f4a2d] text-sm">
          <Plus size={16} />
          Adicionar utilizador
        </button>
      </DialogTrigger>

      <DialogContent className="!max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Utilizador</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-xs text-stone-500 uppercase">
              Nome completo *
            </label>
            <Input
              className="mt-1 bg-white"
              placeholder="ex: João Silva"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-stone-500 uppercase">
              Username *
            </label>
            <Input
              className="mt-1 bg-white"
              placeholder="ex: joao_silva"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-stone-500 uppercase">Email *</label>
            <Input
              className="mt-1 bg-white"
              type="email"
              placeholder="ex: joao@bioregisto.pt"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-stone-500 uppercase">
              Password *
            </label>
            <Input
              className="mt-1 bg-white"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-stone-500 uppercase">Role *</label>
            <Select
              value={form.role}
              onValueChange={(v) => handleChange("role", v)}
            >
              <SelectTrigger className="mt-1 w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="USER">Utilizador</SelectItem>
                  <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4 border-t border-stone-100 pt-4">
          <button
            onClick={() => {
              resetForm();
              setOpen(false);
            }}
            className="px-5 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-5 py-2 rounded-lg text-sm ${
              submitting
                ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                : "bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d]"
            }`}
          >
            {submitting ? "A criar..." : "Criar utilizador"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
