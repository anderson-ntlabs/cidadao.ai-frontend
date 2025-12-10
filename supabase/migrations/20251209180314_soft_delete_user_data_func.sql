-- LGPD soft delete function
CREATE OR REPLACE FUNCTION public.soft_delete_user_data(
    p_user_id UUID
)
RETURNS TABLE(
    tables_affected INTEGER,
    records_deleted INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_tables INTEGER := 0;
    v_records INTEGER := 0;
    v_count INTEGER;
BEGIN
    -- Verify the user is deleting their own data
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Unauthorized: Can only delete own data';
    END IF;

    -- Soft delete agora_profiles
    UPDATE public.agora_profiles
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete agora_sessions
    UPDATE public.agora_sessions
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete agora_diary_entries
    UPDATE public.agora_diary_entries
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete agora_xp_transactions
    UPDATE public.agora_xp_transactions
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete chat_sessions
    UPDATE public.chat_sessions
    SET deleted_at = NOW()
    WHERE user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete kids profiles
    UPDATE public.agora_kids_profiles
    SET deleted_at = NOW()
    WHERE parent_user_id = p_user_id AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    -- Soft delete kids sessions
    UPDATE public.agora_kids_sessions
    SET deleted_at = NOW()
    WHERE kids_profile_id IN (
        SELECT id FROM public.agora_kids_profiles WHERE parent_user_id = p_user_id
    ) AND deleted_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count > 0 THEN v_tables := v_tables + 1; v_records := v_records + v_count; END IF;

    RETURN QUERY SELECT v_tables, v_records;
END;
$$;
