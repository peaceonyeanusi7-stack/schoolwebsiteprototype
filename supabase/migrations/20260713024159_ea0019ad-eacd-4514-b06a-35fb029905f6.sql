
-- Helper: does a target user belong to the same school as the caller?
CREATE OR REPLACE FUNCTION public.same_school_as_caller(_target_user uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p_caller
    JOIN public.profiles p_target ON p_target.school_id = p_caller.school_id
    WHERE p_caller.id = auth.uid()
      AND p_target.id = _target_user
      AND p_caller.school_id IS NOT NULL
  )
$$;

-- ============ user_roles: tighten multi-tenant isolation ============
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- SELECT: super admin sees all; school admin sees only same-school roles; users see own
CREATE POLICY "Super admins view all roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins view same-school roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND public.same_school_as_caller(user_id)
  );

-- INSERT/UPDATE/DELETE: super admin unrestricted
CREATE POLICY "Super admins manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- School admin: only same-school users, and NEVER super_admin or school_admin roles
CREATE POLICY "School admins insert scoped roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'school_admin')
    AND public.same_school_as_caller(user_id)
    AND role NOT IN ('super_admin','school_admin')
  );

CREATE POLICY "School admins delete scoped roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND public.same_school_as_caller(user_id)
    AND role NOT IN ('super_admin','school_admin')
  );

CREATE POLICY "School admins update scoped roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'school_admin')
    AND public.same_school_as_caller(user_id)
    AND role NOT IN ('super_admin','school_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'school_admin')
    AND public.same_school_as_caller(user_id)
    AND role NOT IN ('super_admin','school_admin')
  );

-- ============ profiles: prevent school reassignment by non-super-admin ============
-- Trigger blocks changing school_id unless caller is super_admin
CREATE OR REPLACE FUNCTION public.prevent_school_reassignment()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.school_id IS DISTINCT FROM OLD.school_id
     AND NOT public.has_role(auth.uid(), 'super_admin') THEN
    RAISE EXCEPTION 'Only a Super Admin can change a user''s school assignment';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_school_reassignment ON public.profiles;
CREATE TRIGGER profiles_block_school_reassignment
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_school_reassignment();
