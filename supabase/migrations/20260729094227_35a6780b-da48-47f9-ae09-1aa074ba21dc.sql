
CREATE TYPE public.admission_status AS ENUM ('submitted','fee_paid','under_review','accepted','rejected');
CREATE TYPE public.enquiry_status AS ENUM ('new','contacted','converted','closed');

CREATE TABLE public.admission_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text NOT NULL,
  child_name text NOT NULL,
  level text NOT NULL,
  message text,
  status public.enquiry_status NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admission_enquiries TO authenticated;
GRANT ALL ON public.admission_enquiries TO service_role;
ALTER TABLE public.admission_enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin reads all enquiries" ON public.admission_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "School admin reads own school enquiries" ON public.admission_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'school_admin') AND school_id = public.get_user_school(auth.uid()));

CREATE TABLE public.admission_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id uuid REFERENCES public.admission_enquiries(id) ON DELETE SET NULL,
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text NOT NULL,
  child_name text NOT NULL,
  child_dob date,
  child_gender text,
  level text NOT NULL,
  previous_school text,
  address text,
  notes text,
  status public.admission_status NOT NULL DEFAULT 'submitted',
  application_fee_kobo integer NOT NULL DEFAULT 2500000,
  receipt_number text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admission_applications TO authenticated;
GRANT ALL ON public.admission_applications TO service_role;
ALTER TABLE public.admission_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin reads all applications" ON public.admission_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "School members read own school applications" ON public.admission_applications FOR SELECT TO authenticated USING (school_id IS NOT NULL AND school_id = public.get_user_school(auth.uid()));

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id uuid,
  title text NOT NULL,
  body text,
  category text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "School admins read school notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'school_admin') AND school_id = public.get_user_school(auth.uid()));
CREATE POLICY "Super admin reads all notifications" ON public.notifications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users mark own notifications read" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "School admins mark school notifications read" ON public.notifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'school_admin') AND school_id = public.get_user_school(auth.uid())) WITH CHECK (public.has_role(auth.uid(),'school_admin') AND school_id = public.get_user_school(auth.uid()));

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS admission_application_id uuid REFERENCES public.admission_applications(id) ON DELETE SET NULL;

CREATE TRIGGER update_admission_enquiries_updated_at BEFORE UPDATE ON public.admission_enquiries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admission_applications_updated_at BEFORE UPDATE ON public.admission_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
