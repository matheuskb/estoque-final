import { Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "./ui";

interface Props {
  nome: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Modal({ nome, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter")  onConfirm();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onCancel, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onCancel}
      />
      <div className="relative bg-bg-surface border border-bg-border rounded-xl p-6 w-full max-w-sm shadow-modal animate-slide-up">
        {/* fechar */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-tx-muted hover:text-tx-primary transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ícone + título */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 bg-danger-muted rounded-md">
            <Trash2 className="w-4 h-4 text-danger" />
          </div>
          <h2 className="text-base font-semibold text-tx-primary">
            Remover produto
          </h2>
        </div>

        <p className="text-sm text-tx-secondary leading-relaxed mb-1">
          Tem certeza que deseja remover
        </p>
        <p className="text-sm font-semibold text-tx-primary mb-4 truncate">
          &ldquo;{nome}&rdquo;
        </p>
        <p className="text-xs text-tx-muted leading-relaxed mb-6">
          Esta ação não pode ser desfeita. Todas as unidades serão removidas.
        </p>

        {/* ações */}
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            <Trash2 className="w-3.5 h-3.5" />
            Remover
          </Button>
        </div>

        <p className="text-center text-2xs text-tx-muted mt-4">
          Enter para confirmar · Esc para cancelar
        </p>
      </div>
    </div>
  );
}
