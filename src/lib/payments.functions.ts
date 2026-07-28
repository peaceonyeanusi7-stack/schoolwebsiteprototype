import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import {
  formatNaira,
  generatePaystackReference,
  initializePaystackTransaction,
  verifyPaystackTransaction,
  koboToNaira,
  type PaymentType,
  type FeeCategory,
} from "./payments.server";

export { formatNaira };


const DEFAULT_CURRENCY = "NGN";

function buildCallbackUrl(origin: string): string {
  return `${origin}/dashboard/payment/callback`;
}

/* ============ PUBLIC / AUTHENTICATED READS ============ */

export const listSubscriptionPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("subscription_plans")
    .select("id, name, description, amount_kobo, currency, duration_days, is_active")
    .eq("is_active", true)
    .order("amount_kobo", { ascending: true });
  if (error) throw new Error(error.message);
  return { plans: data ?? [] };
});

export const listFeeItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", context.userId).maybeSingle();
    if (!profile?.school_id) throw new Error("You are not assigned to a school.");
    const { data, error } = await supabase
      .from("fee_items")
      .select("id, name, category, class_level, amount_kobo, currency, is_active")
      .eq("school_id", profile.school_id)
      .eq("is_active", true)
      .order("category", { ascending: true });
    if (error) throw new Error(error.message);
    return { fees: data ?? [] };
  });

export const listMyPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("payments")
      .select("id, payment_type, amount_kobo, currency, status, paystack_reference, created_at, verified_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { payments: data ?? [] };
  });

export const getSchoolSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", context.userId).maybeSingle();
    if (!profile?.school_id) return { school: null };
    const { data, error } = await supabase
      .from("schools")
      .select("id, name, subscription_status, subscription_ends_at, paystack_customer_code")
      .eq("id", profile.school_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { school: data };
  });

/* ============ SCHOOL ADMIN FEE MANAGEMENT ============ */

export const createFeeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(2).max(120),
        category: z.enum(["admission", "school_fee"]),
        classLevel: z.string().max(60).optional().nullable(),
        amountKobo: z.number().int().positive(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "school_admin" });
    if (!isAdmin) throw new Error("Only School Admins can create fee items.");
    const { data: profile } = await supabase.from("profiles").select("school_id").eq("id", context.userId).maybeSingle();
    if (!profile?.school_id) throw new Error("You are not assigned to a school.");

    const { error } = await supabase.from("fee_items").insert({
      school_id: profile.school_id,
      name: data.name,
      category: data.category as FeeCategory,
      class_level: data.classLevel ?? null,
      amount_kobo: data.amountKobo,
      currency: DEFAULT_CURRENCY,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============ PAYMENT INITIALIZATION ============ */

export const initializePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        paymentType: z.enum(["admission", "school_fee", "subscription"]),
        amountKobo: z.number().int().positive().optional(),
        feeItemId: z.string().uuid().optional().nullable(),
        subscriptionPlanId: z.string().uuid().optional().nullable(),
        callbackOrigin: z.string().url(),
      })
      .refine(
        (data) => {
          if (data.paymentType === "subscription") return !!data.subscriptionPlanId;
          if (data.paymentType === "school_fee") return !!data.feeItemId;
          return true;
        },
        { message: "Missing required item for the selected payment type." },
      )
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabase.from("profiles").select("school_id, full_name").eq("id", context.userId).maybeSingle();
    if (!profile?.school_id) throw new Error("You are not assigned to a school.");

    const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const email = userRecord.user?.email;
    if (!email) throw new Error("User email not found.");

    let amountKobo = data.amountKobo ?? 0;
    let referencePrefix = "OASIS";
    let paymentTypeLabel = "";
    const metadata: Record<string, Json> = {
      school_id: profile.school_id,
      user_id: context.userId,
      payment_type: data.paymentType,
    };

    let feeItemId: string | null = null;
    let subscriptionPlanId: string | null = null;

    if (data.paymentType === "admission") {
      referencePrefix = "ADM";
      paymentTypeLabel = "Admission Application Fee";
    } else if (data.paymentType === "school_fee" && data.feeItemId) {
      referencePrefix = "FEE";
      paymentTypeLabel = "School Fee";
      feeItemId = data.feeItemId;
      const { data: fee } = await supabase
        .from("fee_items")
        .select("amount_kobo, name")
        .eq("id", data.feeItemId)
        .eq("school_id", profile.school_id)
        .maybeSingle();
      if (!fee) throw new Error("Fee item not found.");
      amountKobo = fee.amount_kobo;
      metadata.fee_item_name = fee.name;
    } else if (data.paymentType === "subscription" && data.subscriptionPlanId) {
      referencePrefix = "SUB";
      paymentTypeLabel = "School Subscription";
      subscriptionPlanId = data.subscriptionPlanId;
      const { data: plan } = await supabase
        .from("subscription_plans")
        .select("amount_kobo, name, duration_days")
        .eq("id", data.subscriptionPlanId)
        .eq("is_active", true)
        .maybeSingle();
      if (!plan) throw new Error("Subscription plan not found.");
      amountKobo = plan.amount_kobo;
      metadata.plan_name = plan.name;
      metadata.duration_days = plan.duration_days;
    }

    if (amountKobo <= 0) throw new Error("Invalid payment amount.");

    const reference = generatePaystackReference(referencePrefix);
    const callbackUrl = buildCallbackUrl(data.callbackOrigin);

    // Create payment record using admin client (authenticated has no INSERT on payments)
    const { error: insertErr } = await supabaseAdmin.from("payments").insert({
      school_id: profile.school_id,
      user_id: context.userId,
      payer_email: email,
      payer_name: profile.full_name,
      payment_type: data.paymentType as PaymentType,
      amount_kobo: amountKobo,
      currency: DEFAULT_CURRENCY,
      paystack_reference: reference,
      status: "pending",
      fee_item_id: feeItemId,
      subscription_plan_id: subscriptionPlanId,
      metadata,
    });
    if (insertErr) throw new Error(insertErr.message);

    const { data: paystackData, error: paystackErr } = await initializePaystackTransaction({
      email,
      amount: amountKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        ...metadata,
        custom_fields: [
          { display_name: "Payment Type", variable_name: "payment_type", value: data.paymentType },
          { display_name: "School", variable_name: "school_id", value: profile.school_id },
          { display_name: "Purpose", variable_name: "purpose", value: paymentTypeLabel },
        ],
      },
    });
    if (paystackErr || !paystackData) {
      // Rollback payment record to avoid abandoned orphan rows
      await supabaseAdmin.from("payments").update({ status: "failed" }).eq("paystack_reference", reference);
      throw new Error(paystackErr?.message ?? "Failed to initialize payment");
    }

    await supabaseAdmin
      .from("payments")
      .update({ paystack_access_code: paystackData.access_code })
      .eq("paystack_reference", reference);

    return {
      authorizationUrl: paystackData.authorization_url,
      reference: paystackData.reference,
      amountKobo,
      amountFormatted: formatNaira(amountKobo),
    };
  });

