import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TaxLevelPicker from "@/components/TaxLevelPicker";

interface TaxItem {
  id: string;
  name: string;
}

interface TaxonomyCascadeProps {
  kingdom: string;
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

  // Carregar filos ao mudar reino
  useEffect(() => {
    if (!kingdom) {
      setPhylums([]);
      return;
    }
    resetFrom("phylum");
    supabase
      .rpc("get_phylums", { p_kingdom: kingdom })
      .then(({ data }) => setPhylums(data || []));
  }, [kingdom]);

  // Cascata
  useEffect(() => {
    if (!phylum) return;
    console.log("A carregar classes para o filo:", phylum);
    supabase
      .rpc("get_classes", { p_phylum_id: phylum })
      .then(({ data, error }) => {
        console.log("Classes recebidas:", data, "erro:", error);
        setClasses(data || []);
      });
  }, [phylum]);

  useEffect(() => {
    if (!classId) return;
    supabase
      .rpc("get_orders", { p_class_id: classId })
      .then(({ data }) => setOrders(data || []));
  }, [classId]);

  useEffect(() => {
    if (!order) return;
    supabase
      .rpc("get_families", { p_order_id: order })
      .then(({ data }) => setFamilies(data || []));
  }, [order]);

  useEffect(() => {
    if (!family) return;
    supabase
      .rpc("get_genera", { p_family_id: family })
      .then(({ data }) => setGenera(data || []));
  }, [family]);

  useEffect(() => {
    onGenusSelected(genus || null);
  }, [genus]);

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

  return (
    <div className="space-y-3">
      <TaxLevelPicker
        label="Filo"
        placeholder={kingdom ? "Selecionar filo" : "Escolhe o reino primeiro"}
        items={phylums}
        value={phylum}
        onChange={(v) => {
          resetFrom("class");
          setPhylum(v);
        }}
        disabled={!kingdom}
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
