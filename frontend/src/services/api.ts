import axios from "axios";
import type { DashboardData, NovoProduto, Produto } from "../types";

const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ""}/api`,
  headers: { "Content-Type": "application/json" },
});

export const api = {
  produtos: {
    listar: () => http.get<Produto[]>("/produtos").then((r) => r.data),

    criar: (form: NovoProduto) =>
      http
        .post<Produto>("/produtos", {
          ...form,
          preco: parseFloat(form.preco),
          quantidade: parseInt(form.quantidade),
        })
        .then((r) => r.data),

    vender: (id: number) =>
      http
        .patch<Produto & { deleted?: boolean; id?: number }>(
          `/produtos/${id}/vender`
        )
        .then((r) => r.data),

    deletar: (id: number) =>
      http.delete(`/produtos/${id}`).then((r) => r.data),
  },

  dashboard: () =>
    http.get<DashboardData>("/dashboard").then((r) => r.data),
};