/* ============ SUPER ADMIN PLAN MANAGEMENT ============ */

export const createSubscriptionPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        name: z.string().min(2).max(120),
        description: z.string().max(500).optional().nullable(),
        amountKobo: z.number().int().positive(),
        durationDays: z.number().int().positive().default(365),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: isSuper } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isSuper) throw new Error("Only Super Admins can manage subscription plans.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("subscription_plans").insert({
      name: data.name,
      description: data.description ?? null,
      amount_kobo: data.amountKobo,
      currency: DEFAULT_CURRENCY,
      duration_days: data.durationDays,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAllPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: isSuper } = await supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" });
    if (!isSuper) throw new Error("Only Super Admins can view all payments.");

    const { data, error } = await supabase
      .from("payments")
      .select("id, payment_type, amount_kobo, currency, status, payer_email, payer_name, paystack_reference, created_at, verified_at, school_id")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { payments: data ?? [] };
  });

/* ============ CALLBACK / VERIFICATION ============ */

export const verifyPaymentByReference = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ reference: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: payment, error } = await supabase
      .from("payments")
      .select("id, user_id, status, payment_type, school_id, subscription_plan_id, amount_kobo")
      .eq("paystack_reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!payment) throw new Error("Payment not found.");
    if (payment.user_id !== context.userId) throw new Error("Forbidden.");

    if (payment.status === "success") return { success: true, alreadyVerified: true };

    const { data: paystackTx, error: verifyErr } = await verifyPaystackTransaction(data.reference);
    if (verifyErr || !paystackTx) throw new Error(verifyErr?.message ?? "Verification failed");

    const paid = paystackTx.status === "success";
    if (paid) {
      await supabaseAdmin
        .from("payments")
        .update({ status: "success", verified_at: new Date().toISOString() })
        .eq("id", payment.id);

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
    } else {
      await supabaseAdmin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    }

    return { success: paid, status: paystackTx.status };
  });

export { formatNaira, koboToNaira };
