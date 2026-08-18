import { createClient } from '@supabase/supabase-js';
import type { Plan, License, ValidationResponse, BrandingSettings, OperationsSettings, UpstreamSettings } from './types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yvnbmlkrwupwlzfbxtvc.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fVZseUflJ02A5P5oHLrw3w_uHeUQTHr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'elite_ai_admin_auth'
  }
});

// Helper for generating cryptographic key strings
export function generateKeyString(prefix = 'ELITE', length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const cleanPrefix = prefix.trim() ? `${prefix.trim().toUpperCase()}-` : '';
  
  const segments: string[] = [];
  const segmentCount = 3;
  const charsPerSegment = Math.ceil(length / segmentCount);

  for (let s = 0; s < segmentCount; s++) {
    let seg = '';
    for (let i = 0; i < charsPerSegment; i++) {
      seg += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    segments.push(seg);
  }

  return `${cleanPrefix}${segments.join('-')}`;
}

// Authentication Service
export const AuthService = {
  async login(email: string, pass: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// License API services
export const LicenseService = {
  async getAll(): Promise<License[]> {
    const { data, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createSingle(license: {
    key: string;
    plan_name: string;
    credits: number;
    total_credits: number;
    duration_value: number;
    duration_unit: string;
    notes?: string;
  }): Promise<License> {
    const { data, error } = await supabase
      .from('licenses')
      .insert([{
        key: license.key.toUpperCase().trim(),
        plan_name: license.plan_name.toLowerCase(),
        credits: license.credits,
        total_credits: license.total_credits,
        duration_value: license.duration_value,
        duration_unit: license.duration_unit,
        notes: license.notes || null,
        status: 'unused'
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createBulk(licenses: Array<{
    key: string;
    plan_name: string;
    credits: number;
    total_credits: number;
    duration_value: number;
    duration_unit: string;
    notes?: string;
  }>): Promise<License[]> {
    const records = licenses.map(l => ({
      key: l.key.toUpperCase().trim(),
      plan_name: l.plan_name.toLowerCase(),
      credits: l.credits,
      total_credits: l.total_credits,
      duration_value: l.duration_value,
      duration_unit: l.duration_unit,
      notes: l.notes || null,
      status: 'unused'
    }));

    const { data, error } = await supabase
      .from('licenses')
      .insert(records)
      .select();
    if (error) throw error;
    return data || [];
  },

  async updateLicense(id: string, updates: Partial<License>): Promise<License> {
    const { data, error } = await supabase
      .from('licenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: 'unused' | 'active' | 'expired' | 'revoked'): Promise<void> {
    const { error } = await supabase
      .from('licenses')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },

  async updateCredits(id: string, credits: number, total_credits?: number): Promise<void> {
    const updates: any = { credits };
    if (total_credits !== undefined) updates.total_credits = total_credits;
    const { error } = await supabase
      .from('licenses')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  },

  async extendDuration(id: string, additionalDays: number): Promise<License> {
    const { data: current, error: fetchErr } = await supabase
      .from('licenses')
      .select('*')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;

    const baseDate = current.expires_at ? new Date(current.expires_at) : new Date();
    const newExpires = new Date(baseDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('licenses')
      .update({
        expires_at: newExpires.toISOString(),
        status: 'active'
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('licenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async validateKey(key: string, deviceId = '', email = ''): Promise<ValidationResponse> {
    const { data, error } = await supabase.rpc('validate_or_activate_license', {
      p_key: key.trim(),
      p_device_id: deviceId,
      p_email: email,
      p_extension_version: '17',
      p_is_heartbeat: false
    });
    if (error) throw error;
    return data;
  }
};

// Plan API services
export const PlanService = {
  async getAll(): Promise<Plan[]> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        name: plan.name.toLowerCase().trim(),
        display_name: plan.display_name.trim(),
        description: plan.description,
        credits: plan.credits,
        total_credits: plan.total_credits,
        badge_color: plan.badge_color || '#8b5cf6',
        features: plan.features || {
          projectDownload: true,
          removeWatermark: true,
          approvePlan: true,
          chat: true
        },
        is_default: plan.is_default || false
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Plan>): Promise<Plan> {
    const { data, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};

// Settings Service
export const SettingsService = {
  async getBranding(): Promise<BrandingSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'branding')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || {
      brandName: 'Elite AI',
      brandText: 'Elite AI',
      logoUrl: '',
      socialLinks: {
        telegram: 'https://t.me/eliteai2',
        telegramUrl: 'https://t.me/eliteai2',
        website: 'https://key.fakarli.com'
      },
      footerText: 'Elite AI • v17',
      badgeText: 'PRO',
      creditNote: 'Elite AI • Live Credits Balance'
    };
  },

  async updateBranding(settings: BrandingSettings): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'branding',
        value: settings
      });
    if (error) throw error;
  },

  async getOperations(): Promise<OperationsSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'operations')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || {
      forceUpgrade: { enabled: false, minSupportedVersion: '17', targetVersion: '17' },
      maintenance: { enabled: false, services: { all: true } }
    };
  },

  async updateOperations(operations: OperationsSettings): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'operations',
        value: operations
      });
    if (error) throw error;
  },

  async getUpstream(): Promise<UpstreamSettings> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'upstream')
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value || {
      masterKey: 'EKLAS-NWBY-HD68-2UZN-LGGZ',
      apiBase: 'https://io.eklas.dev',
      enabled: true
    };
  },

  async updateUpstream(upstream: UpstreamSettings): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'upstream',
        value: upstream
      });
    if (error) throw error;
  }
};
