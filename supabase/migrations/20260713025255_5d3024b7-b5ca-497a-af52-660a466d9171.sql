
-- schools additions
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS subscription_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS paystack_customer_code text;

-- subscription_plans
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  amount_kobo integer NOT NULL CHECK (amount_kobo > 0),
  currency text NOT NULL DEFAULT 'NGN',
  duration_days integer NOT NULL DEFAULT 365 CHECK (duration_days > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_plans TO authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view active plans"
  ON public.subscription_plans FOR SELECT TO authenticated
  USING (is_active OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Super admin manages plans"
  ON public.subscription_plans FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_subscription_plans_updated
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- fee_items
CREATE TYPE public.fee_category AS ENUM ('admission', 'school_fee');

CREATE TABLE public.fee_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  category public.fee_category NOT NULL,
  class_level text,
  amount_kobo integer NOT NULL CHECK (amount_kobo > 0),
  currency text NOT NULL DEFAULT 'NGN',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX fee_items_school_idx ON public.fee_items(school_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fee_items TO authenticated;
GRANT ALL ON public.fee_items TO service_role;
ALTER TABLE public.fee_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin sees all fee items"
  ON public.fee_items FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School members view own school fee items"
  ON public.fee_items FOR SELECT TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) AND (is_active OR public.has_role(auth.uid(), 'school_admin')));
CREATE POLICY "School admins manage own fee items"
  ON public.fee_items FOR ALL TO authenticated
  USING (school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'))
  WITH CHECK (school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'));
CREATE TRIGGER trg_fee_items_updated
  BEFORE UPDATE ON public.fee_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- payments
CREATE TYPE public.payment_type AS ENUM ('admission', 'school_fee', 'subscription');
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed', 'abandoned');

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES public.schools(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  payer_email text NOT NULL,
  payer_name text,
  payment_type public.payment_type NOT NULL,
  amount_kobo integer NOT NULL CHECK (amount_kobo > 0),
  currency text NOT NULL DEFAULT 'NGN',
  paystack_reference text NOT NULL UNIQUE,
  paystack_access_code text,
  status public.payment_status NOT NULL DEFAULT 'pending',
  subscription_plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  fee_item_id uuid REFERENCES public.fee_items(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_school_idx ON public.payments(school_id);
CREATE INDEX payments_user_idx ON public.payments(user_id);
CREATE INDEX payments_status_idx ON public.payments(status);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admin sees all payments"
  ON public.payments FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "School admins see own school payments"
  ON public.payments FOR SELECT TO authenticated
  USING (school_id IS NOT NULL AND school_id = public.get_user_school(auth.uid()) AND public.has_role(auth.uid(), 'school_admin'));
CREATE POLICY "Users see their own payments"
  ON public.payments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE TRIGGER trg_payments_updated
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
