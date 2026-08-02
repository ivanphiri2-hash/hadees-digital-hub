import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({ rows, cols, empty = "Nothing here yet." }: { rows: T[]; cols: Column<T>[]; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border/60">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/[0.03] text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr>{cols.map((c) => <th key={c.key} className={`px-3 py-2.5 font-medium ${c.className ?? ""}`}>{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/[0.03]">
              {cols.map((c) => <td key={c.key} className={`px-3 py-2.5 align-top ${c.className ?? ""}`}>{c.render(r)}</td>)}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={cols.length} className="px-3 py-6 text-center text-xs text-muted-foreground">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-center gap-2">{children}</div>;
}

export const inputCls =
  "rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-royal)]/40";

export const btnCls =
  "inline-flex items-center gap-1.5 rounded-full bg-[var(--color-royal)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground";

/** Client-side CSV export — no server round trip needed. */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
