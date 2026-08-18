import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Smartphone, 
  AlertTriangle,
  Server,
  Zap
} from 'lucide-react';
import type { BrandingSettings, OperationsSettings, UpstreamSettings } from '../types';
import { SettingsService, SUPABASE_URL } from '../supabase';

interface SettingsProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Settings: React.FC<SettingsProps> = ({ onShowToast }) => {
  const [branding, setBranding] = useState<BrandingSettings>({
    brandName: 'Elite AI',
    brandText: 'Elite AI',
    logoUrl: '',
    socialLinks: {},
    footerText: 'Elite AI • v17',
    badgeText: 'PRO',
    creditNote: 'Elite AI • Live Credits Balance'
  });

  const [operations, setOperations] = useState<OperationsSettings>({
    forceUpgrade: {
      enabled: false,
      minSupportedVersion: '17',
      targetVersion: '17',
      downloadUrl: '',
      message: 'A new version is available.'
    },
    maintenance: {
      enabled: false,
      reason: 'Scheduled maintenance in progress.',
      services: { all: true, chat: true }
    }
  });

  const [upstream, setUpstream] = useState<UpstreamSettings>({
    masterKey: 'EKLAS-NWBY-HD68-2UZN-LGGZ',
    apiBase: 'https://io.eklas.dev',
    enabled: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const [bData, oData, uData] = await Promise.all([
        SettingsService.getBranding(),
        SettingsService.getOperations(),
        SettingsService.getUpstream()
      ]);
      setBranding(bData);
      setOperations(oData);
      setUpstream(uData);
    } catch (err: any) {
      console.error(err);
      onShowToast(`Failed to load settings: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await Promise.all([
        SettingsService.updateBranding(branding),
        SettingsService.updateOperations(operations),
        SettingsService.updateUpstream(upstream)
      ]);
      onShowToast('All system settings saved to Supabase!', 'success');
    } catch (err: any) {
      onShowToast(`Save failed: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading system configuration...
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveAll} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px' }}>
      {/* Save Button Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Extension & Server Configuration</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            These settings propagate directly to all active plugin instances on key validation and periodic heartbeat.
          </p>
        </div>

        <button type="submit" disabled={isSaving} className="btn btn-primary">
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Branding Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Smartphone size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Extension Branding</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Brand Name</label>
            <input
              type="text"
              value={branding.brandName}
              onChange={e => setBranding(prev => ({ ...prev, brandName: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brand Text Header</label>
            <input
              type="text"
              value={branding.brandText}
              onChange={e => setBranding(prev => ({ ...prev, brandText: e.target.value }))}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Footer Label</label>
            <input
              type="text"
              value={branding.footerText}
              onChange={e => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
              className="form-input"
            />
            <div className="form-hint">e.g. Elite AI • v17</div>
          </div>

          <div className="form-group">
            <label className="form-label">Credit Note</label>
            <input
              type="text"
              value={branding.creditNote}
              onChange={e => setBranding(prev => ({ ...prev, creditNote: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telegram Community / Support URL</label>
            <input
              type="url"
              value={branding.socialLinks?.telegramUrl || branding.socialLinks?.telegram || ''}
              onChange={e => setBranding(prev => ({
                ...prev,
                socialLinks: {
                  ...prev.socialLinks,
                  telegram: e.target.value,
                  telegramUrl: e.target.value
                }
              }))}
              className="form-input"
              placeholder="https://t.me/eliteai2"
            />
            <div className="form-hint">Shown in extension footer and social links</div>
          </div>

          <div className="form-group">
            <label className="form-label">Badge Text</label>
            <input
              type="text"
              value={branding.badgeText}
              onChange={e => setBranding(prev => ({ ...prev, badgeText: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>

        {/* Operational Controls (Maintenance & Upgrade) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Upstream AI Engine Configuration */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)' }}>
            <div className="card-header">
              <div className="card-title">
                <Zap size={18} style={{ color: 'var(--accent-emerald)' }} />
                <span>Upstream AI Engine Bridge</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={upstream.enabled !== false}
                  onChange={e => setUpstream(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: upstream.enabled !== false ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {upstream.enabled !== false ? 'ACTIVE' : 'OFF'}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Upstream API Base URL</label>
                <input
                  type="text"
                  value={upstream.apiBase}
                  onChange={e => setUpstream(prev => ({ ...prev, apiBase: e.target.value }))}
                  className="form-input font-mono"
                  placeholder="https://io.eklas.dev"
                />
                <div className="form-hint">The AI proxy engine handling Lovable chats & project generation</div>
              </div>

              <div className="form-group">
                <label className="form-label">Upstream Master Key</label>
                <input
                  type="text"
                  value={upstream.masterKey}
                  onChange={e => setUpstream(prev => ({ ...prev, masterKey: e.target.value }))}
                  className="form-input font-mono"
                  placeholder="EKLAS-XXXX-XXXX-XXXX-XXXX"
                />
                <div className="form-hint">Master authorization key for Lovable AI upstream requests</div>
              </div>
            </div>
          </div>

          {/* Server Connection Info */}
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.08) 100%)' }}>
            <div className="card-header">
              <div className="card-title">
                <Server size={18} style={{ color: 'var(--accent-blue)' }} />
                <span>Backend Endpoints</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Supabase URL:</span>
                <div className="font-mono" style={{ color: 'var(--accent-cyan)', marginTop: '2px', wordBreak: 'break-all' }}>
                  {SUPABASE_URL}
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Edge Function API Endpoint:</span>
                <div className="font-mono" style={{ color: '#a78bfa', marginTop: '2px', wordBreak: 'break-all' }}>
                  {SUPABASE_URL}/functions/v1/license-api
                </div>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Target Dashboard Domain:</span>
                <div className="font-mono" style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}>
                  key.fakarli.com
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <AlertTriangle size={18} style={{ color: 'var(--accent-amber)' }} />
                <span>Maintenance Mode</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={operations.maintenance?.enabled || false}
                  onChange={e => setOperations(prev => ({
                    ...prev,
                    maintenance: { ...prev.maintenance, enabled: e.target.checked }
                  }))}
                />
                <span style={{ fontSize: '13px', fontWeight: 700, color: operations.maintenance?.enabled ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                  {operations.maintenance?.enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </label>
            </div>

            {operations.maintenance?.enabled && (
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Maintenance Notice Message</label>
                <input
                  type="text"
                  value={operations.maintenance?.reason || ''}
                  onChange={e => setOperations(prev => ({
                    ...prev,
                    maintenance: { ...prev.maintenance, reason: e.target.value }
                  }))}
                  className="form-input"
                  placeholder="System maintenance in progress..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
