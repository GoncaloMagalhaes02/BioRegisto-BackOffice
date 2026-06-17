import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TaxLevelPicker from "@/components/TaxLevelPicker";

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

  useEffect(() => {
    if (!kingdom) return;
    supabase.rpc("get_phylums", { p_kingdom: kingdom }).then(({ data }) => {
      setPhylums(data || []);
    });
  }, [kingdom]);

  // Pré-preencher (uma vez)
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

  return (
    <div className="space-y-3">
      <TaxLevelPicker
        label="Filo"
        placeholder="Selecionar filo"
        items={phylums}
        value={phylum}
        onChange={(v) => {
          resetFrom("class");
          setPhylum(v);
        }}
        disabled={phylums.length === 0}
        createRpc="create_phylum"
        createParams={{ p_kingdom: kingdom }}
        onCreated={(item) => setPhylums((prev) => [...prev, item])}
      />

      <TaxLevelPicker
        label="Classe"
        placeholder="Selecionar classe"
        items={classes}
        value={classId}
        onChange={(v) => {
          resetFrom("order");
          setClassId(v);
        }}
        disabled={!phylum}
        createRpc="create_class"
        createParams={{ p_phylum_id: phylum }}
        onCreated={(item) => setClasses((prev) => [...prev, item])}
      />

      <TaxLevelPicker
        label="Ordem"
        placeholder="Selecionar ordem"
        items={orders}
        value={order}
        onChange={(v) => {
          resetFrom("family");
          setOrder(v);
        }}
        disabled={!classId}
        createRpc="create_order"
        createParams={{ p_class_id: classId }}
        onCreated={(item) => setOrders((prev) => [...prev, item])}
      />

      <TaxLevelPicker
        label="Família"
        placeholder="Selecionar família"
        items={families}
        value={family}
        onChange={(v) => {
          resetFrom("genus");
          setFamily(v);
        }}
        disabled={!order}
        createRpc="create_family"
        createParams={{ p_order_id: order }}
        onCreated={(item) => setFamilies((prev) => [...prev, item])}
      />

      <TaxLevelPicker
        label="Género"
        placeholder="Selecionar género"
        items={genera}
        value={genus}
        onChange={setGenus}
        disabled={!family}
        createRpc="create_genus"
        createParams={{ p_family_id: family }}
        onCreated={(item) => setGenera((prev) => [...prev, item])}
      />
    </div>
  );
}
