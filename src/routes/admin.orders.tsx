import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download } from "lucide-react";
import { listOrders } from "@/lib/platform.functions";
import { AdminShell, AdminPanel, KpiCard, StatusPill, money, shortDate } from "@/components/admin/shell";
import { DataTable, Toolbar, inputCls, btnGhost, downloadCsv, type Column } from "@/components/admin/table";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Hadees Trading Control Centre" },
      { name: "description", content: "Every website order placed through PayFast checkout, with linked invoices and projects." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrdersPage,
});

type Order = Awaited<ReturnType<typeof listOrders>>["orders"][number];

function OrdersPage() {
  const fetchOrders = useServerFn(listOrders);
  const q = useQuery({ queryKey: ["admin", "orders"], queryFn: () => fetchOrders({}) });
  const [term, setTerm] = useState("");
  const [status, setStatus] = useState("all");

  const orders = q.data?.orders ?? [];
  const invoices = q.data?.invoices ?? [];
  const projects = q.data?.projects ?? [];

  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return orders.filter((o) => {
      const okStatus = status === "all" || o.status === status;
      const okTerm = !t || [o.reference, o.service_name, o.customer_name, o.customer_email].some((v) => (v ?? "").toLowerCase().includes(t));
      return okStatus && okTerm;
    });
  }, [orders, term, status]);

  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((s, o) => s + (o.amount_cents ?? 0), 0);

  const cols: Column<Order>[] = [
    { key: "ref", label: "Reference", render: (o) => <span className="font-mono text-xs">{o.reference}</span> },
    { key: "service", label: "Service", render: (o) => <div className="min-w-[160px]"><div className="font-medium">{o.service_name}</div><div className="text-[11px] text-muted-foreground">{o.service_slug}</div></div> },
    { key: "customer", label: "Customer", render: (o) => <div><div>{o.customer_name}</div><div className="text-[11px] text-muted-foreground">{o.customer_email}</div></div> },
    { key: "amount", label: "Amount", render: (o) => <span className="font-semibold">{money(o.amount_cents)}</span> },
    { key: "status", label: "Status", render: (o) => <StatusPill status={o.status} /> },
    {
      key: "linked", label: "Automation", render: (o) => {
        const inv = invoices.find((i) => i.order_id === o.id);
        const prj = projects.find((p) => p.order_id === o.id);
        return (
          <div className="grid gap-0.5 text-[11px] text-muted-foreground">
            <span>{inv ? `Invoice ${inv.number}` : "No invoice"}</span>
            <span>{prj ? `Project ${prj.progress}%` : "No project"}</span>
          </div>
        );
      },
    },
    { key: "date", label: "Placed", render: (o) => <span className="text-[11px] text-muted-foreground">{shortDate(o.created_at)}</span> },
  ];

  return (
    <AdminShell title="Orders" subtitle="Website checkout orders and their automated invoice, receipt and project chain.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total orders" value={String(orders.length)} />
        <KpiCard label="Paid orders" value={String(paid.length)} tone="green" />
        <KpiCard label="Pending" value={String(orders.filter((o) => o.status === "pending").length)} tone="gold" />
        <KpiCard label="Order revenue" value={money(revenue)} tone="green" />
      </div>

      <AdminPanel title="All orders">
        <Toolbar>
          <input className={inputCls} placeholder="Search reference, service, customer…" value={term} onChange={(e) => setTerm(e.target.value)} />
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["all", "pending", "paid", "failed", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className={btnGhost} onClick={() => downloadCsv("hadees-orders.csv", rows as unknown as Record<string, unknown>[])}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </Toolbar>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Loading orders…</p> : <DataTable rows={rows} cols={cols} empty="No orders yet." />}
      </AdminPanel>
    </AdminShell>
  );
}
