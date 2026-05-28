import { PackagePlus, X } from "lucide-react";
import { useState } from "react";
import type { NovaRoupa } from "../types";
import { Button, Input, Label, Select } from "./ui";

const CATEGORIAS = [
  "OVERSIZED BRASIL", 
  "OVERSIZED NORMAL", 
  "CONJUNTO NIKE TEECH",
  "CONJUNTO FINO LACOSTE", 
  "CONJUNTO FINO NIKE", 
  "CALÇA JEANS FEMININA",
  "CALÇA JEANS MASCULINA"
];

const EMPTY: NovaRoupa = { nome: "", categoria: CATEGORIAS[0], cor: "", tamanho: "", preco: "", quantidade: "" };

export function FormRoupa({ onSubmit }: { onSubmit: (form: NovaRoupa) => Promise<void> }) {
  const [form, setForm]       = useState<NovaRoupa>(EMPTY);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof NovaRoupa) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await onSubmit(form); setForm(EMPTY); setOpen(false); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <Button variant="primary" onClick={() => setOpen((o) => !o)}>
        <PackagePlus className="w-4 h-4" />Adicionar roupa
      </Button>

      {open && (
        <div className="mt-4 bg-bg-surface border border-bg-border rounded-lg p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-tx-primary flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-accent" />Nova roupa
            </h3>
            <button onClick={() => setOpen(false)} className="text-tx-muted hover:text-tx-primary transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Nome</Label>
                <Input placeholder="Ex: Camiseta NYC" value={form.nome} onChange={set("nome")} required />
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label>Categoria</Label>
                <Select value={form.categoria} onChange={set("categoria")} required>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Cor</Label>
                <Input placeholder="Preta" value={form.cor} onChange={set("cor")} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Tamanho</Label>
                <Input placeholder="GG" value={form.tamanho} onChange={set("tamanho")} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" min="0" placeholder="0,00" value={form.preco} onChange={set("preco")} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Quantidade</Label>
                <Input type="number" min="1" placeholder="1" value={form.quantidade} onChange={set("quantidade")} required />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" size="sm" loading={loading}>
                <PackagePlus className="w-3.5 h-3.5" />Salvar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
