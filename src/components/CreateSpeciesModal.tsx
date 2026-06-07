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

interface Species {
  id: string;
  scientific_name: string;
  common_name_pt: string | null;
  kingdom: string;
  family: string | null;
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

  const [form, setForm] = useState({
    scientific_name: "",
    common_name_pt: "",
    common_name_en: "",
    kingdom: "",
    phylum: "",
    class: "",
    order: "",
    family: "",
    genus: "",
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
      phylum: "",
      class: "",
      order: "",
      family: "",
      genus: "",
      description: "",
      is_protected: false,
    });
  };

  const handleSubmit = async () => {
    if (!form.scientific_name.trim() || !form.kingdom) {
      toast.error("Nome científico e reino são obrigatórios.");
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
          phylum: form.phylum.trim() || null,
          class: form.class.trim() || null,
          order: form.order.trim() || null,
          family: form.family.trim() || null,
          genus: form.genus.trim() || null,
          description: form.description.trim() || null,
          is_protected: form.is_protected,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Espécie criada com sucesso!", {
        description: `${data.scientific_name} foi adicionadadd.`,
      });

      onCreated({
        id: data.id,
        scientific_name: data.scientific_name,
        common_name_pt: data.common_name_pt,
        kingdom: data.kingdom,
        family: data.family,
        is_protected: data.is_protected,
      });

      resetForm();
      setOpen(false);
    } catch (error: any) {
      if (error?.code === "23505") {
        toast.error("Já existe uma espécie com este nome científico.");
      } else {
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
          {/* Coluna esquerda */}
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
              <Select onValueChange={(v) => handleChange("kingdom", v)}>
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

          {/* Coluna direita */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-stone-500">
              Classificação Taxonómica
            </h4>

            <div>
              <label className="text-xs text-stone-500 uppercase">Filo</label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Chordata"
                value={form.phylum}
                onChange={(e) => handleChange("phylum", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase">Classe</label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Mammalia"
                value={form.class}
                onChange={(e) => handleChange("class", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase">Ordem</label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Carnivora"
                value={form.order}
                onChange={(e) => handleChange("order", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase">
                Família
              </label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Fagaceae"
                value={form.family}
                onChange={(e) => handleChange("family", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 uppercase">Género</label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Quercus"
                value={form.genus}
                onChange={(e) => handleChange("genus", e.target.value)}
              />
            </div>
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
