import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import TaxonomyCascade from "@/components/TaxonomyCascade";

interface Species {
  id: string;
  scientific_name: string;
  common_name_pt: string | null;
  kingdom: string;
  family_name: string | null;
  is_protected: boolean;
}

interface CreateSpeciesModalProps {
  onCreated: (species: Species) => void;
}

export default function CreateSpeciesModal({
  onCreated,
}: CreateSpeciesModalProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [genusId, setGenusId] = useState<string | null>(null);
  const [form, setForm] = useState({
    scientific_name: "",
    common_name_pt: "",
    common_name_en: "",
    kingdom: "",
    description: "",
    is_protected: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      scientific_name: "",
      common_name_pt: "",
      common_name_en: "",
      kingdom: "",
      description: "",
      is_protected: false,
    });
    setGenusId(null);
  };

  const handleSubmit = async () => {
    if (!form.scientific_name.trim() || !form.kingdom) {
      toast.error("Nome científico e reino são obrigatórios.");
      return;
    }

    if (!genusId) {
      toast.error("Seleciona a classificação taxonómica até ao género.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("species")
        .insert({
          scientific_name: form.scientific_name.trim(),
          common_name_pt: form.common_name_pt.trim() || null,
          common_name_en: form.common_name_en.trim() || null,
          kingdom: form.kingdom,
          genus_id: genusId,
          description: form.description.trim() || null,
          is_protected: form.is_protected,
        })
        .select(
          "id, scientific_name, common_name_pt, kingdom, is_protected, genera(families(name))",
        )
        .single();

      if (error) throw error;

      toast.success("Espécie criada com sucesso!", {
        description: `${data.scientific_name} foi adicionada e selecionada.`,
      });

      // Achatar family_name vindo do join aninhado
      const family_name = (data as any).genera?.families?.name ?? null;

      onCreated({
        id: data.id,
        scientific_name: data.scientific_name,
        common_name_pt: data.common_name_pt,
        kingdom: data.kingdom,
        family_name,
        is_protected: data.is_protected,
      });

      resetForm();
      setOpen(false);
    } catch (error: any) {
      if (error?.code === "23505") {
        toast.error("Já existe uma espécie com este nome científico.");
      } else {
        console.log("Erro:", error);
        toast.error("Erro ao criar espécie.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full mt-2 flex items-center justify-center gap-2 py-2 text-sm text-[#2D5A3D] border border-dashed border-[#2D5A3D] rounded-lg cursor-pointer hover:bg-green-50">
          <Plus size={14} />
          Criar nova espécie
        </button>
      </DialogTrigger>

      <DialogContent className="!max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Espécie</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 mt-4">
          {/* Coluna esquerda — Identificação */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-stone-500">
              Identificação
            </h4>

            <div>
              <label className="text-xs text-stone-500 uppercase">
                Nome científico *
              </label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Quercus suber"
                value={form.scientific_name}
                onChange={(e) =>
                  handleChange("scientific_name", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 uppercase">
                  Nome comum (PT)
                </label>
                <Input
                  className="mt-1 bg-white"
                  placeholder="ex: Sobreiro"
                  value={form.common_name_pt}
                  onChange={(e) =>
                    handleChange("common_name_pt", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 uppercase">
                  Nome comum (EN)
                </label>
                <Input
                  className="mt-1 bg-white"
                  placeholder="ex: Cork Oak"
                  value={form.common_name_en}
                  onChange={(e) =>
                    handleChange("common_name_en", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-stone-500 uppercase">
                Reino *
              </label>
              <Select
                value={form.kingdom}
                onValueChange={(v) => {
                  handleChange("kingdom", v);
                  setGenusId(null);
                }}
              >
                <SelectTrigger className="mt-1 w-full bg-white">
                  <SelectValue placeholder="Selecionar reino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ANIMALIA">Animalia</SelectItem>
                    <SelectItem value="PLANTAE">Plantae</SelectItem>
                    <SelectItem value="FUNGI">Fungi</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-stone-500 uppercase">
                Descrição
              </label>
              <textarea
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                rows={2}
                placeholder="Descrição da espécie..."
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="modal_is_protected"
                checked={form.is_protected}
                onChange={(e) => handleChange("is_protected", e.target.checked)}
                className="w-4 h-4"
              />
              <label
                htmlFor="modal_is_protected"
                className="text-sm text-stone-600"
              >
                Espécie protegida
              </label>
            </div>
          </div>

          {/* Coluna direita — Taxonomia em cascata */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-stone-500">
              Classificação Taxonómica
            </h4>

            {!form.kingdom && (
              <p className="text-xs text-stone-400">
                Seleciona primeiro o reino para escolher a taxonomia.
              </p>
            )}

            <TaxonomyCascade
              kingdom={form.kingdom}
              onGenusSelected={setGenusId}
            />
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 mt-6 border-t border-stone-100 pt-4">
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
            {submitting ? "A guardar..." : "Guardar espécie"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
