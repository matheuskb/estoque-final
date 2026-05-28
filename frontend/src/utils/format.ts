export const brl = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export const num = (v: number) =>
  new Intl.NumberFormat("pt-BR").format(v);

export const stockLevel = (qtd: number): "ok" | "low" | "critical" => {
  if (qtd <= 1) return "critical";
  if (qtd <= 3) return "low";
  return "ok";
};
