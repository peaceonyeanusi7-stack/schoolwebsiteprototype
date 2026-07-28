import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PRIMARY_ROLE } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    const user = data.user;
    const supabaseServer = context?.supabase as typeof supabase | undefined;
    const client = supabaseServer ?? supabase;

    const { data: roles } = await client.from("user_roles").select("role").eq("user_id", user.id);
    const primary = PRIMARY_ROLE((roles ?? []).map((r) => r.role));

    if (primary === "school_admin") {
      const { data: profile } = await client.from("profiles").select("school_id").eq("id", user.id).maybeSingle();
      if (profile?.school_id) {
        const { data: school } = await client.from("schools")
          .select("subscription_status, subscription_ends_at")
          .eq("id", profile.school_id)
          .maybeSingle();
        const isActive =
          school?.subscription_status === "active" &&
          (school?.subscription_ends_at ? new Date(school.subscription_ends_at) > new Date() : false);
        if (!isActive) {
          throw redirect({ to: "/dashboard/school-admin" });
        }
      }
    }

    return { user };
  },
  component: () => <Outlet />,
});
