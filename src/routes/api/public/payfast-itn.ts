import { createFileRoute } from "@tanstack/react-router";

// Legacy notify_url kept alive for orders created before the /payfast/itn move.
export const Route = createFileRoute("/api/public/payfast-itn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handlePayFastItn } = await import("@/lib/payfast-itn.server");
        return handlePayFastItn(request);
      },
    },
  },
});
