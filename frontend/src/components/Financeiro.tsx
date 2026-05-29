import {
  ArrowDownCircle, ArrowUpCircle, Edit2, Plus,
  TrendingDown, TrendingUp, Trash2, X,
} from "lucide-react";
import { useState } from "react";
import { useFinanceiro } from "../hooks/useFinanceiro";
import type { Investimento, NovoInvestimento } from "../types";
import { brl } from "../utils/format";
import { Badge, Button, Input, Label } from "./ui";

// ── Card financeiro ────────────────────────────────────────────────────────
function FinCard({
  label, total, mes, positivo, icon: Icon,
}: {
  label: string; total: number; mes: number;
  positivo?: boolean; icon: React.ElementType;
}) {
  const isLucro  = positivo !== undefined;
  const cor      = isLucro ? (total >= 0 ? "text-ok" : "text-danger") : label === "Investimentos" ? "text-warn" : "text-accent";
  const bgCor    = isLucro ? (total >= 0 ? "bg-ok-muted" : "bg-danger-muted") : label === "Investimentos" ? "bg-warn-muted" : "bg-accent-muted";
  const mesCor   = isLucro ? (mes >= 0 ? "text-ok" : "text-danger") : cor;

  return (
    <div className="bg-bg-surface border border-bg-border rounded-lg p-5 flex flex-col gap-3 animate-slide-up">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-md ${bgCor} shrink-0`}>
          <Icon className={`w-4 h-4 ${cor}`} strokeWidth={1.75} />
        </div>
        <span className="text-2xs font-semibold uppercase tracking-widest text-tx-muted">{label}</span>
      </div>
      <div>
        <p className={`text-2xl font-semibold leading-none tracking-tight ${cor}`}>{brl(total)}</p>
        <p className="text-xs text-tx-muted mt-1">total acumulado</p>
      </div>
      <div className="border-t border-bg-border pt-3">
        <p className={`text-sm font-medium ${mesCor}`}>{brl(mes)}</p>
        <p className="text-2xs text-tx-muted">este mês</p>
      </div>
    </div>
  );
}

// ── Formulário de investimento ─────────────────────────────────────────────
function FormInvestimento({
  onSubmit, inicial, onCancel,
}: {
  onSubmit: (f: NovoInvestimento) => Promise<void>;
  inicial?: Investimento;
  onCancel: () => void;
}) {
  const hoje = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<NovoInvestimento>({
    nome:  inicial?.nome  ?? "",
    valor: inicial ? String(inicial.valor) : "",
    data:  inicial?.data  ?? hoje,
  });
  const [loading, setLoading] = useState(false);
  const set = (k: keyof NovoInvestimento) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-raised border border-bg-border rounded-lg p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-tx-primary flex items-center gap-2">
          <Plus className="w-4 h-4 text-accent" />
          {inicial ? "Editar investimento" : "Novo investimento"}
        </span>
        <button onClick={onCancel} type="button" className="text-tx-muted hover:text-tx-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="sm:col-span-1 flex flex-col gap-1.5">
          <Label>Nome</Label>
          <Input placeholder="Ex: Compra de camisetas" value={form.nome} onChange={set("nome")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Valor (R$)</Label>
          <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.valor} onChange={set("valor")} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Data</Label>
          <Input type="date" value={form.data} onChange={set("data")} required />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" size="sm" loading={loading}>
          <Plus className="w-3.5 h-3.5" />{inicial ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </form>
  );
}

// ── Filtros ────────────────────────────────────────────────────────────────
function Filtros({
  label, mes, ano, meses, anos,
  onMes, onAno,
}: {
  label: string; mes: string; ano: string;
  meses: { v: string; l: string }[]; anos: string[];
  onMes: (v: string) => void; onAno: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-2xs font-semibold uppercase tracking-widest text-tx-muted">{label}:</span>
      <div className="flex gap-1 flex-wrap">
        {meses.map(m => (
          <button key={m.v} onClick={() => onMes(m.v)}
            className={`px-2 h-6 rounded-sm text-2xs font-medium transition-all ${mes === m.v ? "bg-accent text-white" : "bg-bg-raised text-tx-secondary hover:text-tx-primary border border-bg-border"}`}>
            {m.l}
          </button>
        ))}
      </div>
      <select value={ano} onChange={e => onAno(e.target.value)}
        className="bg-bg-raised border border-bg-border text-tx-primary text-xs rounded-sm h-6 px-2 focus:outline-none focus:ring-1 focus:ring-accent">
        <option value="">Todos os anos</option>
        {anos.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────
export function Financeiro({ modulo }: { modulo: string }) {
  const {
    stats, investimentos, entradas, loading,
    editando, setEditando,
    filtroMesInv, setFiltroMesInv, filtroAnoInv, setFiltroAnoInv,
    filtroMesEnt, setFiltroMesEnt, filtroAnoEnt, setFiltroAnoEnt,
    totalInvFiltrado, totalEntFiltrado,
    adicionarInv, editarInv, deletarInv, deletarEntrada,
    meses, anos,
  } = useFinanceiro(modulo);

  const [showFormInv, setShowFormInv] = useState(false);

  const fmtData = (d: string) => {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[0,1,2].map(i => (
            <div key={i} className="bg-bg-surface border border-bg-border rounded-lg p-5 animate-pulse h-36">
              <div className="w-8 h-8 bg-bg-raised rounded-md mb-3" />
              <div className="h-6 w-24 bg-bg-raised rounded mb-2" />
              <div className="h-4 w-16 bg-bg-raised rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FinCard
          label="Investimentos"
          total={stats?.investimentos.total ?? 0}
          mes={stats?.investimentos.mes ?? 0}
          icon={ArrowUpCircle}
        />
        <FinCard
          label="Entradas"
          total={stats?.entradas.total ?? 0}
          mes={stats?.entradas.mes ?? 0}
          icon={ArrowDownCircle}
        />
        <FinCard
          label="Lucro"
          total={stats?.lucro.total ?? 0}
          mes={stats?.lucro.mes ?? 0}
          positivo={(stats?.lucro.total ?? 0) >= 0}
          icon={(stats?.lucro.total ?? 0) >= 0 ? TrendingUp : TrendingDown}
        />
      </div>

      {/* ── INVESTIMENTOS ── */}
      <div className="bg-bg-surface border border-bg-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-warn" />
            <span className="text-sm font-semibold text-tx-primary">Investimentos</span>
            {investimentos.length > 0 && (
              <Badge variant="warn">{investimentos.length}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Filtros label="Filtrar" mes={filtroMesInv} ano={filtroAnoInv}
              meses={meses} anos={anos}
              onMes={setFiltroMesInv} onAno={setFiltroAnoInv} />
            <Button size="sm" variant="primary" onClick={() => { setShowFormInv(true); setEditando(null); }}>
              <Plus className="w-3.5 h-3.5" />Adicionar
            </Button>
          </div>
        </div>

        {(showFormInv && !editando) && (
          <div className="p-4 border-b border-bg-border">
            <FormInvestimento
              onSubmit={async (f) => { await adicionarInv(f); setShowFormInv(false); }}
              onCancel={() => setShowFormInv(false)}
            />
          </div>
        )}

        {editando && (
          <div className="p-4 border-b border-bg-border">
            <FormInvestimento
              inicial={editando}
              onSubmit={async (f) => { await editarInv(editando.id, f); }}
              onCancel={() => setEditando(null)}
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-raised">
              <tr className="border-b border-bg-border">
                <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-widest text-tx-muted">Nome</th>
                <th className="px-4 py-2.5 text-right text-2xs font-semibold uppercase tracking-widest text-tx-muted">Valor</th>
                <th className="px-4 py-2.5 text-center text-2xs font-semibold uppercase tracking-widest text-tx-muted">Data</th>
                <th className="px-4 py-2.5 text-center text-2xs font-semibold uppercase tracking-widest text-tx-muted w-20">Ações</th>
              </tr>
            </thead>
            <tbody>
              {investimentos.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-sm text-tx-muted">Nenhum investimento registrado</td></tr>
              ) : investimentos.map(inv => (
                <tr key={inv.id} className="border-b border-bg-border hover:bg-bg-raised transition-colors">
                  <td className="px-4 py-3 text-tx-primary font-medium">{inv.nome}</td>
                  <td className="px-4 py-3 text-right font-mono text-warn font-semibold">{brl(inv.valor)}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-tx-secondary">{fmtData(inv.data)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditando(inv); setShowFormInv(false); }}
                        className="p-1.5 rounded-md text-tx-muted hover:text-accent hover:bg-accent-muted transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deletarInv(inv.id)}
                        className="p-1.5 rounded-md text-tx-muted hover:text-danger hover:bg-danger-muted transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {investimentos.length > 0 && (
                <tr className="border-t-2 border-bg-muted bg-bg-raised">
                  <td className="px-4 py-3 text-2xs font-semibold uppercase tracking-widest text-tx-muted">Total filtrado</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-warn">{brl(totalInvFiltrado)}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── ENTRADAS ── */}
      <div className="bg-bg-surface border border-bg-border rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-tx-primary">Entradas (Vendas)</span>
            {entradas.length > 0 && (
              <Badge variant="accent">{entradas.length}</Badge>
            )}
          </div>
          <Filtros label="Filtrar" mes={filtroMesEnt} ano={filtroAnoEnt}
            meses={meses} anos={anos}
            onMes={setFiltroMesEnt} onAno={setFiltroAnoEnt} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-raised">
              <tr className="border-b border-bg-border">
                <th className="px-4 py-2.5 text-left text-2xs font-semibold uppercase tracking-widest text-tx-muted">Produto</th>
                <th className="px-4 py-2.5 text-right text-2xs font-semibold uppercase tracking-widest text-tx-muted">Valor</th>
                <th className="px-4 py-2.5 text-center text-2xs font-semibold uppercase tracking-widest text-tx-muted">Data</th>
              </tr>
            </thead>
            <tbody>
              {entradas.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-sm text-tx-muted">Nenhuma entrada registrada — as vendas aparecem aqui automaticamente</td></tr>
              ) : entradas.map(ent => (
                <tr key={ent.id} className="border-b border-bg-border hover:bg-bg-raised transition-colors">
                  <td className="px-4 py-3 text-tx-primary font-medium max-w-[200px] truncate">{ent.produto}</td>
                  <td className="px-4 py-3 text-right font-mono text-accent font-semibold">{brl(ent.valor)}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-tx-secondary">{fmtData(ent.data)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deletarEntrada(ent.id)}
                      className="p-1.5 rounded-md text-tx-muted hover:text-danger hover:bg-danger-muted transition-all"
                      title="Remover entrada">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {entradas.length > 0 && (
                <tr className="border-t-2 border-bg-muted bg-bg-raised">
                  <td className="px-4 py-3 text-2xs font-semibold uppercase tracking-widest text-tx-muted">Total filtrado</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-accent">{brl(totalEntFiltrado)}</td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
