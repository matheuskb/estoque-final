// ── Módulo compartilhado ────────────────────────────────
export type SortDir = "asc" | "desc";

export interface CategoriaStat {
  categoria: string;
  qtd: number;
  valor: number;
}

export interface DashboardData {
  total_produtos: number;
  total_pecas: number;
  total_valor: number;
  estoque_baixo: (Roupa | Perfume)[];
  por_categoria: CategoriaStat[];
}

export interface NovoProdutoBase {
  nome: string;
  categoria: string;
  preco: string;
  quantidade: string;
}

// ── Roupas ──────────────────────────────────────────────
export interface Roupa {
  id: number;
  nome: string;
  categoria: string;
  cor: string;
  tamanho: string;
  preco: number;
  quantidade: number;
  total: number;
  created_at: string;
}

export interface NovaRoupa extends NovoProdutoBase {
  cor: string;
  tamanho: string;
}

export type SortFieldRoupa = keyof Roupa;

// ── Perfumes ────────────────────────────────────────────
export interface Perfume {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  quantidade: number;
  total: number;
  created_at: string;
}

export type NovoPerfume = NovoProdutoBase;
export type SortFieldPerfume = keyof Perfume;

// ── Módulo ativo ────────────────────────────────────────
export type Modulo = "roupas" | "perfumes";
