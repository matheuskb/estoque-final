import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import type {
  DashboardData,
  NovoProduto,
  Produto,
  SortDir,
  SortField,
} from "../types";

export function useEstoque() {
  const [produtos, setProdutos]     = useState<Produto[]>([]);
  const [dashboard, setDashboard]   = useState<DashboardData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [busy, setBusy]             = useState<number | null>(null);
  const [search, setSearch]         = useState("");
  const [categoria, setCategoria]   = useState("");
  const [sortField, setSortField]   = useState<SortField>("categoria");
  const [sortDir, setSortDir]       = useState<SortDir>("asc");

  // ── fetch inicial ──────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [prods, dash] = await Promise.all([
        api.produtos.listar(),
        api.dashboard(),
      ]);
      setProdutos(prods);
      setDashboard(dash);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── refetch do dashboard após mutações ────────────────────────────────────
  const refreshDash = useCallback(async () => {
    const dash = await api.dashboard();
    setDashboard(dash);
  }, []);

  // ── adicionar ─────────────────────────────────────────────────────────────
  const adicionar = useCallback(async (form: NovoProduto) => {
    const novo = await api.produtos.criar(form);
    setProdutos((p) => [...p, novo]);
    refreshDash();
    toast.success(`"${novo.nome}" adicionado ao estoque`);
  }, [refreshDash]);

  // ── vender ────────────────────────────────────────────────────────────────
  const vender = useCallback(async (id: number) => {
    setBusy(id);
    try {
      const res = await api.produtos.vender(id);
      if (res.deleted) {
        setProdutos((p) => p.filter((x) => x.id !== id));
        toast.success("Última unidade vendida — item removido");
      } else {
        setProdutos((p) =>
          p.map((x) => (x.id === id ? (res as Produto) : x))
        );
        toast.success("Venda registrada");
      }
      refreshDash();
    } catch {
      toast.error("Erro ao registrar venda");
    } finally {
      setBusy(null);
    }
  }, [refreshDash]);

  // ── deletar ───────────────────────────────────────────────────────────────
  const deletar = useCallback(async (id: number, nome: string) => {
    setBusy(id);
    try {
      await api.produtos.deletar(id);
      setProdutos((p) => p.filter((x) => x.id !== id));
      refreshDash();
      toast.success(`"${nome}" removido`);
    } catch {
      toast.error("Erro ao remover produto");
    } finally {
      setBusy(null);
    }
  }, [refreshDash]);

  // ── sort ──────────────────────────────────────────────────────────────────
  const sort = useCallback((field: SortField) => {
    setSortField((prev) => {
      if (prev === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else setSortDir("asc");
      return field;
    });
  }, []);

  // ── lista filtrada + ordenada (memo) ──────────────────────────────────────
  const lista = useMemo(() => {
    const q = search.toLowerCase();
    return produtos
      .filter((p) => {
        const matchSearch =
          !q ||
          p.nome.toLowerCase().includes(q) ||
          p.cor.toLowerCase().includes(q) ||
          p.tamanho.toLowerCase().includes(q);
        const matchCat = !categoria || p.categoria === categoria;
        return matchSearch && matchCat;
      })
      .sort((a, b) => {
        const va = a[sortField];
        const vb = b[sortField];
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [produtos, search, categoria, sortField, sortDir]);

  return {
    lista, dashboard, loading, busy,
    search, setSearch,
    categoria, setCategoria,
    sortField, sortDir, sort,
    adicionar, vender, deletar,
  };
}
