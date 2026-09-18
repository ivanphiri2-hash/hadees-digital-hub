// Shared admin row actions + destructive confirmation dialog.
// Used by every CRM table so View / Edit / Delete look and behave the same.

import { useState, type ReactNode } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

export const btnDanger =
  "inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 disabled:opacity-50";

const iconBtn =
  "inline-flex items-center gap-1 rounded-full border border-border/70 px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground";

/** View | Edit | Delete cluster for a table row. */
export function RowActions({ onView, onEdit, onDelete, deleteLabel = "Delete" }: {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteLabel?: string;
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {onView && <button className={iconBtn} onClick={onView}><Eye className="h-3.5 w-3.5" /> View</button>}
      {onEdit && <button className={iconBtn} onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Edit</button>}
      {onDelete && (
        <button className={`${iconBtn} border-red-500/40 text-red-400 hover:text-red-300`} onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" /> {deleteLabel}
        </button>
      )}
    </span>
  );
}

/** Blocking confirmation modal — nothing is ever deleted on first click. */
export function ConfirmDialog({ open, title = "Delete this record?", message, confirmLabel = "Delete", pending, error, onCancel, onConfirm, children }: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-[var(--color-navy,#0A2540)] p-5 shadow-2xl">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        {children}
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-full border border-border/70 px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            onClick={onCancel}
            disabled={pending}
          >
            CANCEL
          </button>
          <button className={btnDanger} onClick={onConfirm} disabled={pending}>
            {pending ? "Working…" : confirmLabel.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Inline failure banner — never show success when the server rejected a change. */
export function ErrorBar({ error }: { error: unknown }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{msg}</div>
  );
}

/** Small helper for the common single-target delete confirmation state. */
export function useDeleteTarget<T>() {
  const [target, setTarget] = useState<T | null>(null);
  return { target, setTarget, clear: () => setTarget(null) };
}
