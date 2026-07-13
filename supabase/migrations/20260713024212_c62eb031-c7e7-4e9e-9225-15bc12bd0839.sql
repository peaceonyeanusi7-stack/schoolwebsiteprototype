
REVOKE EXECUTE ON FUNCTION public.same_school_as_caller(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.same_school_as_caller(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.prevent_school_reassignment() FROM PUBLIC, anon, authenticated;
