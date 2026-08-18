import React from 'react';
import { 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  Coins, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import type { License, Plan } from '../types';

interface OverviewProps {
  licenses: License[];
  plans: Plan[];
  onNavigate: (tab: string) => void;
  onQuickGenerate: (planName: string, durationValue: number, durationUnit: string, credits: number) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  licenses,
  plans,
  onNavigate,
  onQuickGenerate
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const total = licenses.length;
  const active = licenses.filter(l => l.status === 'active').length;
  const unused = licenses.filter(l => l.status === 'unused').length;
  const expired = licenses.filter(l => l.status === 'expired').length;
  const revoked = licenses.filter(l => l.status === 'revoked').length;
  const totalCredits = licenses.reduce((sum, l) => sum + (l.credits || 0), 0);

  const recentLicenses = licenses.slice(0, 6);

  // Group by plan
  const planCounts: Record<string, number> = {};
  licenses.forEach(l => {
    planCounts[l.plan_name] = (planCounts[l.plan_name] || 0) + 1;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Stat Grid */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--card-accent': 'var(--accent-purple)' } as any}>
          <div className="stat-info">
            <span className="stat-label">Total Licenses</span>
            <span className="stat-value">{total}</span>
            <span className="stat-sub">{unused} unused available</span>
          </div>
          <div className="stat-icon-wrap">
            <KeyRound size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'var(--accent-emerald)' } as any}>
          <div className="stat-info">
            <span className="stat-label">Active Users</span>
            <span className="stat-value">{active}</span>
            <span className="stat-sub" style={{ color: 'var(--accent-emerald)' }}>
              {total > 0 ? `${Math.round((active / total) * 100)}% utilization` : 'No licenses'}
            </span>
          </div>
          <div className="stat-icon-wrap" style={{ color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'var(--accent-amber)' } as any}>
          <div className="stat-info">
            <span className="stat-label">Expired</span>
            <span className="stat-value">{expired}</span>
            <span className="stat-sub">{revoked} revoked keys</span>
          </div>
          <div className="stat-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': 'var(--accent-pink)' } as any}>
          <div className="stat-info">
            <span className="stat-label">Allocated Credits</span>
            <span className="stat-value">{totalCredits.toLocaleString()}</span>
            <span className="stat-sub">Across all active keys</span>
          </div>
          <div className="stat-icon-wrap" style={{ color: 'var(--accent-pink)' }}>
            <Coins size={22} />
          </div>
        </div>
      </div>

      {/* Quick Launch & Plan Distribution Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Quick Generator Box */}
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%)' }}>
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Instant Key Presets</span>
            </div>
            <button onClick={() => onNavigate('generate')} className="btn btn-outline btn-sm">
              Custom Generator <ArrowRight size={13} />
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '18px' }}>
            Generate and activate single-click license keys with pre-configured plans and durations:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onQuickGenerate('pro', 30, 'days', 100)}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-active">PRO</span>
                <span style={{ fontWeight: 600 }}>Standard 30-Day Key</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>100 Credits</span>
            </button>

            <button 
              onClick={() => onQuickGenerate('elite', 1, 'months', 500)}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.4)' }}>ELITE</span>
                <span style={{ fontWeight: 600 }}>Elite 1-Month Key</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>500 Credits</span>
            </button>

            <button 
              onClick={() => onQuickGenerate('lifetime', 100, 'years', 1000)}
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="badge badge-expired">VIP</span>
                <span style={{ fontWeight: 600 }}>Lifetime VIP Access</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1,000 Credits</span>
            </button>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} style={{ color: 'var(--accent-blue)' }} />
              <span>Plans & Tier Distribution</span>
            </div>
            <button onClick={() => onNavigate('plans')} className="btn btn-outline btn-sm">
              Manage Plans
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {plans.map(p => {
              const count = planCounts[p.name] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.badge_color || 'var(--accent-purple)' }} />
                      <span style={{ fontWeight: 600 }}>{p.display_name}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>{count} keys ({pct}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${pct}%`, 
                      background: p.badge_color || 'var(--accent-purple)',
                      borderRadius: '999px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Licenses Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <KeyRound size={18} style={{ color: 'var(--accent-purple)' }} />
            <span>Recent Licenses</span>
          </div>
          <button onClick={() => onNavigate('licenses')} className="btn btn-secondary btn-sm">
            View All ({total}) <ArrowRight size={13} />
          </button>
        </div>

        {recentLicenses.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <KeyRound size={36} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>No licenses generated yet.</p>
            <button onClick={() => onNavigate('generate')} className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Create Your First License Key
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>License Key</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Credits</th>
                  <th>Status</th>
                  <th>Expires / Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentLicenses.map(l => {
                  const isCopied = copiedKey === l.key;
                  return (
                    <tr key={l.id}>
                      <td>
                        <span 
                          className="key-pill"
                          onClick={() => copyToClipboard(l.key)}
                          title="Click to copy key"
                        >
                          {l.key}
                          {isCopied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                        </span>
                      </td>
                      <td>
                        <span className="badge plan-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                          {l.plan_name}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {l.duration_unit === 'lifetime' ? 'Lifetime' : `${l.duration_value} ${l.duration_unit}`}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>
                          {l.credits}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${l.status}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {l.expires_at ? new Date(l.expires_at).toLocaleDateString() : `Created ${new Date(l.created_at).toLocaleDateString()}`}
                      </td>
                      <td>
                        <button 
                          onClick={() => copyToClipboard(l.key)}
                          className="btn btn-secondary btn-sm"
                          title="Copy Key"
                        >
                          {isCopied ? 'Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
