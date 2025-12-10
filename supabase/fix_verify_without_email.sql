-- Fix: Allow verification by code only (email is optional)
-- Execute this in Supabase Dashboard SQL Editor

CREATE OR REPLACE FUNCTION public.verify_parental_access_code(
    p_code VARCHAR(6),
    p_email VARCHAR(255) DEFAULT NULL
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
    -- Find valid code (email check is optional)
    SELECT
        pac.id,
        pac.user_id,
        pac.kids_profile_id,
        akp.child_name
    INTO v_record
    FROM public.parental_access_codes pac
    JOIN public.agora_kids_profiles akp ON akp.id = pac.kids_profile_id
    WHERE pac.code = p_code
    AND pac.expires_at > NOW()
    AND pac.used_at IS NULL
    -- Only check email if provided and not masked
    AND (p_email IS NULL OR p_email LIKE '%***%' OR LOWER(pac.email) = LOWER(p_email))
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

SELECT 'Function updated to allow verification without email!' as status;
