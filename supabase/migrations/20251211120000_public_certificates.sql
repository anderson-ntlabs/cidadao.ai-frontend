-- Migration: Public Certificates for LGPD Compliance
-- Purpose: Create a table for certificate verification that persists after account deletion
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-11
--
-- LGPD Art. 18 allows data deletion, but certificates need to remain verifiable
-- This table stores minimal public data (no PII) for verification purposes

-- 1. Create public_certificates table (NO foreign key to auth.users - survives account deletion)
CREATE TABLE IF NOT EXISTS public.public_certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Verification
    verification_code TEXT NOT NULL UNIQUE,
    verification_hash TEXT NOT NULL,

    -- Certificate info (no PII - only what appears on the certificate)
    holder_name TEXT NOT NULL,  -- Name as it appears on certificate (user consented to publish)
    certificate_type TEXT NOT NULL DEFAULT 'completion',

    -- Achievement data
    total_hours NUMERIC(10,2) NOT NULL,
    total_xp INTEGER NOT NULL,
    final_level INTEGER NOT NULL,
    final_rank TEXT NOT NULL,
    missions_completed INTEGER DEFAULT 0,

    -- Dates
    program_start_date DATE NOT NULL,
    program_end_date DATE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Status
    is_valid BOOLEAN DEFAULT true NOT NULL,
    revoked_at TIMESTAMPTZ,
    revocation_reason TEXT,

    -- Metadata (no user_id reference - can't be used to identify deleted accounts)
    issuer TEXT DEFAULT 'Academia Cidadao.AI' NOT NULL,
    program_name TEXT DEFAULT 'Capacitacao em IA para Cidadania' NOT NULL,

    -- Tracking (for analytics, not identification)
    verification_count INTEGER DEFAULT 0,
    last_verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create indexes for fast verification lookups
CREATE INDEX IF NOT EXISTS idx_public_certificates_code ON public.public_certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_public_certificates_hash ON public.public_certificates(verification_hash);
CREATE INDEX IF NOT EXISTS idx_public_certificates_issued ON public.public_certificates(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_public_certificates_valid ON public.public_certificates(is_valid) WHERE is_valid = true;

-- 3. Enable RLS (public read for verification, no write from client)
ALTER TABLE public.public_certificates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Anyone can verify a certificate (public read)
CREATE POLICY "Anyone can verify certificates"
    ON public.public_certificates
    FOR SELECT
    USING (true);

-- Only service role can insert/update (server-side only)
-- No INSERT/UPDATE policies for anon/authenticated = writes only via service role

-- 5. Function to verify certificate and increment counter
CREATE OR REPLACE FUNCTION public.verify_certificate(p_code TEXT)
RETURNS TABLE (
    is_valid BOOLEAN,
    holder_name TEXT,
    certificate_type TEXT,
    total_hours NUMERIC,
    final_rank TEXT,
    issued_at TIMESTAMPTZ,
    program_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cert public_certificates%ROWTYPE;
BEGIN
    -- Find certificate
    SELECT * INTO v_cert
    FROM public_certificates c
    WHERE c.verification_code = p_code;

    IF NOT FOUND THEN
        RETURN QUERY SELECT
            false::BOOLEAN,
            NULL::TEXT,
            NULL::TEXT,
            NULL::NUMERIC,
            NULL::TEXT,
            NULL::TIMESTAMPTZ,
            NULL::TEXT;
        RETURN;
    END IF;

    -- Update verification stats
    UPDATE public_certificates
    SET
        verification_count = verification_count + 1,
        last_verified_at = now()
    WHERE id = v_cert.id;

    -- Return certificate data
    RETURN QUERY SELECT
        v_cert.is_valid,
        v_cert.holder_name,
        v_cert.certificate_type,
        v_cert.total_hours,
        v_cert.final_rank,
        v_cert.issued_at,
        v_cert.program_name;
END;
$$;

-- 6. Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.verify_certificate(TEXT) TO authenticated;

-- 7. Grant read access
GRANT SELECT ON public.public_certificates TO anon;
GRANT SELECT ON public.public_certificates TO authenticated;

-- 8. Comments
COMMENT ON TABLE public.public_certificates IS 'Publicly verifiable certificates - survives account deletion for LGPD compliance';
COMMENT ON COLUMN public.public_certificates.verification_code IS 'Unique code for public verification (shown on certificate)';
COMMENT ON COLUMN public.public_certificates.holder_name IS 'Name as it appears on certificate - user consented to publish this';
COMMENT ON COLUMN public.public_certificates.is_valid IS 'Can be revoked if fraud is detected';
