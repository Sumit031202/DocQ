-- Phase 4: RBAC & Auth (RLS Policies)

-- 1. Queue Table Policies
-- Enable RLS (if not already enabled)
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone (anon + authenticated) to view the queue
-- This allows patients to see their status and admins to see the list.
CREATE POLICY "Public read access" 
ON public.queue 
FOR SELECT 
TO public 
USING (true);

-- Policy: Allow ONLY authenticated users (Staff) to update the queue
-- This covers Calling, Marking Done, Skipping, etc.
CREATE POLICY "Staff update access" 
ON public.queue 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Note: We do NOT create an INSERT policy for 'queue' because:
-- Patients use the 'insert_queue_item' RPC (Security Definer) to join.
-- Staff can also use the RPC to add patients on behalf.
-- Direct inserts are blocked for everyone to enforce the atomic token logic.


-- 2. Service Metrics Table Policies
-- Enable RLS
ALTER TABLE public.service_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (Staff) to insert metrics
-- This happens when marking a patient as 'done'.
CREATE POLICY "Staff insert metrics" 
ON public.service_metrics 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Allow read access (optional, for stats)
CREATE POLICY "Public read metrics" 
ON public.service_metrics 
FOR SELECT 
TO public 
USING (true);
