import { createFileRoute, Navigate } from "@tanstack/react-router";

// Stable /login entry point. The sign-in UI itself lives at /auth so there is
// only one implementation of the Supabase auth flow.
export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Hadees Trading Business Platform" },
      { name: "description", content: "Secure login for Hadees Trading clients and staff." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Login — Hadees Trading" },
      { property: "og:description", content: "Sign in to your Hadees Trading client or staff account." },
    ],
  }),
  component: () => <Navigate to="/auth" search={{}} replace />,
});
