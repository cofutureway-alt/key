import React, { useState } from 'react';
import { 
  Radio, 
  Send, 
  XCircle, 
  Terminal, 
  Clock, 
  Smartphone
} from 'lucide-react';
import { LicenseService } from '../supabase';
import type { ValidationResponse } from '../types';

interface TesterProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Tester: React.FC<TesterProps> = ({ onShowToast }) => {
  const [testKey, setTestKey] = useState('ELITE-TEST-1MONTH');
  const [deviceId, setDeviceId] = useState('SIMULATOR_DEVICE_1');
  const [email, setEmail] = useState('user@eliteai.dev');
  const [isTesting, setIsTesting] = useState(false);
  const [response, setResponse] = useState<ValidationResponse | null>(null);
  const [rawJson, setRawJson] = useState<string>('');

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testKey.trim()) {
      onShowToast('Please enter a key to test', 'error');
      return;
    }

    setIsTesting(true);
    setResponse(null);
    setRawJson('');

    try {
      // 1. Call real live Supabase RPC
      const res = await LicenseService.validateKey(testKey, deviceId, email);
      setResponse(res);
      setRawJson(JSON.stringify(res, null, 2));
      
      if (res.valid || res.ok) {
        onShowToast('Key validated & activated successfully!', 'success');
      } else {
        onShowToast(`Validation returned: ${res.error || res.message}`, 'error');
      }
    } catch (err: any) {
      console.error(err);
      onShowToast(`Request failed: ${err.message}`, 'error');
      setRawJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)' }}>
        <div className="card-header">
          <div className="card-title">
            <Radio size={20} style={{ color: 'var(--accent-purple)' }} />
            <span>Live Extension Simulator</span>
          </div>
          <span className="badge badge-active">Direct Endpoint: Supabase RPC & Edge Function</span>
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
          Test any license key here to see the real server verification response, payload structure, and simulated extension UI view.
        </p>

        <form onSubmit={handleTest} style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">License Key to Validate</label>
              <input
                type="text"
                value={testKey}
                onChange={e => setTestKey(e.target.value)}
                placeholder="ELITE-XXXX-XXXX-XXXX"
                className="form-input font-mono"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Simulated Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                className="form-input font-mono"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Simulated User Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isTesting}
              className="btn btn-primary"
              style={{ height: '44px', padding: '0 24px' }}
            >
              <Send size={16} />
              <span>{isTesting ? 'Validating...' : 'Validate Key'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results view */}
      {rawJson && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Simulated Extension UI View */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Smartphone size={18} style={{ color: 'var(--accent-pink)' }} />
                <span>Simulated Extension State</span>
              </div>
              {response?.ok || response?.valid ? (
                <span className="badge badge-active">✓ Valid & Active</span>
              ) : (
                <span className="badge badge-revoked">✗ Denied</span>
              )}
            </div>

            {response?.ok || response?.valid ? (
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800 }}>
                      E
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '15px' }}>{response.branding?.brandName || 'Elite AI'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>v17.0 Suite</div>
                    </div>
                  </div>

                  <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)' }}>
                    PLAN: {response.plan?.toUpperCase() || 'PRO'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Credits Balance</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-pink)', marginTop: '2px' }}>
                      {response.credits ?? 100}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>User Name</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
                      {response.user_name || 'Elite AI User'}
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} style={{ color: 'var(--accent-blue)' }} />
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>Expiration:</span>
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {response.expires_at ? new Date(response.expires_at).toLocaleString() : 'Lifetime (No Expiry)'}
                  </span>
                </div>

                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {response.branding?.creditNote || 'Elite AI • Live Credits Balance'}
                </div>
              </div>
            ) : (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: '30px',
                textAlign: 'center'
              }}>
                <XCircle size={36} style={{ color: 'var(--accent-rose)', margin: '0 auto 12px' }} />
                <h4 style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>Activation Rejected</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
                  {response?.error || response?.message || 'Invalid or revoked license key.'}
                </p>
              </div>
            )}
          </div>

          {/* Raw JSON Payload */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Terminal size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>Live Supabase JSON Response</span>
              </div>
            </div>

            <pre style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              color: '#38bdf8',
              fontSize: '12px',
              lineHeight: '1.5',
              maxHeight: '380px',
              overflowY: 'auto'
            }}>
              {rawJson}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
