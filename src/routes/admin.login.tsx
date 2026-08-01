import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign-in — Hadees Trading" },
      { name: "description", content: "Sign in to the Hadees Trading admin control centre." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <Navigate to="/auth" search={{ redirect: "/admin" }} replace />,
});
