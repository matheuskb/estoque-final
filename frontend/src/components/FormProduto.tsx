import { PackagePlus, X } from "lucide-react";
import { useState } from "react";
import type { NovoProduto } from "../types";
import { Button, Input, Label, Select } from "./ui";

const CATEGORIAS = [
  "OVERSIZED BRASIL",
  "OVERSIZED NORMAL",
  "CONJUNTO NIKE TEECH",
  "CONJUNTO FINO LACOSTE",
  "CONJUNTO FINO NIKE",
  "CALÇA FEMININA",
  "CALÇA MASCULINA",
];

const EMPTY: NovoProduto = {
  nome: "", categoria: CATEGORIAS[0],
  cor: "", tamanho: "", preco: "", quantidade: "",
};

interface Field { key: keyof NovoProduto; label: string; placeholder: string; type?: string; step?: string; min?: string; span?: number }

const FIELDS: Field[] = [
  { key: "nome",       label: "Nome",       placeholder: "Camiseta NYC",  span: 2 },
  { key: "categoria",  label: "Categoria",  placeholder: "",              span: 2 },
  { key: "cor",        label: "Cor",        placeholder: "Preta" },
  { key: "tamanho",    label: "Tamanho",    placeholder: "GG" },
  { key: "preco",      label: "Preço",      placeholder: "0,00", type: "number", step: "0.01", min: "0" },
  { key: "quantidade", label: "Quantidade", placeholder: "1",    type: "number", min: "1" },
];

export function FormProduto({
  onSubmit,
}: {
  onSubmit: (form: NovoProduto) => Promise<void>;
}) {
  const [form, setForm]     = useState<NovoProduto>(EMPTY);
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);

  const set =
    (k: keyof NovoProduto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
      setForm(EMPTY);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="primary"
        onClick={() => setOpen((o) => !o)}
      >
        <PackagePlus className="w-4 h-4" />
        Adicionar produto
      </Button>

      {open && (
        <div className="mt-4 bg-bg-surface border border-bg-border rounded-lg p-5 animate-slide-up">
          {/* header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-tx-primary flex items-center gap-2">
              <PackagePlus className="w-4 h-4 text-accent" />
              Novo produto
            </h3>
            <button
              onClick={() => setOpen(false)}
              className="text-tx-muted hover:text-tx-primary transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
              {FIELDS.map((f) => (
                <div
                  key={f.key}
                  className={`flex flex-col gap-1.5 ${f.span === 2 ? "col-span-2" : ""}`}
                >
                  <Label>{f.label}</Label>
                  {f.key === "categoria" ? (
                    <Select value={form.categoria} onChange={set("categoria")} required>
                      {CATEGORIAS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      type={f.type ?? "text"}
                      step={f.step}
                      min={f.min}
                      placeholder={f.placeholder}
                      value={form[f.key]}
                      onChange={set(f.key)}
                      required
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" loading={loading}>
                <PackagePlus className="w-3.5 h-3.5" />
                Salvar
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
