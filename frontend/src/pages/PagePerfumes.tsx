import { AlertTriangle, BarChart3, Package, PackageCheck, Search, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { Financeiro } from "../components/Financeiro";
import { FormPerfume } from "../components/FormPerfume";
import { Resumo } from "../components/Resumo";
import { TabelaPerfume } from "../components/TabelaPerfume";
import { Input, Select, SkeletonStats, StatCard } from "../components/ui";
import { usePerfumes } from "../hooks/usePerfumes";
import { brl, num } from "../utils/format";

const CATEGORIAS = ["IMPORTADO MASCULINO","IMPORTADO FEMININO","ARABE MASCULINO","ARABE FEMININO"];
type Aba = "estoque" | "financeiro";

export function PagePerfumes() {
  const { lista, dashboard, loading, busy, search, setSearch, categoria, setCategoria, sortField, sortDir, sort, adicionar, vender, deletar } = usePerfumes();
  const [aba, setAba] = useState<Aba>("estoque");
  const alertas = dashboard?.estoque_baixo.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-bg-border pb-0">
        <button onClick={() => setAba("estoque")}
          className={`flex items-center gap-1.5 px-4 h-9 text-sm font-medium border-b-2 transition-all ${aba === "estoque" ? "border-accent text-accent" : "border-transparent text-tx-secondary hover:text-tx-primary"}`}>
          <Package className="w-3.5 h-3.5" />Estoque
        </button>
        <button onClick={() => setAba("financeiro")}
          className={`flex items-center gap-1.5 px-4 h-9 text-sm font-medium border-b-2 transition-all ${aba === "financeiro" ? "border-accent text-accent" : "border-transparent text-tx-secondary hover:text-tx-primary"}`}>
          <BarChart3 className="w-3.5 h-3.5" />Financeiro
        </button>
      </div>

      {aba === "estoque" ? (
        <div className="space-y-8">
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? <SkeletonStats /> : (
              <>
                <StatCard label="Perfumes"      value={num(dashboard?.total_produtos ?? 0)} sub="itens distintos"    icon={PackageCheck} variant="accent" />
                <StatCard label="Unidades"      value={num(dashboard?.total_pecas ?? 0)}    sub="em estoque"         icon={Package}      variant="ok" />
                <StatCard label="Valor total"   value={brl(dashboard?.total_valor ?? 0)}    sub="estoque valorizado" icon={TrendingUp}   variant="default" />
                <StatCard label="Estoque baixo" value={num(alertas)} sub={alertas === 0 ? "tudo ok" : "≤ 3 unidades"} icon={AlertTriangle} variant={alertas > 0 ? "danger" : "default"} />
              </>
            )}
          </section>
          <FormPerfume onSubmit={adicionar} />
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tx-muted pointer-events-none" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar perfume ou categoria..." className="pl-9 pr-8" />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <Select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-auto min-w-[180px]">
              <option value="">Todas as categorias</option>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            {(search || categoria) && <button onClick={() => { setSearch(""); setCategoria(""); }} className="text-xs text-tx-muted hover:text-tx-primary border border-bg-border px-3 h-9 rounded-md transition-colors">Limpar</button>}
            <span className="ml-auto text-xs text-tx-muted">{lista.length} {lista.length === 1 ? "perfume" : "perfumes"}</span>
          </div>
          <TabelaPerfume lista={lista} loading={loading} busy={busy} sortField={sortField} sortDir={sortDir} onSort={sort} onVender={vender} onDeletar={deletar} />
          {!loading && dashboard && <Resumo dados={dashboard.por_categoria} totalValor={dashboard.total_valor} />}
        </div>
      ) : (
        <Financeiro modulo="PERFUMES" />
      )}
    </div>
  );
}
