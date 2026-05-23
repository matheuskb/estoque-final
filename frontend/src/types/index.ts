export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  cor: string;
  tamanho: string;
  preco: number;
  quantidade: number;
  total: number;
}

export interface CategoriaStat {
  categoria: string;
  qtd: number;
  valor: number;
}

export interface DashboardData {
  total_produtos: number;
  total_pecas: number;
  total_valor: number;
  estoque_baixo: Produto[];
  por_categoria: CategoriaStat[];
}

export interface NovoProduto {
  nome: string;
  categoria: string;
  cor: string;
  tamanho: string;
  preco: string;
  quantidade: string;
}

export type SortField = keyof Produto;
export type SortDir   = "asc" | "desc";
