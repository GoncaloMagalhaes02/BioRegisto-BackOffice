import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TaxItem {
  id: string;
  name: string;
}

interface TaxonomyCascadeProps {
  kingdom: string; // ANIMALIA, PLANTAE, FUNGI
  onGenusSelected: (genusId: string | null) => void;
}

export default function TaxonomyCascade({
  kingdom,
  onGenusSelected,
}: TaxonomyCascadeProps) {
  const [phylums, setPhylums] = useState<TaxItem[]>([]);
  const [classes, setClasses] = useState<TaxItem[]>([]);
  const [orders, setOrders] = useState<TaxItem[]>([]);
  const [families, setFamilies] = useState<TaxItem[]>([]);
  const [genera, setGenera] = useState<TaxItem[]>([]);

  const [phylum, setPhylum] = useState("");
  const [classId, setClassId] = useState("");
  const [order, setOrder] = useState("");
  const [family, setFamily] = useState("");
  const [genus, setGenus] = useState("");

  // Quando muda o reino, carrega filos e reseta tudo
  useEffect(() => {
    if (!kingdom) {
      setPhylums([]);
      return;
    }
    resetFrom("phylum");
    supabase.rpc("get_phylums", { p_kingdom: kingdom }).then(({ data }) => {
      setPhylums(data || []);
    });
  }, [kingdom]);

  // Carrega classes quando escolhe filo
  useEffect(() => {
    if (!phylum) return;
    supabase.rpc("get_classes", { p_phylum_id: phylum }).then(({ data }) => {
      setClasses(data || []);
    });
  }, [phylum]);

  // Carrega ordens quando escolhe classe
  useEffect(() => {
    if (!classId) return;
    supabase.rpc("get_orders", { p_class_id: classId }).then(({ data }) => {
      setOrders(data || []);
    });
  }, [classId]);

  // Carrega famílias quando escolhe ordem
  useEffect(() => {
    if (!order) return;
    supabase.rpc("get_families", { p_order_id: order }).then(({ data }) => {
      setFamilies(data || []);
    });
  }, [order]);

  // Carrega géneros quando escolhe família
  useEffect(() => {
    if (!family) return;
    supabase.rpc("get_genera", { p_family_id: family }).then(({ data }) => {
      setGenera(data || []);
    });
  }, [family]);

  // Quando escolhe género, comunica ao pai
  useEffect(() => {
    onGenusSelected(genus || null);
  }, [genus]);

  // Reset em cascata a partir de um nível
  function resetFrom(level: "phylum" | "class" | "order" | "family" | "genus") {
    const levels = ["phylum", "class", "order", "family", "genus"];
    const idx = levels.indexOf(level);

    if (idx <= 0) {
      setPhylum("");
      setClasses([]);
    }
    if (idx <= 1) {
      setClassId("");
      setOrders([]);
    }
    if (idx <= 2) {
      setOrder("");
      setFamilies([]);
    }
    if (idx <= 3) {
      setFamily("");
      setGenera([]);
    }
    if (idx <= 4) {
      setGenus("");
    }
  }

  const selectCls = "w-full bg-white";

  return (
    <div className="space-y-3">
      {/* Filo */}
      <div>
        <label className="text-xs text-stone-500 uppercase">Filo</label>
        <Select
          value={phylum}
          onValueChange={(v) => {
            resetFrom("class");
            setPhylum(v);
          }}
          disabled={!kingdom || phylums.length === 0}
        >
          <SelectTrigger className={`mt-1 ${selectCls}`}>
            <SelectValue
              placeholder={
                kingdom ? "Selecionar filo" : "Escolhe o reino primeiro"
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {phylums.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Classe */}
      <div>
        <label className="text-xs text-stone-500 uppercase">Classe</label>
        <Select
          value={classId}
          onValueChange={(v) => {
            resetFrom("order");
            setClassId(v);
          }}
          disabled={!phylum || classes.length === 0}
        >
          <SelectTrigger className={`mt-1 ${selectCls}`}>
            <SelectValue placeholder="Selecionar classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Ordem */}
      <div>
        <label className="text-xs text-stone-500 uppercase">Ordem</label>
        <Select
          value={order}
          onValueChange={(v) => {
            resetFrom("family");
            setOrder(v);
          }}
          disabled={!classId || orders.length === 0}
        >
          <SelectTrigger className={`mt-1 ${selectCls}`}>
            <SelectValue placeholder="Selecionar ordem" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {orders.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {o.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Família */}
      <div>
        <label className="text-xs text-stone-500 uppercase">Família</label>
        <Select
          value={family}
          onValueChange={(v) => {
            resetFrom("genus");
            setFamily(v);
          }}
          disabled={!order || families.length === 0}
        >
          <SelectTrigger className={`mt-1 ${selectCls}`}>
            <SelectValue placeholder="Selecionar família" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {families.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Género */}
      <div>
        <label className="text-xs text-stone-500 uppercase">Género</label>
        <Select
          value={genus}
          onValueChange={setGenus}
          disabled={!family || genera.length === 0}
        >
          <SelectTrigger className={`mt-1 ${selectCls}`}>
            <SelectValue placeholder="Selecionar género" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {genera.map((g) => (
                <SelectItem key={g.id} value={g.id}>
                  {g.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
