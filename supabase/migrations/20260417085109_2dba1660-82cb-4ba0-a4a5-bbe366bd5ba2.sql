ALTER TABLE public.cancellation_requests
  DROP CONSTRAINT IF EXISTS cancellation_requests_request_type_check;

ALTER TABLE public.cancellation_requests
  ADD CONSTRAINT cancellation_requests_request_type_check
  CHECK (request_type IN ('refund', 'replacement', 'direct_cancel'));