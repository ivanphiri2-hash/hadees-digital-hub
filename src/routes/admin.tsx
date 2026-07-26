import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AdminAuthProvider } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Hadees Trading Control Centre" },
      { name: "description", content: "Operate leads, bookings, quotes, invoices, clients and audit logs from the Hadees Trading admin control centre." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Hadees Trading — Admin" },
      { property: "og:description", content: "Internal admin control centre." },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <AdminAuthProvider>
      <div className="min-h-[calc(100vh-4rem)] bg-[color-mix(in_oklab,var(--background)_92%,black)]">
        <Outlet />
      </div>
    </AdminAuthProvider>
  );
}
