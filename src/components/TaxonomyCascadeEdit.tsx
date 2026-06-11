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

interface InitialTaxonomy {
  phylum_id?: string | null;
  class_id?: string | null;
  order_id?: string | null;
  family_id?: string | null;
  genus_id?: string | null;
}

interface TaxonomyCascadeEditProps {
  kingdom: string;
  initial?: InitialTaxonomy;
  onGenusSelected: (genusId: string | null) => void;
}

export default function TaxonomyCascadeEdit({
  kingdom,
  initial,
  onGenusSelected,
}: TaxonomyCascadeEditProps) {
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

  const [initialized, setInitialized] = useState(false);

  // Carregar filos quando há reino
  useEffect(() => {
    if (!kingdom) return;
    supabase.rpc("get_phylums", { p_kingdom: kingdom }).then(({ data }) => {
      setPhylums(data || []);
    });
  }, [kingdom]);

  // Pré-preencher os valores iniciais (uma vez só)
  useEffect(() => {
    if (initialized || !initial || phylums.length === 0) return;

    const init = async () => {
      if (initial.phylum_id) {
        setPhylum(initial.phylum_id);
        const { data: cls } = await supabase.rpc("get_classes", {
          p_phylum_id: initial.phylum_id,
        });
        setClasses(cls || []);
      }
      if (initial.class_id) {
        setClassId(initial.class_id);
        const { data: ord } = await supabase.rpc("get_orders", {
          p_class_id: initial.class_id,
        });
        setOrders(ord || []);
      }
      if (initial.order_id) {
        setOrder(initial.order_id);
        const { data: fam } = await supabase.rpc("get_families", {
          p_order_id: initial.order_id,
        });
        setFamilies(fam || []);
      }
      if (initial.family_id) {
        setFamily(initial.family_id);
        const { data: gen } = await supabase.rpc("get_genera", {
          p_family_id: initial.family_id,
        });
        setGenera(gen || []);
      }
      if (initial.genus_id) {
        setGenus(initial.genus_id);
      }
      setInitialized(true);
    };

    init();
  }, [initial, phylums, initialized]);

  // Carregamentos em cascata (quando o utilizador muda manualmente)
  useEffect(() => {
    if (!phylum || !initialized) return;
    supabase
      .rpc("get_classes", { p_phylum_id: phylum })
      .then(({ data }) => setClasses(data || []));
  }, [phylum]);

  useEffect(() => {
    if (!classId || !initialized) return;
    supabase
      .rpc("get_orders", { p_class_id: classId })
      .then(({ data }) => setOrders(data || []));
  }, [classId]);

  useEffect(() => {
    if (!order || !initialized) return;
    supabase
      .rpc("get_families", { p_order_id: order })
      .then(({ data }) => setFamilies(data || []));
  }, [order]);

  useEffect(() => {
    if (!family || !initialized) return;
    supabase
      .rpc("get_genera", { p_family_id: family })
      .then(({ data }) => setGenera(data || []));
  }, [family]);

  // Comunicar o género ao pai
  useEffect(() => {
    onGenusSelected(genus || null);
  }, [genus]);

  function resetFrom(level: "class" | "order" | "family" | "genus") {
    const levels = ["class", "order", "family", "genus"];
    const idx = levels.indexOf(level);
    if (idx <= 0) {
      setClassId("");
      setOrders([]);
    }
    if (idx <= 1) {
      setOrder("");
      setFamilies([]);
    }
    if (idx <= 2) {
      setFamily("");
      setGenera([]);
    }
    if (idx <= 3) {
      setGenus("");
    }
  }

  const selectCls = "w-full bg-white";

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-stone-500 uppercase">Filo</label>
        <Select
          value={phylum}
          onValueChange={(v) => {
            resetFrom("class");
            setPhylum(v);
          }}
          disabled={phylums.length === 0}
        >
          <SelectTrigger className={`mt-1 ${selectCls}`}>
            <SelectValue placeholder="Selecionar filo" />
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
