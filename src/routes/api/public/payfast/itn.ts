import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payfast/itn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handlePayFastItn } = await import("@/lib/payfast-itn.server");
        return handlePayFastItn(request);
      },
    },
  },
});
