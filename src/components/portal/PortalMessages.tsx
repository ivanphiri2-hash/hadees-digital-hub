// Client-side messaging panel used inside the protected client portal.

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { getMyMessages, sendMyMessage } from "@/lib/messages.functions";
import { AdminPanel, shortDate } from "@/components/admin/shell";

export function PortalMessages() {
  const qc = useQueryClient();
  const fetchMessages = useServerFn(getMyMessages);
  const send = useServerFn(sendMyMessage);
  const [body, setBody] = useState("");

  const q = useQuery({ queryKey: ["portal", "messages"], queryFn: () => fetchMessages({}) });

  const mutation = useMutation({
    mutationFn: (text: string) => send({ data: { body: text } }),
    onSuccess: () => { setBody(""); void qc.invalidateQueries({ queryKey: ["portal", "messages"] }); },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    mutation.mutate(body.trim());
  }

  return (
    <AdminPanel title="Messages">
      <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1">
        {q.isLoading && <p className="text-xs text-muted-foreground">Loading messages…</p>}
        {!q.isLoading && (q.data?.messages ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground">No messages yet — send us a note and our team will reply here.</p>
        )}
        {(q.data?.messages ?? []).map((m) => (
          <div key={m.id} className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
            m.from_staff ? "border border-border/60 bg-black/20" : "ml-auto bg-[var(--color-royal)] text-white"
          }`}>
            <div className="whitespace-pre-wrap">{m.body}</div>
            <div className={`mt-1 text-[10px] ${m.from_staff ? "text-muted-foreground" : "text-white/70"}`}>
              {m.from_staff ? m.sender_name ?? "Hadees Trading" : "You"} · {shortDate(m.created_at)}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex items-end gap-2">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} maxLength={4000}
          placeholder="Message the Hadees Trading team…"
          className="flex-1 rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
        <button type="submit" disabled={mutation.isPending || !body.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          <Send className="h-4 w-4" /> Send
        </button>
      </form>
      {mutation.error && <p className="mt-2 text-xs text-red-400">{(mutation.error as Error).message}</p>}
    </AdminPanel>
  );
}
