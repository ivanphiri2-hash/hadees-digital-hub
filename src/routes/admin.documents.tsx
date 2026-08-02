import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { AdminShell, AdminPanel, StatusPill, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, btnGhost, inputCls } from "@/components/admin/table";
import { getDocumentUrl, listDocuments } from "@/lib/platform.functions";

export const Route = createFileRoute("/admin/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Hadees Trading Control Centre" },
      { name: "description", content: "Secure document vault with categories, versions and signed download links." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DocumentsPage,
});

const CATEGORIES = ["all", "company", "branding", "project", "invoice", "receipt", "contract", "compliance", "website"];

function DocumentsPage() {
  const fetchDocs = useServerFn(listDocuments);
  const signUrl = useServerFn(getDocumentUrl);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const q = useQuery({ queryKey: ["admin", "documents"], queryFn: () => fetchDocs({}) });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (q.data ?? []).filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      return !term || d.name.toLowerCase().includes(term);
    });
  }, [q.data, category, search]);

  const open = async (path: string) => {
    const { url } = await signUrl({ data: { path } });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AdminShell title="Documents" subtitle="Company, client and project files with categories and version history.">
      <AdminPanel title={`Vault (${rows.length})`}>
        <Toolbar>
          <input className={inputCls} placeholder="Search file name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Toolbar>

        <DataTable
          rows={rows}
          empty="No documents stored yet."
          cols={[
            { key: "n", label: "File", render: (d) => <div><div className="font-medium">{d.name}</div><div className="text-[11px] text-muted-foreground">{d.mime_type || "file"} · {Math.round((d.size_bytes ?? 0) / 1024)} KB</div></div> },
            { key: "c", label: "Category", render: (d) => <StatusPill status={d.category} /> },
            { key: "cl", label: "Client", render: (d) => <span className="text-xs">{d.clients?.company_name || d.clients?.full_name || "—"}</span> },
            { key: "v", label: "Version", render: (d) => <span className="text-xs">v{d.version}</span> },
            { key: "d", label: "Uploaded", render: (d) => <span className="text-xs">{shortDate(d.created_at)}</span> },
            { key: "a", label: "", render: (d) => <button className={btnGhost} onClick={() => void open(d.storage_path)}>Open</button> },
          ]}
        />
      </AdminPanel>
    </AdminShell>
  );
}
