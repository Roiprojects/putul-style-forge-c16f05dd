CREATE TABLE public.shiprocket_cancel_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  shiprocket_response JSONB,
  error_message TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_cancel_attempts_status ON public.shiprocket_cancel_attempts(status);
CREATE INDEX idx_cancel_attempts_order ON public.shiprocket_cancel_attempts(order_id);

ALTER TABLE public.shiprocket_cancel_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cancel attempts"
ON public.shiprocket_cancel_attempts
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_shiprocket_cancel_attempts_updated_at
BEFORE UPDATE ON public.shiprocket_cancel_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();