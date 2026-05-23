import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

// ── Badge ──────────────────────────────────────────────────────────────────
type BadgeVariant = "default" | "ok" | "warn" | "danger" | "accent";

const badgeStyle: Record<BadgeVariant, string> = {
  default: "bg-bg-overlay text-tx-secondary ring-bg-border",
  ok:      "bg-ok-muted text-ok ring-ok-ring",
  warn:    "bg-warn-muted text-warn ring-warn-ring",
  danger:  "bg-danger-muted text-danger ring-danger-ring",
  accent:  "bg-accent-muted text-accent ring-accent-ring",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-2xs font-semibold tracking-wide ring-1 ${badgeStyle[variant]}`}
    >
      {children}
    </span>
  );
}

// ── Button ─────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "danger" | "sell";

const btnBase =
  "inline-flex items-center justify-center gap-1.5 font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-bg-base";

const btnStyle: Record<BtnVariant, string> = {
  primary: "bg-accent hover:bg-accent-hover text-white focus-visible:ring-accent",
  ghost:   "bg-bg-raised hover:bg-bg-overlay text-tx-secondary hover:text-tx-primary border border-bg-border focus-visible:ring-bg-muted",
  danger:  "bg-danger-muted hover:bg-danger text-danger hover:text-white ring-1 ring-danger-ring hover:ring-danger focus-visible:ring-danger",
  sell:    "bg-ok-muted hover:bg-ok text-ok hover:text-white ring-1 ring-ok-ring hover:ring-ok focus-visible:ring-ok",
};

const btnSize: Record<"sm" | "md" | "icon", string> = {
  sm:   "h-7 px-3 text-xs rounded-sm",
  md:   "h-9 px-4 text-sm rounded-md",
  icon: "h-8 w-8 text-sm rounded-md",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md" | "icon";
  loading?: boolean;
}) {
  return (
    <button
      className={`${btnBase} ${btnStyle[variant]} ${btnSize[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
const fieldBase =
  "w-full bg-bg-raised border border-bg-border text-tx-primary placeholder:text-tx-muted text-sm rounded-md transition focus:outline-none focus:ring-2 focus:ring-accent-ring focus:border-accent";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`${fieldBase} h-9 px-3 ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`${fieldBase} h-9 px-3 pr-8 appearance-none bg-[image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235a5a68' d='M6 8L1 3h10z'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

// ── Label ──────────────────────────────────────────────────────────────────
export function Label({ children }: { children: ReactNode }) {
  return (
    <span className="text-2xs font-semibold uppercase tracking-widest text-tx-muted">
      {children}
    </span>
  );
}

// ── Card ───────────────────────────────────────────────────────────────────
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-bg-surface border border-bg-border rounded-lg shadow-card ${className}`}
    >
      {children}
    </div>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  variant?: "default" | "ok" | "warn" | "danger" | "accent";
}) {
  const colors = {
    default: "text-tx-secondary bg-bg-overlay",
    ok:      "text-ok bg-ok-muted",
    warn:    "text-warn bg-warn-muted",
    danger:  "text-danger bg-danger-muted",
    accent:  "text-accent bg-accent-muted",
  }[variant];

  return (
    <Card className="p-5 flex gap-4 items-start animate-slide-up">
      <div className={`p-2.5 rounded-md ${colors} shrink-0`}>
        <Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-2xs font-semibold uppercase tracking-widest text-tx-muted mb-1">
          {label}
        </p>
        <p className="text-xl font-semibold text-tx-primary leading-none tracking-tight">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-tx-muted mt-1 leading-relaxed">{sub}</p>
        )}
      </div>
    </Card>
  );
}

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
