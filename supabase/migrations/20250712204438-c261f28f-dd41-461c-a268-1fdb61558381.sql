-- Create signup security table to prevent abuse
CREATE TABLE public.signup_security (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  email_domain TEXT NOT NULL,
  device_fingerprint TEXT,
  phone_number TEXT,
  attempts_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE,
  block_reason TEXT
);

-- Enable RLS
ALTER TABLE public.signup_security ENABLE ROW LEVEL SECURITY;

-- Create policies for signup security
CREATE POLICY "System can manage signup security" 
ON public.signup_security 
FOR ALL 
USING (true);

-- Create function to check signup security
CREATE OR REPLACE FUNCTION public.check_signup_security(
  p_ip_address INET,
  p_email_domain TEXT,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  security_record RECORD;
  result JSON;
BEGIN
  -- Check if IP is temporarily blocked
  SELECT * INTO security_record
  FROM public.signup_security
  WHERE ip_address = p_ip_address
    AND blocked_until > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF FOUND THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'IP temporarily blocked: ' || security_record.block_reason,
      'blocked_until', security_record.blocked_until
    );
  END IF;
  
  -- Check for suspicious patterns
  SELECT COUNT(*) as attempt_count INTO security_record
  FROM public.signup_security
  WHERE (
    ip_address = p_ip_address OR
    email_domain = p_email_domain OR
    (p_device_fingerprint IS NOT NULL AND device_fingerprint = p_device_fingerprint) OR
    (p_phone_number IS NOT NULL AND phone_number = p_phone_number)
  )
  AND created_at > now() - INTERVAL '1 hour';
  
  -- Block if too many attempts
  IF security_record.attempt_count >= 5 THEN
    INSERT INTO public.signup_security (
      ip_address, email_domain, device_fingerprint, phone_number,
      attempts_count, blocked_until, block_reason
    ) VALUES (
      p_ip_address, p_email_domain, p_device_fingerprint, p_phone_number,
      security_record.attempt_count + 1, now() + INTERVAL '1 hour', 'Too many signup attempts'
    );
    
    RETURN json_build_object(
      'allowed', false,
      'reason', 'Too many signup attempts. Please try again later.',
      'blocked_until', now() + INTERVAL '1 hour'
    );
  END IF;
  
  -- Check for disposable email domains
  IF p_email_domain = ANY(ARRAY[
    '10minutemail.com', 'guerrillamail.com', 'tempmail.org', 'throwaway.email',
    'mailinator.com', 'temp-mail.org', 'dispostable.com', 'yopmail.com'
  ]) THEN
    RETURN json_build_object(
      'allowed', false,
      'reason', 'Disposable email addresses are not allowed'
    );
  END IF;
  
  RETURN json_build_object('allowed', true);
END;
$$;

-- Create function to log signup attempts
CREATE OR REPLACE FUNCTION public.log_signup_attempt(
  p_ip_address INET,
  p_email_domain TEXT,
  p_device_fingerprint TEXT DEFAULT NULL,
  p_phone_number TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.signup_security (
    ip_address, email_domain, device_fingerprint, phone_number
  ) VALUES (
    p_ip_address, p_email_domain, p_device_fingerprint, p_phone_number
  );
END;
$$;

-- Create index for performance
CREATE INDEX idx_signup_security_ip_time ON public.signup_security(ip_address, created_at);
CREATE INDEX idx_signup_security_email_time ON public.signup_security(email_domain, created_at);
CREATE INDEX idx_signup_security_blocked ON public.signup_security(blocked_until) WHERE blocked_until IS NOT NULL;