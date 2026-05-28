import {
  AlertTriangle,
  Package,
  PackageCheck,
  Search,
  TrendingUp,
  X,
} from "lucide-react";
import { FormProduto } from "../components/FormProduto";
import { Resumo } from "../components/Resumo";
import { Tabela } from "../components/Tabela";
import { StatCard, Input, Select } from "../components/ui";
import { useEstoque } from "../hooks/useEstoque";
import { brl, num } from "../utils/format";

const CATEGORIAS = [
  "OVERSIZED BRASIL",
  "OVERSIZED NORMAL",
  "CONJUNTO NIKE TEECH",
  "CONJUNTO FINO LACOSTE",
  "CONJUNTO FINO NIKE",
  "CALÇA FEMININA",
  "CALÇA MASCULINA",
];

export default function Dashboard() {
  const {
    lista, dashboard, loading, busy,
    search, setSearch,
    categoria, setCategoria,
    sortField, sortDir, sort,
    adicionar, vender, deletar,
  } = useEstoque();

  const alertas = dashboard?.estoque_baixo.length ?? 0;

  return (
    <div className="min-h-screen bg-bg-base text-tx-primary font-sans antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-bg-border bg-bg-base/90 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-tx-primary">
              EstoqueOS
            </span>
          </div>

          {alertas > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-danger bg-danger-muted ring-1 ring-danger-ring px-3 py-1.5 rounded-full">
              <AlertTriangle className="w-3.5 h-3.5" />
              {alertas} {alertas === 1 ? "item crítico" : "itens críticos"}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">

        {/* ── Métricas ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-bg-surface border border-bg-border rounded-lg p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-md bg-bg-overlay" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-2.5 w-20 rounded-sm bg-bg-overlay" />
                    <div className="h-5 w-28 rounded-sm bg-bg-overlay" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <StatCard label="Produtos"     value={num(dashboard?.total_produtos ?? 0)} sub="itens distintos"      icon={PackageCheck} variant="accent"  />
              <StatCard label="Peças"         value={num(dashboard?.total_pecas ?? 0)}    sub="unidades em estoque" icon={Package}      variant="ok"     />
              <StatCard label="Valor total"   value={brl(dashboard?.total_valor ?? 0)}    sub="estoque valorizado"  icon={TrendingUp}   variant="default" />
              <StatCard label="Estoque baixo" value={num(alertas)}                        sub={alertas === 0 ? "tudo ok" : "≤ 3 unidades"} icon={AlertTriangle} variant={alertas > 0 ? "danger" : "default"} />
            </>
          )}
        </section>

        {/* ── Formulário ── */}
        <FormProduto onSubmit={adicionar} />

        {/* ── Filtros ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tx-muted pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nome, cor, tamanho..."
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-tx-muted hover:text-tx-primary transition-colors"
                aria-label="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <Select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-auto min-w-[180px]"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          {(search || categoria) && (
            <button
              onClick={() => { setSearch(""); setCategoria(""); }}
              className="text-xs text-tx-muted hover:text-tx-primary border border-bg-border px-3 h-9 rounded-md transition-colors"
            >
              Limpar
            </button>
          )}

          <span className="ml-auto text-xs text-tx-muted">
            {lista.length} {lista.length === 1 ? "produto" : "produtos"}
          </span>
        </div>

        {/* ── Tabela ── */}
        <Tabela
          lista={lista}
          loading={loading}
          busy={busy}
          sortField={sortField}
          sortDir={sortDir}
          onSort={sort}
          onVender={vender}
          onDeletar={deletar}
        />

        {/* ── Resumo por categoria ── */}
        {!loading && dashboard && (
          <Resumo
            dados={dashboard.por_categoria}
            totalValor={dashboard.total_valor}
          />
        )}
      </main>

      <footer className="border-t border-bg-border mt-16 py-5 text-center">
        <span className="text-2xs text-tx-muted tracking-wider uppercase">
          EstoqueOS · Sistema de controle de estoque
        </span>
      </footer>
    </div>
  );
}
