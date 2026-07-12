import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AppRole } from "@/lib/roles";

const SCHOOL_ROLES = ["teacher", "student", "parent", "accountant", "librarian"] as const;

async function assertSuperAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!data) throw new Error("Forbidden: Super Admin only");
}

async function assertSchoolAdmin(supabase: any, userId: string): Promise<string> {
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "school_admin" });
  if (!isAdmin) throw new Error("Forbidden: School Admin only");
  const { data: prof } = await supabase.from("profiles").select("school_id").eq("id", userId).maybeSingle();
  if (!prof?.school_id) throw new Error("You are not assigned to a school yet.");
  return prof.school_id as string;
}

/* ============ SUPER ADMIN ============ */

export const listSchools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: schools, error } = await supabaseAdmin
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    // fetch admin count per school (two-step to avoid relying on postgrest FK inference)
    const { data: adminRoleRows } = await supabaseAdmin
      .from("user_roles").select("user_id").eq("role", "school_admin");
    const adminIds = (adminRoleRows ?? []).map((r: any) => r.user_id);
    const counts: Record<string, number> = {};
    if (adminIds.length) {
      const { data: adminProfiles } = await supabaseAdmin
        .from("profiles").select("school_id").in("id", adminIds);
      for (const p of (adminProfiles ?? []) as any[]) {
        if (p.school_id) counts[p.school_id] = (counts[p.school_id] ?? 0) + 1;
      }
    }
    return { schools: (schools ?? []).map((s) => ({ ...s, admin_count: counts[s.id] ?? 0 })) };
  });

export const createSchoolWithAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        schoolName: z.string().min(2).max(120),
        address: z.string().max(300).optional().nullable(),
        phone: z.string().max(40).optional().nullable(),
        schoolEmail: z.string().email().optional().nullable(),
        adminEmail: z.string().email(),
        adminName: z.string().min(2).max(120),
        redirectTo: z.string().url(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Create school
    const { data: school, error: schoolErr } = await supabaseAdmin
      .from("schools")
      .insert({
        name: data.schoolName,
        address: data.address ?? null,
        phone: data.phone ?? null,
        email: data.schoolEmail ?? null,
      })
      .select()
      .single();
    if (schoolErr || !school) throw new Error(schoolErr?.message ?? "Failed to create school");

    // 2. Invite admin (creates auth user + sends email)
    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.adminEmail,
      { data: { full_name: data.adminName }, redirectTo: data.redirectTo },
    );
    if (inviteErr || !invited?.user) {
      // rollback school
      await supabaseAdmin.from("schools").delete().eq("id", school.id);
      throw new Error(inviteErr?.message ?? "Failed to send invitation");
    }

    // 3. Link profile to school + assign role
    await supabaseAdmin
      .from("profiles")
      .update({ school_id: school.id, full_name: data.adminName })
      .eq("id", invited.user.id);
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: invited.user.id, role: "school_admin" });

    return { ok: true, schoolId: school.id, userId: invited.user.id };
  });

/* ============ SCHOOL ADMIN ============ */

export const listSchoolUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const schoolId = await assertSchoolAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, school_id, created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (profiles ?? []).map((p) => p.id);
    if (!ids.length) return { users: [] };
    const { data: roleRows } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids);
    // fetch emails via admin listUsers (paginated) — filter by id membership
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    const emails = new Map<string, string>();
    for (const u of authList?.users ?? []) if (ids.includes(u.id)) emails.set(u.id, u.email ?? "");

    const rolesById: Record<string, string[]> = {};
    for (const r of roleRows ?? []) {
      rolesById[r.user_id] ??= [];
      rolesById[r.user_id].push(r.role);
    }
    return {
      users: (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name,
        email: emails.get(p.id) ?? "",
        roles: rolesById[p.id] ?? [],
        created_at: p.created_at,
      })),
    };
  });

export const inviteSchoolUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        fullName: z.string().min(2).max(120),
        role: z.enum(SCHOOL_ROLES),
        redirectTo: z.string().url(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const schoolId = await assertSchoolAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { full_name: data.fullName },
      redirectTo: data.redirectTo,
    });
    if (error || !invited?.user) throw new Error(error?.message ?? "Failed to send invitation");

    await supabaseAdmin
      .from("profiles")
      .update({ school_id: schoolId, full_name: data.fullName })
      .eq("id", invited.user.id);
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: invited.user.id, role: data.role as AppRole });

    return { ok: true, userId: invited.user.id };
  });
