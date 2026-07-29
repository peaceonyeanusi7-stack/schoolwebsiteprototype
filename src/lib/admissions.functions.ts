import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LEVELS = ["Nursery", "Primary", "Secondary", "Boarding"] as const;

const DEFAULT_APPLICATION_FEE_KOBO: Record<string, number> = {
  Nursery: 2500000,
  Primary: 2500000,
  Secondary: 4000000,
  Boarding: 4000000,
};

/* ================= PUBLIC ADMISSION WORKFLOW ================= */

export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        parentName: z.string().trim().min(2, "Please enter your full name").max(120),
        parentEmail: z.string().trim().email("Enter a valid email address").max(255),
        parentPhone: z.string().trim().min(7, "Enter a valid phone number").max(30),
        childName: z.string().trim().min(2, "Enter your child's full name").max(120),
        level: z.enum(LEVELS),
        message: z.string().trim().max(1000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getDefaultSchoolId, notifySchoolAdmins } = await import("./admissions.server");
    const schoolId = await getDefaultSchoolId();

    const { data: row, error } = await supabaseAdmin
      .from("admission_enquiries")
      .insert({
        school_id: schoolId,
        parent_name: data.parentName,
        parent_email: data.parentEmail,
        parent_phone: data.parentPhone,
        child_name: data.childName,
        level: data.level,
        message: data.message ?? null,
      })
      .select("id")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Could not submit your enquiry.");

    await notifySchoolAdmins(
      schoolId,
      "New admissions enquiry",
      `${data.parentName} enquired about ${data.level} for ${data.childName}.`,
      "enquiry",
    );

    return { enquiryId: row.id };
  });

export const getEnquiry = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ enquiryId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("admission_enquiries")
      .select("id, parent_name, parent_email, parent_phone, child_name, level")
      .eq("id", data.enquiryId)
      .maybeSingle();
    return { enquiry: row ?? null };
  });

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        enquiryId: z.string().uuid().optional().nullable(),
        parentName: z.string().trim().min(2).max(120),
        parentEmail: z.string().trim().email().max(255),
        parentPhone: z.string().trim().min(7).max(30),
        childName: z.string().trim().min(2).max(120),
        childDob: z.string().trim().min(4).max(20),
        childGender: z.enum(["Male", "Female"]),
        level: z.enum(LEVELS),
        previousSchool: z.string().trim().max(160).optional().nullable(),
        address: z.string().trim().max(300).optional().nullable(),
        notes: z.string().trim().max(1000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getDefaultSchoolId, notifySchoolAdmins } = await import("./admissions.server");
    const schoolId = await getDefaultSchoolId();

    let feeKobo = DEFAULT_APPLICATION_FEE_KOBO[data.level] ?? 2500000;
    if (schoolId) {
      const { data: feeItem } = await supabaseAdmin
        .from("fee_items")
        .select("amount_kobo")
        .eq("school_id", schoolId)
        .eq("category", "admission")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (feeItem?.amount_kobo) feeKobo = feeItem.amount_kobo;
    }

    const { data: row, error } = await supabaseAdmin
      .from("admission_applications")
      .insert({
        enquiry_id: data.enquiryId ?? null,
        school_id: schoolId,
        parent_name: data.parentName,
        parent_email: data.parentEmail,
        parent_phone: data.parentPhone,
        child_name: data.childName,
        child_dob: data.childDob,
        child_gender: data.childGender,
        level: data.level,
        previous_school: data.previousSchool ?? null,
        address: data.address ?? null,
        notes: data.notes ?? null,
        application_fee_kobo: feeKobo,
      })
      .select("id, application_fee_kobo")
      .single();
    if (error || !row) throw new Error(error?.message ?? "Could not submit your application.");

    if (data.enquiryId) {
      await supabaseAdmin.from("admission_enquiries").update({ status: "converted" }).eq("id", data.enquiryId);
    }

    await notifySchoolAdmins(
      schoolId,
      "New admission application",
      `${data.parentName} submitted an application for ${data.childName} (${data.level}).`,
    );

    return { applicationId: row.id, applicationFeeKobo: row.application_fee_kobo };
  });

export const getApplication = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ applicationId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("admission_applications")
      .select("id, parent_name, parent_email, child_name, level, status, application_fee_kobo, receipt_number, paid_at")
      .eq("id", data.applicationId)
      .maybeSingle();
    return { application: row ?? null };
  });

