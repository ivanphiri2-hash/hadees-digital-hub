import { createFileRoute, Navigate } from "@tanstack/react-router";

// /client-dashboard is the documented client entry point; the dashboard itself
// is the protected portal so there is a single implementation.
export const Route = createFileRoute("/client-dashboard")({
  head: () => ({
    meta: [
      { title: "Client Dashboard — Hadees Trading" },
      { name: "description", content: "Your Hadees Trading projects, orders, documents and messages." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Client Dashboard — Hadees Trading" },
      { property: "og:description", content: "Track projects, invoices, documents and messages securely." },
    ],
  }),
  component: () => <Navigate to="/portal" replace />,
});
