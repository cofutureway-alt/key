export interface Plan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  credits: number;
  total_credits: number;
  badge_color: string;
  features: {
    projectDownload?: boolean;
    removeWatermark?: boolean;
    approvePlan?: boolean;
    chat?: boolean;
    [key: string]: any;
  };
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export type DurationUnit = 'minutes' | 'hours' | 'days' | 'months' | 'years' | 'lifetime';

export type LicenseStatus = 'unused' | 'active' | 'expired' | 'revoked';

export interface License {
  id: string;
  key: string;
  plan_name: string;
  credits: number;
  total_credits: number;
  duration_value: number;
  duration_unit: DurationUnit;
  status: LicenseStatus;
  device_id: string | null;
  email: string | null;
  user_name: string | null;
  activated_at: string | null;
  expires_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandingSettings {
  brandName: string;
  brandText: string;
  logoUrl: string;
  socialLinks: Record<string, string>;
  footerText: string;
  badgeText: string;
  creditNote: string;
}

export interface OperationsSettings {
  forceUpgrade: {
    enabled: boolean;
    minSupportedVersion?: string;
    targetVersion?: string;
    downloadUrl?: string;
    message?: string;
  };
  maintenance: {
    enabled: boolean;
    reason?: string;
    services?: {
      all?: boolean;
      chat?: boolean;
    };
  };
}

export interface UpstreamSettings {
  masterKey: string;
  apiBase: string;
  enabled: boolean;
}

export interface ValidationResponse {
  ok: boolean;
  valid: boolean;
  message?: string;
  error?: string;
  reason?: string | null;
  session_id?: string;
  user_name?: string;
  email?: string | null;
  plan?: string;
  status?: string;
  license_id?: string;
  key?: string;
  credits?: number;
  total_credits?: number;
  activated_at?: string;
  expires_at?: string;
  config?: any;
  branding?: any;
  operations?: any;
  extensionV5?: any;
}
