
CREATE TABLE public.otp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.otp_requests FOR ALL TO service_role USING (true);

CREATE TABLE public.admin_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_phones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage" ON public.admin_phones FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can read" ON public.admin_phones FOR SELECT TO service_role USING (true);

CREATE INDEX idx_otp_requests_phone ON public.otp_requests(phone);
CREATE INDEX idx_otp_requests_expires ON public.otp_requests(expires_at);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
