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

          const { verifyPaystackTransaction } = await import("@/lib/payments.server");
          const { data: tx, error } = await verifyPaystackTransaction(reference);
          if (error || !tx || tx.status !== "success") {
            return new Response("Verification failed", { status: 200 });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          // Update payment record
          const { data: payment } = await supabaseAdmin
            .from("payments")
            .update({ status: "success", verified_at: new Date().toISOString() })
            .eq("paystack_reference", reference)
            .select("id, payment_type, school_id, subscription_plan_id, user_id")
            .maybeSingle();

          if (!payment) {
            return new Response("Payment record not found", { status: 200 });
          }

          // Activate school subscription
          if (payment.payment_type === "subscription" && payment.school_id && payment.subscription_plan_id) {
            const { data: plan } = await supabaseAdmin
              .from("subscription_plans")
              .select("duration_days")
              .eq("id", payment.subscription_plan_id)
              .single();
            const days = plan?.duration_days ?? 365;
            const endsAt = new Date();
            endsAt.setDate(endsAt.getDate() + days);
            await supabaseAdmin
              .from("schools")
              .update({ subscription_status: "active", subscription_ends_at: endsAt.toISOString() })
              .eq("id", payment.school_id);
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
