
-- Revoke public/anon from all SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_school(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.same_school_as_caller(uuid) FROM PUBLIC, anon;

-- These are only invoked from RLS policies, so authenticated must retain EXECUTE
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_school(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.same_school_as_caller(uuid) TO authenticated;

-- Trigger-only functions: no direct callers should exist
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_school_reassignment() FROM PUBLIC, anon, authenticated;
