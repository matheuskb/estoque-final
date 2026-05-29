import axios from "axios";
import type { DashboardData, NovaRoupa, NovoPerfume, Perfume, Roupa } from "../types";

// Remove barra final do VITE_API_URL para evitar //api
const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const http = axios.create({
  baseURL: `${BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

export const apiRoupas = {
  listar: () =>
    http.get<Roupa[]>("/roupas").then((r) => r.data),

  criar: (form: NovaRoupa) =>
    http.post<Roupa>("/roupas", {
      nome:       form.nome,
      categoria:  form.categoria,
      cor:        form.cor,
      tamanho:    form.tamanho,
      preco:      parseFloat(form.preco),
      quantidade: parseInt(form.quantidade),
    }).then((r) => r.data),

  vender: (id: number) =>
    http.patch<Roupa & { deleted?: boolean }>(`/roupas/${id}/vender`).then((r) => r.data),

  deletar: (id: number) =>
    http.delete(`/roupas/${id}`).then((r) => r.data),

  dashboard: () =>
    http.get<DashboardData>("/roupas/dashboard").then((r) => r.data),
};

export const apiPerfumes = {
  listar: () =>
    http.get<Perfume[]>("/perfumes").then((r) => r.data),

  criar: (form: NovoPerfume) =>
    http.post<Perfume>("/perfumes", {
      nome:       form.nome,
      categoria:  form.categoria,
      preco:      parseFloat(form.preco),
      quantidade: parseInt(form.quantidade),
    }).then((r) => r.data),

  vender: (id: number) =>
    http.patch<Perfume & { deleted?: boolean }>(`/perfumes/${id}/vender`).then((r) => r.data),

  deletar: (id: number) =>
    http.delete(`/perfumes/${id}`).then((r) => r.data),

  dashboard: () =>
    http.get<DashboardData>("/perfumes/dashboard").then((r) => r.data),
};

export const apiFinanceiro = {
  stats: (modulo: string) =>
    http.get<import("../types").FinanceiroStats>(`/financeiro/${modulo}`).then(r => r.data),

  investimentos: {
    listar: (modulo: string, mes?: string, ano?: string) => {
      const params = new URLSearchParams({ modulo });
      if (mes) params.set("mes", mes);
      if (ano) params.set("ano", ano);
      return http.get<import("../types").Investimento[]>(`/investimentos?${params}`).then(r => r.data);
    },
    criar: (modulo: string, form: import("../types").NovoInvestimento) =>
      http.post<import("../types").Investimento>("/investimentos", { modulo, ...form, valor: parseFloat(form.valor) }).then(r => r.data),
    editar: (id: number, form: import("../types").NovoInvestimento) =>
      http.put<import("../types").Investimento>(`/investimentos/${id}`, { ...form, valor: parseFloat(form.valor) }).then(r => r.data),
    deletar: (id: number) =>
      http.delete(`/investimentos/${id}`).then(r => r.data),
  },

  entradas: {
    listar: (modulo: string, mes?: string, ano?: string) => {
      const params = new URLSearchParams({ modulo });
      if (mes) params.set("mes", mes);
      if (ano) params.set("ano", ano);
      return http.get<import("../types").Entrada[]>(`/entradas?${params}`).then(r => r.data);
    },
    deletar: (id: number) =>
      http.delete(`/entradas/${id}`).then(r => r.data),
  },
};
