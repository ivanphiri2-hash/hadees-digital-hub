import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { listMessageThreads, replyToClient } from "@/lib/messages.functions";
import { AdminShell, AdminPanel, shortDate } from "@/components/admin/shell";

export const Route = createFileRoute("/admin/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Hadees Trading Admin" },
      { name: "description", content: "Client conversations and staff replies inside the Hadees Trading control centre." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminMessages,
});

function AdminMessages() {
  const qc = useQueryClient();
  const fetchThreads = useServerFn(listMessageThreads);
  const reply = useServerFn(replyToClient);
  const [active, setActive] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const q = useQuery({ queryKey: ["admin", "messages"], queryFn: () => fetchThreads({}) });

  const threads = useMemo(() => {
    const byClient = new Map<string, typeof q.data extends undefined ? never : NonNullable<typeof q.data>["messages"]>();
    for (const m of q.data?.messages ?? []) {
      const list = byClient.get(m.client_id) ?? [];
      list.push(m);
      byClient.set(m.client_id, list);
    }
    return (q.data?.clients ?? [])
      .map((c) => ({ client: c, messages: byClient.get(c.id) ?? [] }))
      .sort((a, b) => (b.messages.at(-1)?.created_at ?? "").localeCompare(a.messages.at(-1)?.created_at ?? ""));
  }, [q.data]);

  const current = threads.find((t) => t.client.id === active) ?? threads[0];

  const send = useMutation({
    mutationFn: (vars: { client_id: string; body: string }) => reply({ data: vars }),
    onSuccess: () => { setBody(""); void qc.invalidateQueries({ queryKey: ["admin", "messages"] }); },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!current || !body.trim()) return;
    send.mutate({ client_id: current.client.id, body: body.trim() });
  }

  return (
    <AdminShell title="Messages" subtitle="Direct conversations with clients from their portal.">
      {q.isLoading && <p className="text-sm text-muted-foreground">Loading conversations…</p>}
      {q.error && <p className="text-sm text-red-400">{(q.error as Error).message}</p>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <AdminPanel title="Clients">
          <div className="grid gap-1">
            {threads.length === 0 && <p className="text-xs text-muted-foreground">No clients yet.</p>}
            {threads.map((t) => (
              <button key={t.client.id} onClick={() => setActive(t.client.id)}
                className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                  current?.client.id === t.client.id ? "bg-[var(--color-royal)]/15 text-foreground" : "text-muted-foreground hover:bg-white/5"
                }`}>
                <div className="truncate font-medium">{t.client.company_name || t.client.full_name}</div>
                <div className="truncate text-[11px] text-muted-foreground">
                  {t.messages.at(-1)?.body ?? "No messages yet"}
                </div>
              </button>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title={current ? current.client.company_name || current.client.full_name : "Conversation"}>
          {!current && <p className="text-sm text-muted-foreground">Select a client to start a conversation.</p>}
          {current && (
            <>
              <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
                {current.messages.length === 0 && <p className="text-xs text-muted-foreground">No messages in this thread yet.</p>}
                {current.messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.from_staff
                      ? "ml-auto bg-[var(--color-royal)] text-white"
                      : "border border-border/60 bg-black/20"
                  }`}>
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    <div className={`mt-1 text-[10px] ${m.from_staff ? "text-white/70" : "text-muted-foreground"}`}>
                      {m.sender_name ?? "—"} · {shortDate(m.created_at)}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={onSubmit} className="mt-4 flex items-end gap-2">
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2} maxLength={4000}
                  placeholder="Write a reply…"
                  className="flex-1 rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
                <button type="submit" disabled={send.isPending || !body.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                  <Send className="h-4 w-4" /> Send
                </button>
              </form>
              {send.error && <p className="mt-2 text-xs text-red-400">{(send.error as Error).message}</p>}
            </>
          )}
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
