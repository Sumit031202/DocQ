-- Phase 3: Atomic Token Generation RPC

CREATE OR REPLACE FUNCTION public.insert_queue_item(
  p_name text,
  p_phone text,
  p_email text,
  p_reason text
) RETURNS public.queue AS $$
DECLARE
  new_token integer;
  new_full text;
  inserted_row public.queue%ROWTYPE;
  avg_service_time integer;
  people_ahead integer;
BEGIN
  -- 1. Concurrency Safety: Advisory lock based on date
  -- This ensures only one transaction can generate a token for today at a time
  PERFORM pg_advisory_xact_lock(hashtext('queue_daily_token_' || current_date::text));

  -- 1.5 Check for duplicate phone number for today (Prevent Spam)
  IF EXISTS (
    SELECT 1 FROM public.queue 
    WHERE phone = p_phone 
      AND token_date = current_date 
      AND status NOT IN ('cancelled')
  ) THEN
    RAISE EXCEPTION 'You already have a token for today.';
  END IF;

  -- 2. Calculate next token number
  SELECT COALESCE(MAX(token_number), 0) + 1 INTO new_token
    FROM public.queue WHERE token_date = current_date;

  -- 3. Format full token string (YYYYMMDD-XXX)
  new_full := to_char(current_date, 'YYYYMMDD') || '-' || lpad(new_token::text, 3, '0');

  -- 4. Calculate Estimated Wait Time
  -- A. Get average service time from last 20 served patients (default 10 mins = 600s)
  SELECT COALESCE(AVG(service_duration_seconds)::integer, 600) INTO avg_service_time
  FROM (
    SELECT service_duration_seconds FROM public.service_metrics
    ORDER BY created_at DESC LIMIT 20
  ) sub;

  -- B. Count people ahead (status = 'waiting')
  SELECT COUNT(*) INTO people_ahead
  FROM public.queue
  WHERE token_date = current_date AND status = 'waiting';

  -- 5. Insert new queue item
  INSERT INTO public.queue (
    token_date, 
    token_number, 
    full_token, 
    name, 
    phone, 
    email, 
    reason, 
    status, 
    estimated_wait_seconds
  )
  VALUES (
    current_date, 
    new_token, 
    new_full, 
    p_name, 
    p_phone, 
    p_email, 
    p_reason, 
    'waiting', 
    (avg_service_time * people_ahead)
  )
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SECURITY DEFINER allows this function to run with the privileges of the creator (postgres),
-- bypassing RLS on the table for the insert/selects inside. 
-- This is safe here because we control the logic strictly.
