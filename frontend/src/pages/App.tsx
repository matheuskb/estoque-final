import { Package, Shirt, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Modulo } from "../types";
import { PagePerfumes } from "./PagePerfumes";
import { PageRoupas } from "./PageRoupas";

export default function App() {
  const [modulo, setModulo] = useState<Modulo>("roupas");

  return (
    <div className="min-h-screen bg-bg-base text-tx-primary font-sans antialiased">

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-bg-border bg-bg-base/90 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center">
              <Package className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold tracking-tight text-tx-primary hidden sm:block">
              EstoqueOS
            </span>
          </div>

          {/* Navegação entre módulos */}
          <nav className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setModulo("roupas")}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all ${
                modulo === "roupas"
                  ? "bg-accent text-white"
                  : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised"
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              Roupas
            </button>
            <button
              onClick={() => setModulo("perfumes")}
              className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-all ${
                modulo === "perfumes"
                  ? "bg-accent text-white"
                  : "text-tx-secondary hover:text-tx-primary hover:bg-bg-raised"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Perfumes
            </button>
          </nav>

          {/* Label do módulo ativo */}
          <span className="ml-auto text-2xs text-tx-muted hidden md:block">
            {modulo === "roupas" ? "Controle de Roupas" : "Controle de Perfumes"}
          </span>
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {modulo === "roupas" ? <PageRoupas /> : <PagePerfumes />}
      </main>

      <footer className="border-t border-bg-border mt-16 py-5 text-center">
        <span className="text-2xs text-tx-muted tracking-wider uppercase">
          EstoqueOS · Roupas & Perfumes
        </span>
      </footer>
    </div>
  );
}
