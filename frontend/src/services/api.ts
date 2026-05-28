import axios from "axios";
import type { DashboardData, NovaRoupa, NovoPerfume, Perfume, Roupa } from "../types";

const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
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
