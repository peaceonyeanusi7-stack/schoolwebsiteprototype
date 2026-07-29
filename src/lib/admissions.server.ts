import { verifyPaystackTransaction } from "./payments.server";

export function generateReceiptNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `OA-${y}-${rand}`;
}

/** The public marketing site belongs to the earliest-created school tenant. */
export async function getDefaultSchoolId(): Promise<string | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("schools")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

export async function notifySchoolAdmins(
  schoolId: string | null,
  title: string,
  body: string,
  category = "admission",
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const rows: {
    school_id: string | null;
    user_id: string | null;
    title: string;
    body: string;
    category: string;
  }[] = [{ school_id: schoolId, user_id: null, title, body, category }];

  if (schoolId) {
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "school_admin");
    const ids = (roleRows ?? []).map((r) => r.user_id);
    if (ids.length) {
      const { data: admins } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("school_id", schoolId)
        .in("id", ids);
      for (const a of admins ?? []) {
        rows.push({ school_id: schoolId, user_id: a.id, title, body, category });
      }
    }
  }
  await supabaseAdmin.from("notifications").insert(rows);
}

export interface FinalizeResult {
  success: boolean;
  status: string;
  kind: "admission" | "subscription" | "other";
  receiptNumber?: string | null;
  message?: string;
}

/**
 * Confirms a Paystack reference with Paystack, then applies all downstream
 * side effects: marks the payment, flags the admission application as paid,
 * generates a receipt, notifies school admins, or activates/creates a school
 * subscription (including provisioning the School Admin account).
 */
export async function finalizePaymentByReference(reference: string): Promise<FinalizeResult> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: payment } = await supabaseAdmin
    .from("payments")
    .select(
      "id, status, payment_type, school_id, subscription_plan_id, admission_application_id, amount_kobo, payer_email, payer_name, metadata",
    )
    .eq("paystack_reference", reference)
    .maybeSingle();

  if (!payment) return { success: false, status: "not_found", kind: "other", message: "Payment not found." };

  const kind: FinalizeResult["kind"] =
    payment.payment_type === "subscription"
      ? "subscription"
      : payment.admission_application_id
        ? "admission"
        : "other";

  if (payment.status === "success") {
    let receiptNumber: string | null = null;
    if (payment.admission_application_id) {
      const { data: app } = await supabaseAdmin
        .from("admission_applications")
        .select("receipt_number")
        .eq("id", payment.admission_application_id)
        .maybeSingle();
      receiptNumber = app?.receipt_number ?? null;
    }
    return { success: true, status: "success", kind, receiptNumber };
  }

  const { data: tx, error } = await verifyPaystackTransaction(reference);
  if (error || !tx) {
    return { success: false, status: "unverified", kind, message: error?.message ?? "Verification failed" };
  }

  if (tx.status !== "success") {
    await supabaseAdmin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return { success: false, status: tx.status, kind, message: "Payment was not successful." };
  }

  await supabaseAdmin
    .from("payments")
    .update({ status: "success", verified_at: new Date().toISOString() })
    .eq("id", payment.id);

  // ---- Admission application fee ----
  if (payment.admission_application_id) {
    const receiptNumber = generateReceiptNumber();
    const { data: app } = await supabaseAdmin
      .from("admission_applications")
      .update({
        status: "fee_paid",
        receipt_number: receiptNumber,
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.admission_application_id)
      .select("id, child_name, parent_name, level, school_id")
      .maybeSingle();

    await notifySchoolAdmins(
      app?.school_id ?? payment.school_id ?? null,
      "Application fee paid",
      `${app?.parent_name ?? payment.payer_name ?? "A parent"} paid the application fee for ${app?.child_name ?? "a child"} (${app?.level ?? "—"}). Receipt ${receiptNumber}.`,
    );

    return { success: true, status: "success", kind: "admission", receiptNumber };
  }

  // ---- Subscription ----
  if (payment.payment_type === "subscription") {
    const meta = (payment.metadata ?? {}) as Record<string, unknown>;
    let schoolId = payment.school_id;

    const days = await (async () => {
      if (!payment.subscription_plan_id) return 365;
      const { data: plan } = await supabaseAdmin
        .from("subscription_plans")
        .select("duration_days")
        .eq("id", payment.subscription_plan_id)
        .maybeSingle();
      return plan?.duration_days ?? 365;
    })();

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + days);

    // New school signup paid from the public subscribe page
    if (!schoolId && meta.pending_school_name) {
      const { data: school } = await supabaseAdmin
        .from("schools")
        .insert({
          name: String(meta.pending_school_name),
          address: meta.pending_school_address ? String(meta.pending_school_address) : null,
          phone: meta.pending_school_phone ? String(meta.pending_school_phone) : null,
          email: payment.payer_email,
          subscription_status: "active",
          subscription_ends_at: endsAt.toISOString(),
        })
        .select("id")
        .single();

      schoolId = school?.id ?? null;

      if (schoolId) {
        const redirectTo = meta.redirect_to ? String(meta.redirect_to) : undefined;
        const adminName = meta.pending_admin_name ? String(meta.pending_admin_name) : payment.payer_email;
        const { data: invited } = await supabaseAdmin.auth.admin.inviteUserByEmail(payment.payer_email, {
          data: { full_name: adminName },
          redirectTo,
        });
        if (invited?.user) {
          await supabaseAdmin
            .from("profiles")
            .update({ school_id: schoolId, full_name: adminName })
            .eq("id", invited.user.id);
          await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: invited.user.id, role: "school_admin" });
        }
        await supabaseAdmin.from("payments").update({ school_id: schoolId }).eq("id", payment.id);
        await notifySchoolAdmins(
          schoolId,
          "Subscription activated",
          `${String(meta.pending_school_name)} is now active until ${endsAt.toDateString()}.`,
          "subscription",
        );
      }
    } else if (schoolId) {
      await supabaseAdmin
        .from("schools")
        .update({ subscription_status: "active", subscription_ends_at: endsAt.toISOString() })
        .eq("id", schoolId);
      await notifySchoolAdmins(
        schoolId,
        "Subscription activated",
        `Your subscription is active until ${endsAt.toDateString()}.`,
        "subscription",
      );
    }

    return { success: true, status: "success", kind: "subscription" };
  }

  if (payment.school_id) {
    await notifySchoolAdmins(
      payment.school_id,
      "Payment received",
      `${payment.payer_name ?? payment.payer_email} completed a payment of ₦${(payment.amount_kobo / 100).toLocaleString()}.`,
      "payment",
    );
  }

  return { success: true, status: "success", kind };
}
