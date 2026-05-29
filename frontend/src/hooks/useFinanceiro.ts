import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFinanceiro } from "../services/api";
import type { Entrada, FinanceiroStats, Investimento, NovoInvestimento } from "../types";

export function useFinanceiro(modulo: string) {
  const mod = modulo.toUpperCase();
  const anoAtual  = new Date().getFullYear().toString();
  const mesAtual  = String(new Date().getMonth() + 1).padStart(2, "0");

  const [stats, setStats]                 = useState<FinanceiroStats | null>(null);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [entradas, setEntradas]           = useState<Entrada[]>([]);
  const [loading, setLoading]             = useState(true);
  const [editando, setEditando]           = useState<Investimento | null>(null);

  const [filtroMesInv, setFiltroMesInv] = useState("");
  const [filtroAnoInv, setFiltroAnoInv] = useState(anoAtual);
  const [filtroMesEnt, setFiltroMesEnt] = useState("");
  const [filtroAnoEnt, setFiltroAnoEnt] = useState(anoAtual);

  const loadStats = useCallback(async () => {
    const s = await apiFinanceiro.stats(mod);
    setStats(s);
  }, [mod]);

  const loadInv = useCallback(async () => {
    const data = await apiFinanceiro.investimentos.listar(mod, filtroMesInv || undefined, filtroAnoInv || undefined);
    setInvestimentos(data);
  }, [mod, filtroMesInv, filtroAnoInv]);

  const loadEnt = useCallback(async () => {
    const data = await apiFinanceiro.entradas.listar(mod, filtroMesEnt || undefined, filtroAnoEnt || undefined);
    setEntradas(data);
  }, [mod, filtroMesEnt, filtroAnoEnt]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try { await Promise.all([loadStats(), loadInv(), loadEnt()]); }
    catch { toast.error("Erro ao carregar financeiro"); }
    finally { setLoading(false); }
  }, [loadStats, loadInv, loadEnt]);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { loadInv(); }, [loadInv]);
  useEffect(() => { loadEnt(); }, [loadEnt]);

  const adicionarInv = useCallback(async (form: NovoInvestimento) => {
    await apiFinanceiro.investimentos.criar(mod, form);
    await Promise.all([loadInv(), loadStats()]);
    toast.success("Investimento registrado");
  }, [mod, loadInv, loadStats]);

  const editarInv = useCallback(async (id: number, form: NovoInvestimento) => {
    await apiFinanceiro.investimentos.editar(id, form);
    await Promise.all([loadInv(), loadStats()]);
    setEditando(null);
    toast.success("Investimento atualizado");
  }, [loadInv, loadStats]);

  const deletarInv = useCallback(async (id: number) => {
    await apiFinanceiro.investimentos.deletar(id);
    await Promise.all([loadInv(), loadStats()]);
    toast.success("Investimento removido");
  }, [loadInv, loadStats]);

  const totalInvFiltrado = investimentos.reduce((s, i) => s + i.valor, 0);
  const totalEntFiltrado = entradas.reduce((s, e) => s + e.valor, 0);

  const meses = [
    { v: "", l: "Todos" },
    { v: "01", l: "Jan" },{ v: "02", l: "Fev" },{ v: "03", l: "Mar" },
    { v: "04", l: "Abr" },{ v: "05", l: "Mai" },{ v: "06", l: "Jun" },
    { v: "07", l: "Jul" },{ v: "08", l: "Ago" },{ v: "09", l: "Set" },
    { v: "10", l: "Out" },{ v: "11", l: "Nov" },{ v: "12", l: "Dez" },
  ];

  const anos = ["", anoAtual, String(Number(anoAtual) - 1), String(Number(anoAtual) - 2)].filter(Boolean);

  return {
    stats, investimentos, entradas, loading, editando, setEditando,
    filtroMesInv, setFiltroMesInv, filtroAnoInv, setFiltroAnoInv,
    filtroMesEnt, setFiltroMesEnt, filtroAnoEnt, setFiltroAnoEnt,
    totalInvFiltrado, totalEntFiltrado,
    adicionarInv, editarInv, deletarInv,
    meses, anos, mesAtual, anoAtual,
    refresh: loadAll,
  };
}
