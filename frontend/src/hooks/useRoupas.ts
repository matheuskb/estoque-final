import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { apiRoupas } from "../services/api";
import type { DashboardData, NovaRoupa, Roupa, SortDir, SortFieldRoupa } from "../types";

export function useRoupas() {
  const [itens, setItens]         = useState<Roupa[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [busy, setBusy]           = useState<number | null>(null);
  const [search, setSearch]       = useState("");
  const [categoria, setCategoria] = useState("");
  const [sortField, setSortField] = useState<SortFieldRoupa>("categoria");
  const [sortDir, setSortDir]     = useState<SortDir>("asc");

  const refreshDash = useCallback(async () => {
    setDashboard(await apiRoupas.dashboard());
  }, []);

  const load = useCallback(async () => {
    try {
      const [prods, dash] = await Promise.all([apiRoupas.listar(), apiRoupas.dashboard()]);
      setItens(prods);
      setDashboard(dash);
    } catch { toast.error("Erro ao carregar roupas"); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const adicionar = useCallback(async (form: NovaRoupa) => {
    const novo = await apiRoupas.criar(form);
    setItens((p) => [...p, novo]);
    refreshDash();
    toast.success(`"${novo.nome}" adicionado`);
  }, [refreshDash]);

  const vender = useCallback(async (id: number) => {
    setBusy(id);
    try {
      const res = await apiRoupas.vender(id);
      if (res.deleted) {
        setItens((p) => p.filter((x) => x.id !== id));
        toast.success("Última unidade vendida");
      } else {
        setItens((p) => p.map((x) => (x.id === id ? (res as Roupa) : x)));
        toast.success("Venda registrada");
      }
      refreshDash();
    } catch { toast.error("Erro ao registrar venda"); }
    finally   { setBusy(null); }
  }, [refreshDash]);

  const deletar = useCallback(async (id: number, nome: string) => {
    setBusy(id);
    try {
      await apiRoupas.deletar(id);
      setItens((p) => p.filter((x) => x.id !== id));
      refreshDash();
      toast.success(`"${nome}" removido`);
    } catch { toast.error("Erro ao remover"); }
    finally   { setBusy(null); }
  }, [refreshDash]);

  const sort = useCallback((field: SortFieldRoupa) => {
    setSortField((prev) => {
      if (prev === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDir("asc");
      return field;
    });
  }, []);

  const lista = useMemo(() => {
    const q = search.toLowerCase();
    return itens
      .filter((p) => {
        const ms = !q || p.nome.toLowerCase().includes(q) || p.cor.toLowerCase().includes(q) || p.tamanho.toLowerCase().includes(q);
        return ms && (!categoria || p.categoria === categoria);
      })
      .sort((a, b) => {
        const va = a[sortField], vb = b[sortField];
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [itens, search, categoria, sortField, sortDir]);

  return { lista, dashboard, loading, busy, search, setSearch, categoria, setCategoria, sortField, sortDir, sort, adicionar, vender, deletar };
}
