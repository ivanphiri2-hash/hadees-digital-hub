import { createFileRoute, Navigate } from "@tanstack/react-router";

// Alias for the PayFast cancel_url. The full UI lives at /payment/cancelled.
export const Route = createFileRoute("/payment/cancel")({
  head: () => ({
    meta: [
      { title: "Payment Cancelled — Hadees Trading" },
      { name: "description", content: "Your payment was cancelled. You can retry any time." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Payment Cancelled — Hadees Trading" },
      { property: "og:description", content: "Your payment was cancelled. You can retry any time." },
    ],
  }),
  component: () => <Navigate to="/payment/cancelled" search={{}} replace />,
});
