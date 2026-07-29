import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "crypto";
import { getPaystackConfig } from "@/lib/payments.server";

const webhookEventSchema = z.object({
  event: z.string(),
  data: z.record(z.unknown()).and(
    z.object({
      reference: z.string().optional(),
      status: z.string().optional(),
      amount: z.number().optional(),
      metadata: z.record(z.unknown()).nullable().optional(),
    }),
  ),
});

export const Route = createFileRoute("/api/public/webhooks/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const config = getPaystackConfig();
        const signature = request.headers.get("x-paystack-signature");
        const body = await request.text();

        if (!signature) {
          return new Response("Missing signature", { status: 401 });
        }

        const expected = createHmac("sha512", config.secretKey).update(body).digest("hex");
        try {
          if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
            return new Response("Invalid signature", { status: 401 });
          }
        } catch {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: z.infer<typeof webhookEventSchema>;
        try {
          event = webhookEventSchema.parse(JSON.parse(body));
        } catch {
          return new Response("Invalid payload", { status: 400 });
        }

        if (event.event === "charge.success") {
          const reference = event.data.reference;
          if (!reference) return new Response("No reference", { status: 400 });
          const { finalizePaymentByReference } = await import("@/lib/admissions.server");
          await finalizePaymentByReference(reference);
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
