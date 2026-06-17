import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface TaxItem {
  id: string;
  name: string;
}

interface TaxLevelPickerProps {
  label: string;
  placeholder: string;
  items: TaxItem[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  createRpc: string;
  createParams: Record<string, any>;
  onCreated: (newItem: TaxItem) => void;
}

export default function TaxLevelPicker({
  label,
  placeholder,
  items,
  value,
  onChange,
  disabled,
  createRpc,
  createParams,
  onCreated,
}: TaxLevelPickerProps) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      toast.error("Indica o nome.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc(createRpc, {
        p_name: name,
        ...createParams,
      });

      if (error) throw error;
      const created = Array.isArray(data) ? data[0] : data;
      if (!created) throw new Error("Sem resposta");

      toast.success(`${label} "${name}" criado.`);
      onCreated(created);
      onChange(created.id);
      setNewName("");
      setCreating(false);
    } catch (error: any) {
      if (error?.code === "23505" || error?.message?.includes("duplicate")) {
        toast.error(`Já existe um ${label.toLowerCase()} com esse nome.`);
      } else {
        console.log("Erro:", error);
        toast.error(`Erro ao criar ${label.toLowerCase()}.`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Modo criar
  if (creating) {
    return (
      <div>
        <label className="text-xs text-stone-500 uppercase">{label}</label>
        <div className="flex gap-2 mt-1">
          <Input
            className="bg-white"
            placeholder={`Nome do novo ${label.toLowerCase()}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setCreating(false);
                setNewName("");
              }
            }}
            autoFocus
          />
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="p-2 rounded-lg bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d] disabled:opacity-50 flex-shrink-0"
            title="Confirmar"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => {
              setCreating(false);
              setNewName("");
            }}
            className="p-2 rounded-lg border border-stone-200 text-stone-600 cursor-pointer hover:bg-stone-50 flex-shrink-0"
            title="Cancelar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Modo normal — select + botão "+" SEPARADO (fora do SelectContent)
  return (
    <div>
      <label className="text-xs text-stone-500 uppercase">{label}</label>
      <div className="flex gap-2 mt-1">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {items.length > 0 ? (
              <SelectGroup>
                {items.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ) : (
              <div className="px-2 py-2 text-xs text-stone-400 italic">
                Sem opções. Usa o botão + para criar.
              </div>
            )}
          </SelectContent>
        </Select>

        {/* Botão criar FORA do select */}
        {!disabled && (
          <button
            onClick={() => setCreating(true)}
            className="p-2 rounded-lg border border-[#2D5A3D] text-[#2D5A3D] cursor-pointer hover:bg-green-50 flex-shrink-0"
            title={`Criar novo ${label.toLowerCase()}`}
          >
            <Plus size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
