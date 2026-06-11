import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { MoveLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TaxonomyCascade from "@/components/TaxonomyCascade";
import { toast } from "sonner";

export default function CreateSpecies() {
  const navigate = useNavigate();
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
      const { error } = await supabase.from("species").insert({
        scientific_name: form.scientific_name.trim(),
        common_name_pt: form.common_name_pt.trim() || null,
        common_name_en: form.common_name_en.trim() || null,
        kingdom: form.kingdom,
        genus_id: genusId,
        description: form.description.trim() || null,
        is_protected: form.is_protected,
      });

      if (error) throw error;
      toast.success("Espécie criada com sucesso!");
      navigate("/species");
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
    <>
      <header>
        <div className="flex gap-5 items-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-white flex items-center px-2 py-1 rounded-lg hover:bg-stone-200 cursor-pointer"
          >
            <MoveLeft className="text-stone-400 w-5" />
          </button>
          <h2 className="font-medium text-xl">Adicionar Espécie</h2>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 mt-8">
        {/* Coluna esquerda — Identificação */}
        <section className="bg-white rounded-lg border border-stone-200 p-6 space-y-5">
          <h3 className="font-medium">Identificação</h3>

          <div>
            <label className="text-xs text-stone-500 uppercase">
              Nome científico *
            </label>
            <Input
              className="mt-1 bg-white"
              placeholder="ex: Quercus suber"
              value={form.scientific_name}
              onChange={(e) => handleChange("scientific_name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-stone-500 uppercase">
                Nome comum (PT)
              </label>
              <Input
                className="mt-1 bg-white"
                placeholder="ex: Sobreiro"
                value={form.common_name_pt}
                onChange={(e) => handleChange("common_name_pt", e.target.value)}
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
                onChange={(e) => handleChange("common_name_en", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-stone-500 uppercase">Reino *</label>
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
              rows={3}
              placeholder="Descrição da espécie..."
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_protected"
              checked={form.is_protected}
              onChange={(e) => handleChange("is_protected", e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="is_protected" className="text-sm text-stone-600">
              Espécie protegida
            </label>
          </div>
        </section>

        {/* Coluna direita — Taxonomia em cascata */}
        <section className="bg-white rounded-lg border border-stone-200 p-6 space-y-5">
          <h3 className="font-medium">Classificação Taxonómica</h3>

          {!form.kingdom && (
            <p className="text-sm text-stone-400">
              Seleciona primeiro o reino para escolher a taxonomia.
            </p>
          )}

          <TaxonomyCascade
            kingdom={form.kingdom}
            onGenusSelected={setGenusId}
          />
        </section>
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-6 py-3 rounded-lg ${
            submitting
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : "bg-[#2D5A3D] text-white cursor-pointer hover:bg-[#1f4a2d]"
          }`}
        >
          {submitting ? "A guardar..." : "Guardar espécie"}
        </button>
      </div>
    </>
  );
}
