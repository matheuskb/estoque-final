import { AlertTriangle, ArrowUpDown, ChevronDown, ChevronUp, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Perfume, SortDir, SortFieldPerfume } from "../types";
import { brl, stockLevel } from "../utils/format";
import { Modal } from "./Modal";
import { Badge, Button } from "./ui";

function Th({ label, field, active, dir, onSort, align = "left" }: {
  label: string; field: SortFieldPerfume; active: SortFieldPerfume; dir: SortDir;
  onSort: (f: SortFieldPerfume) => void; align?: "left" | "right" | "center";
}) {
  return (
    <th className={`px-4 py-3 text-2xs font-semibold uppercase tracking-widest text-tx-muted cursor-pointer select-none hover:text-tx-primary transition-colors text-${align}`} onClick={() => onSort(field)}>
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""}`}>
        {label}
        {field === active ? (dir === "asc" ? <ChevronUp className="w-3 h-3 text-accent" /> : <ChevronDown className="w-3 h-3 text-accent" />) : <ArrowUpDown className="w-3 h-3 opacity-25" />}
      </span>
    </th>
  );
}

function SkeletonRow() {
  return <tr className="border-b border-bg-border">{Array.from({ length: 7 }).map((_, i) => (<td key={i} className="px-4 py-3"><div className="h-3.5 rounded-sm bg-bg-raised animate-pulse" style={{ width: `${35 + (i * 17) % 45}%` }} /></td>))}</tr>;
}

interface Props {
  lista: Perfume[]; loading: boolean; busy: number | null;
  sortField: SortFieldPerfume; sortDir: SortDir;
  onSort: (f: SortFieldPerfume) => void;
  onVender: (id: number) => void;
  onDeletar: (id: number, nome: string) => void;
}

export function TabelaPerfume({ lista, loading, busy, sortField, sortDir, onSort, onVender, onDeletar }: Props) {
  const [confirm, setConfirm] = useState<{ id: number; nome: string } | null>(null);
  const totalQtd = lista.reduce((s, p) => s + p.quantidade, 0);
  const totalVal = lista.reduce((s, p) => s + p.total, 0);

  return (
    <>
      {confirm && <Modal nome={confirm.nome} label="perfume" onConfirm={() => { onDeletar(confirm.id, confirm.nome); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
      <div className="overflow-x-auto rounded-lg border border-bg-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-raised">
            <tr className="border-b border-bg-border">
              <Th label="#"         field="id"         active={sortField} dir={sortDir} onSort={onSort} />
              <Th label="Nome"      field="nome"       active={sortField} dir={sortDir} onSort={onSort} />
              <Th label="Categoria" field="categoria"  active={sortField} dir={sortDir} onSort={onSort} />
              <Th label="Preço"     field="preco"      active={sortField} dir={sortDir} onSort={onSort} align="right" />
              <Th label="Qtd"       field="quantidade" active={sortField} dir={sortDir} onSort={onSort} align="center" />
              <Th label="Total"     field="total"      active={sortField} dir={sortDir} onSort={onSort} align="right" />
              <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-widest text-ok text-center">Venda</th>
              <th className="px-4 py-3 text-2xs font-semibold uppercase tracking-widest text-danger text-center">Rem.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />) :
             lista.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-14"><div className="flex flex-col items-center gap-2 text-tx-muted"><AlertTriangle className="w-7 h-7 opacity-40" /><span className="text-sm">Nenhum perfume encontrado</span></div></td></tr>
            ) : lista.map((p) => {
              const level = stockLevel(p.quantidade);
              const isBusy = busy === p.id;
              const bv = level === "ok" ? "ok" : level === "low" ? "warn" : "danger";
              return (
                <tr key={p.id} className={`border-b border-bg-border transition-colors hover:bg-bg-raised ${isBusy ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-xs text-tx-muted">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-tx-primary max-w-[200px] truncate" title={p.nome}>{p.nome}</td>
                  <td className="px-4 py-3"><Badge>{p.categoria}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-tx-secondary">{brl(p.preco)}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={bv}>{level === "critical" && <AlertTriangle className="w-2.5 h-2.5" />}{p.quantidade}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-tx-primary">{brl(p.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="sell" size="sm" loading={isBusy} onClick={() => onVender(p.id)}>
                      <ShoppingCart className="w-3 h-3" />Vender
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="danger" size="icon" disabled={isBusy} onClick={() => setConfirm({ id: p.id, nome: p.nome })} aria-label="Remover">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {!loading && lista.length > 0 && (
              <tr className="border-t-2 border-bg-muted bg-bg-raised">
                <td colSpan={4} className="px-4 py-3 text-2xs font-semibold uppercase tracking-widest text-tx-muted">Total · {lista.length} {lista.length === 1 ? "perfume" : "perfumes"}</td>
                <td className="px-4 py-3 text-center font-mono font-semibold text-tx-primary text-sm">{totalQtd}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-accent text-sm">{brl(totalVal)}</td>
                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
