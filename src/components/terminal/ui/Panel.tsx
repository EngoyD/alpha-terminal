import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

interface PanelProps {
  /** Terminal-style function mnemonic shown before the title, e.g. "GP". */
  code?: string;
  title: string;
  icon?: LucideIcon;
  accent?: "cyan" | "purple";
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function Panel({ code, title, icon: Icon, accent = "cyan", actions, className, bodyClassName, children }: PanelProps) {
  const ai = accent === "purple";
  return (
    <section
      aria-label={title}
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-md border bg-gray-900/55 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]",
        ai ? "border-purple-500/25" : "border-gray-800",
        className,
      )}
    >
      {ai && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-purple-400/70 to-transparent"
        />
      )}
      <header className="flex h-8 shrink-0 items-center gap-2 border-b border-gray-800/80 pr-1.5 pl-2.5">
        {code && (
          <span
            className={cn(
              "rounded-sm px-1 py-px font-mono text-[10px] font-bold tracking-wider",
              ai ? "bg-purple-500/15 text-purple-300" : "bg-cyan-400/10 text-cyan-300",
            )}
          >
            {code}
          </span>
        )}
        {Icon && <Icon aria-hidden className={cn("size-3.5 shrink-0", ai ? "text-purple-300" : "text-gray-400")} />}
        <h2 className="min-w-0 truncate text-[11px] font-semibold tracking-[0.1em] text-gray-300 uppercase">{title}</h2>
        {actions && <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>}
      </header>
      <div className={cn("relative min-h-0 flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
