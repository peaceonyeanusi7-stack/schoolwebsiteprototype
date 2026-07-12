
-- Schools table
CREATE TABLE public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  subscription_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Add school_id to profiles
ALTER TABLE public.profiles ADD COLUMN school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL;

-- Helper: get a user's school
CREATE OR REPLACE FUNCTION public.get_user_school(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT school_id FROM public.profiles WHERE id = _user_id $$;

-- Schools policies
CREATE POLICY "Super admins manage all schools" ON public.schools FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Members view own school" ON public.schools FOR SELECT TO authenticated
  USING (id = public.get_user_school(auth.uid()));

CREATE POLICY "School admins update own school" ON public.schools FOR UPDATE TO authenticated
  USING (id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'))
  WITH CHECK (id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'));

-- Extra profile policies: super admin sees all; school admin sees same-school profiles
CREATE POLICY "Super admins view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins view same-school profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'school_admin') AND school_id = public.get_user_school(auth.uid()));

CREATE POLICY "Super admins update all profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "School admins update same-school profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'school_admin') AND school_id = public.get_user_school(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(), 'school_admin') AND school_id = public.get_user_school(auth.uid()));

-- updated_at trigger for schools
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
