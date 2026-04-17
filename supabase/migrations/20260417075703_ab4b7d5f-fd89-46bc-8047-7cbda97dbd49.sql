CREATE TABLE public.cancellation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reason text NOT NULL,
  reason_note text,
  request_type text NOT NULL CHECK (request_type IN ('refund', 'replacement')),
  payment_method text,
  refund_method text CHECK (refund_method IN ('original', 'bank', 'upi')),
  bank_name text,
  account_holder text,
  account_number text,
  ifsc text,
  upi_id text,
  replacement_size text,
  replacement_color text,
  replacement_variant text,
  replacement_note text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own cancellation requests"
ON public.cancellation_requests FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own cancellation requests"
ON public.cancellation_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage cancellation requests"
ON public.cancellation_requests FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cancellation_requests_updated_at
BEFORE UPDATE ON public.cancellation_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_cancellation_requests_order_id ON public.cancellation_requests(order_id);
CREATE INDEX idx_cancellation_requests_user_id ON public.cancellation_requests(user_id);
CREATE INDEX idx_cancellation_requests_status ON public.cancellation_requests(status);