-- ============================================================
-- EXECUTE THIS SQL MANUALLY IN SUPABASE DASHBOARD SQL EDITOR
-- ============================================================
-- This creates the parental_access_codes table and functions
-- for email-based parental verification

-- 1. Add agent_name column to chat_messages if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'chat_messages'
        AND column_name = 'agent_name'
    ) THEN
        ALTER TABLE public.chat_messages ADD COLUMN agent_name TEXT;
    END IF;
END $$;

-- 2. Create parental_access_codes table
CREATE TABLE IF NOT EXISTS public.parental_access_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kids_profile_id UUID NOT NULL REFERENCES public.agora_kids_profiles(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_code_format CHECK (code ~ '^[0-9]{6}$')
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_parental_codes_lookup
ON public.parental_access_codes(code, email, expires_at)
WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parental_codes_expires
ON public.parental_access_codes(expires_at)
WHERE used_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_parental_codes_user
ON public.parental_access_codes(user_id, created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.parental_access_codes ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policy
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'parental_access_codes'
        AND policyname = 'Users can view own parental codes'
    ) THEN
        CREATE POLICY "Users can view own parental codes"
        ON public.parental_access_codes
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Function to generate parental access code
CREATE OR REPLACE FUNCTION public.generate_parental_access_code(
    p_user_id UUID,
    p_kids_profile_id UUID,
    p_email VARCHAR(255)
)
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code VARCHAR(6);
    v_expires_at TIMESTAMPTZ;
BEGIN
    -- Generate 6-digit code
    v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

    -- Set expiration to 10 minutes from now
    v_expires_at := NOW() + INTERVAL '10 minutes';

    -- Invalidate any existing unused codes for this user
    UPDATE public.parental_access_codes
    SET used_at = NOW()
    WHERE user_id = p_user_id
    AND used_at IS NULL;

    -- Insert new code
    INSERT INTO public.parental_access_codes (
        user_id,
        kids_profile_id,
        code,
        email,
        expires_at
    ) VALUES (
        p_user_id,
        p_kids_profile_id,
        v_code,
        p_email,
        v_expires_at
    );

    RETURN v_code;
END;
$$;

-- 7. Function to verify parental access code
CREATE OR REPLACE FUNCTION public.verify_parental_access_code(
    p_code VARCHAR(6),
    p_email VARCHAR(255)
)
RETURNS TABLE (
    is_valid BOOLEAN,
    user_id UUID,
    kids_profile_id UUID,
    child_name VARCHAR(255)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
BEGIN
    -- Find valid code
    SELECT
        pac.id,
        pac.user_id,
        pac.kids_profile_id,
        akp.child_name
    INTO v_record
    FROM public.parental_access_codes pac
    JOIN public.agora_kids_profiles akp ON akp.id = pac.kids_profile_id
    WHERE pac.code = p_code
    AND LOWER(pac.email) = LOWER(p_email)
    AND pac.expires_at > NOW()
    AND pac.used_at IS NULL
    LIMIT 1;

    IF v_record IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, NULL::VARCHAR(255);
        RETURN;
    END IF;

    -- Mark code as used
    UPDATE public.parental_access_codes
    SET used_at = NOW()
    WHERE id = v_record.id;

    -- Return success with profile info
    RETURN QUERY SELECT
        TRUE,
        v_record.user_id,
        v_record.kids_profile_id,
        v_record.child_name;
END;
$$;

-- 8. Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_parental_codes()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.parental_access_codes
    WHERE expires_at < NOW() - INTERVAL '1 day'
    OR used_at < NOW() - INTERVAL '1 day';

    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$;

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.generate_parental_access_code TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_parental_access_code TO authenticated, anon;

-- 10. Add comments
COMMENT ON TABLE public.parental_access_codes IS 'Temporary codes for parent dashboard access, sent via email';
COMMENT ON FUNCTION public.generate_parental_access_code IS 'Generates a 6-digit code valid for 10 minutes';
COMMENT ON FUNCTION public.verify_parental_access_code IS 'Verifies code and marks as used, returns profile info';

-- Done!
SELECT 'Parental access codes setup complete!' as status;