export const startApplicationFeePayment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ applicationId: z.string().uuid(), callbackOrigin: z.string().url() }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generatePaystackReference, initializePaystackTransaction } = await import("./payments.server");

    const { data: app } = await supabaseAdmin
      .from("admission_applications")
      .select("id, school_id, parent_email, parent_name, child_name, level, application_fee_kobo, status")
      .eq("id", data.applicationId)
      .maybeSingle();
    if (!app) throw new Error("Application not found.");
    if (app.status !== "submitted") throw new Error("This application fee has already been paid.");

    const reference = generatePaystackReference("ADM");
    const callbackUrl = `${data.callbackOrigin}/payment/callback`;

    const { error: insertErr } = await supabaseAdmin.from("payments").insert({
      school_id: app.school_id,
      user_id: null,
      payer_email: app.parent_email,
      payer_name: app.parent_name,
      payment_type: "admission",
      amount_kobo: app.application_fee_kobo,
      currency: "NGN",
      paystack_reference: reference,
      status: "pending",
      admission_application_id: app.id,
      metadata: {
        application_id: app.id,
        child_name: app.child_name,
        level: app.level,
      },
    });
    if (insertErr) throw new Error(insertErr.message);

    const { data: ps, error: psErr } = await initializePaystackTransaction({
      email: app.parent_email,
      amount: app.application_fee_kobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        application_id: app.id,
        custom_fields: [
          { display_name: "Purpose", variable_name: "purpose", value: "Admission Application Fee" },
          { display_name: "Child", variable_name: "child", value: app.child_name },
        ],
      },
    });
    if (psErr || !ps) {
      await supabaseAdmin.from("payments").update({ status: "failed" }).eq("paystack_reference", reference);
      throw new Error(psErr?.message ?? "Could not start the payment.");
    }

    await supabaseAdmin
      .from("payments")
      .update({ paystack_access_code: ps.access_code })
      .eq("paystack_reference", reference);

    return { authorizationUrl: ps.authorization_url, reference };
  });

export const verifyPublicPayment = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ reference: z.string().trim().min(4).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { finalizePaymentByReference } = await import("./admissions.server");
    const result = await finalizePaymentByReference(data.reference);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("amount_kobo, payer_name, payer_email, admission_application_id, created_at")
      .eq("paystack_reference", data.reference)
      .maybeSingle();

    let application: {
      child_name: string;
      level: string;
      status: string;
      receipt_number: string | null;
      paid_at: string | null;
    } | null = null;
    if (payment?.admission_application_id) {
      const { data: app } = await supabaseAdmin
        .from("admission_applications")
        .select("child_name, level, status, receipt_number, paid_at")
        .eq("id", payment.admission_application_id)
        .maybeSingle();
      application = app ?? null;
    }

    return {
      ...result,
      reference: data.reference,
      amountKobo: payment?.amount_kobo ?? 0,
      payerName: payment?.payer_name ?? null,
      payerEmail: payment?.payer_email ?? null,
      application,
    };
  });

/* ================= PUBLIC SCHOOL SUBSCRIPTION SIGNUP ================= */

export const startSchoolSubscription = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        schoolName: z.string().trim().min(2).max(120),
        address: z.string().trim().max(300).optional().nullable(),
        phone: z.string().trim().max(40).optional().nullable(),
        adminName: z.string().trim().min(2).max(120),
        adminEmail: z.string().trim().email().max(255),
        planId: z.string().uuid(),
        callbackOrigin: z.string().url(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { generatePaystackReference, initializePaystackTransaction } = await import("./payments.server");

    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("id, name, amount_kobo, duration_days")
      .eq("id", data.planId)
      .eq("is_active", true)
      .maybeSingle();
    if (!plan) throw new Error("Subscription plan not found.");

    const reference = generatePaystackReference("SUB");

    const { error: insertErr } = await supabaseAdmin.from("payments").insert({
      school_id: null,
      user_id: null,
      payer_email: data.adminEmail,
      payer_name: data.adminName,
      payment_type: "subscription",
      amount_kobo: plan.amount_kobo,
      currency: "NGN",
      paystack_reference: reference,
      status: "pending",
      subscription_plan_id: plan.id,
      metadata: {
        pending_school_name: data.schoolName,
        pending_school_address: data.address ?? null,
        pending_school_phone: data.phone ?? null,
        pending_admin_name: data.adminName,
        redirect_to: `${data.callbackOrigin}/set-password`,
      },
    });
    if (insertErr) throw new Error(insertErr.message);

    const { data: ps, error: psErr } = await initializePaystackTransaction({
      email: data.adminEmail,
      amount: plan.amount_kobo,
      reference,
      callback_url: `${data.callbackOrigin}/payment/callback`,
      metadata: { plan_name: plan.name, school_name: data.schoolName },
    });
    if (psErr || !ps) {
      await supabaseAdmin.from("payments").update({ status: "failed" }).eq("paystack_reference", reference);
      throw new Error(psErr?.message ?? "Could not start the payment.");
    }

    await supabaseAdmin
      .from("payments")
      .update({ paystack_access_code: ps.access_code })
      .eq("paystack_reference", reference);

    return { authorizationUrl: ps.authorization_url, reference };
  });

/* ================= STAFF READS ================= */

export const listSchoolAdmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: enquiries } = await supabase
      .from("admission_enquiries")
      .select("id, parent_name, parent_email, parent_phone, child_name, level, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    const { data: applications } = await supabase
      .from("admission_applications")
      .select("id, parent_name, parent_email, child_name, level, status, application_fee_kobo, receipt_number, paid_at, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    return { enquiries: enquiries ?? [], applications: applications ?? [] };
  });

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("notifications")
      .select("id, title, body, category, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    return { notifications: data ?? [] };
  });
