-- ==============================================================================
-- Elite AI - Supabase Backend Database Schema & Functions
-- Project ID: yvnbmlkrwupwlzfbxtvc
-- ==============================================================================

-- 1. Licenses Table
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'unused')),
    plan TEXT NOT NULL DEFAULT 'pro',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    duration_days INTEGER DEFAULT 30,
    duration_unit TEXT DEFAULT 'days' CHECK (duration_unit IN ('minutes', 'hours', 'days', 'months', 'years', 'lifetime')),
    duration_value INTEGER DEFAULT 30,
    credits INTEGER NOT NULL DEFAULT 50,
    total_credits INTEGER NOT NULL DEFAULT 50,
    device_id TEXT,
    bound_email TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert Default Settings
INSERT INTO public.system_settings (key, value)
VALUES 
('branding', '{"brandName": "Elite AI", "brandText": "Elite AI", "badgeText": "PRO", "creditNote": "Elite AI • Live Credits Balance", "logoUrl": "", "socialLinks": {"telegramUrl": "https://t.me/eliteai2"}}'::jsonb),
('operations', '{"forceUpgrade": {"enabled": false, "minSupportedVersion": "17"}, "maintenance": {"enabled": false}}'::jsonb),
('features', '{"chat": true, "downloads": true, "removeWatermark": true, "improvePrompt": true}'::jsonb),
('upstream', '{"apiBase": "https://io.eklas.dev", "masterKey": "EKLAS-NWBY-HD68-2UZN-LGGZ", "active": true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. License Activation Logs Table
CREATE TABLE IF NOT EXISTS public.activation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    license_key TEXT NOT NULL,
    device_id TEXT,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    action TEXT NOT NULL DEFAULT 'validate',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activation_logs ENABLE ROW LEVEL SECURITY;

-- 5. Public RLS Policies
CREATE POLICY "Public Read System Settings" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Public Read Licenses" ON public.licenses
    FOR SELECT USING (true);

CREATE POLICY "Public Insert/Update Licenses" ON public.licenses
    FOR ALL USING (true);

CREATE POLICY "Public Logs Insert" ON public.activation_logs
    FOR ALL USING (true);

-- 6. RPC Function: validate_or_activate_license
CREATE OR REPLACE FUNCTION public.validate_or_activate_license(
    p_key TEXT,
    p_email TEXT DEFAULT NULL,
    p_device_id TEXT DEFAULT NULL,
    p_heartbeat BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lic RECORD;
    v_now TIMESTAMPTZ := now();
    v_expires TIMESTAMPTZ;
    v_branding JSONB;
    v_operations JSONB;
    v_features JSONB;
    v_upstream JSONB;
    v_config JSONB;
BEGIN
    SELECT * INTO v_lic FROM public.licenses WHERE UPPER(TRIM(key)) = UPPER(TRIM(p_key));
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'ok', false,
            'status', 'invalid',
            'error', 'License key not found.'
        );
    END IF;

    IF v_lic.status = 'revoked' THEN
        RETURN jsonb_build_object(
            'ok', false,
            'status', 'revoked',
            'error', 'This license has been revoked by admin.'
        );
    END IF;

    -- Fetch System Settings
    SELECT value INTO v_branding FROM public.system_settings WHERE key = 'branding';
    SELECT value INTO v_operations FROM public.system_settings WHERE key = 'operations';
    SELECT value INTO v_features FROM public.system_settings WHERE key = 'features';
    SELECT value INTO v_upstream FROM public.system_settings WHERE key = 'upstream';

    IF v_branding IS NULL THEN v_branding := '{"brandName": "Elite AI"}'::jsonb; END IF;
    IF v_operations IS NULL THEN v_operations := '{}'::jsonb; END IF;
    IF v_features IS NULL THEN v_features := '{"chat": true, "downloads": true}'::jsonb; END IF;
    IF v_upstream IS NULL THEN v_upstream := '{"apiBase": "https://io.eklas.dev", "masterKey": "EKLAS-NWBY-HD68-2UZN-LGGZ"}'::jsonb; END IF;

    -- First time activation
    IF v_lic.activated_at IS NULL THEN
        IF v_lic.duration_unit = 'lifetime' THEN
            v_expires := NULL;
        ELSIF v_lic.duration_unit = 'minutes' THEN
            v_expires := v_now + (COALESCE(v_lic.duration_value, 30) || ' minutes')::INTERVAL;
        ELSIF v_lic.duration_unit = 'hours' THEN
            v_expires := v_now + (COALESCE(v_lic.duration_value, 24) || ' hours')::INTERVAL;
        ELSIF v_lic.duration_unit = 'months' THEN
            v_expires := v_now + (COALESCE(v_lic.duration_value, 1) || ' months')::INTERVAL;
        ELSIF v_lic.duration_unit = 'years' THEN
            v_expires := v_now + (COALESCE(v_lic.duration_value, 1) || ' years')::INTERVAL;
        ELSE
            v_expires := v_now + (COALESCE(v_lic.duration_value, v_lic.duration_days, 30) || ' days')::INTERVAL;
        END IF;

        UPDATE public.licenses
        SET 
            activated_at = v_now,
            expires_at = v_expires,
            status = 'active',
            device_id = COALESCE(p_device_id, device_id),
            bound_email = COALESCE(p_email, bound_email),
            updated_at = v_now
        WHERE id = v_lic.id;

        v_lic.activated_at := v_now;
        v_lic.expires_at := v_expires;
        v_lic.status := 'active';
    ELSE
        -- Check expiry
        IF v_lic.expires_at IS NOT NULL AND v_now > v_lic.expires_at THEN
            UPDATE public.licenses SET status = 'expired', updated_at = v_now WHERE id = v_lic.id;
            RETURN jsonb_build_object(
                'ok', false,
                'status', 'expired',
                'error', 'License key has expired.'
            );
        END IF;
    END IF;

    v_config := jsonb_build_object(
        'brandName', v_branding->>'brandName',
        'brandText', v_branding->>'brandText',
        'badgeText', v_branding->>'badgeText',
        'creditNote', v_branding->>'creditNote',
        'socialLinks', v_branding->'socialLinks',
        'features', v_features,
        'upstream', v_upstream,
        'operations', v_operations
    );

    RETURN jsonb_build_object(
        'ok', true,
        'valid', true,
        'status', v_lic.status,
        'plan', v_lic.plan,
        'credits', v_lic.credits,
        'total_credits', v_lic.total_credits,
        'activated_at', v_lic.activated_at,
        'expires_at', v_lic.expires_at,
        'config', v_config,
        'upstream', v_upstream
    );
END;
$$;
