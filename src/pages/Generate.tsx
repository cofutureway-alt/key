import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Clock, 
  Coins, 
  Hash, 
  FileText,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Plan, DurationUnit, License } from '../types';
import { generateKeyString, LicenseService } from '../supabase';

interface GenerateProps {
  plans: Plan[];
  onLicenseCreated: () => void;
  onNavigate: (tab: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Generate: React.FC<GenerateProps> = ({
  plans,
  onLicenseCreated,
  onNavigate,
  onShowToast
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>(plans[0]?.name || 'pro');
  const [durationValue, setDurationValue] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('days');
  const [credits, setCredits] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);
  const [prefix, setPrefix] = useState<string>('ELITE');
  const [notes, setNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [generatedKeys, setGeneratedKeys] = useState<License[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // Auto-fill credits when plan changes
  const handlePlanChange = (planName: string) => {
    setSelectedPlan(planName);
    const plan = plans.find(p => p.name === planName);
    if (plan) {
      setCredits(plan.credits);
      if (plan.name === 'lifetime') {
        setDurationUnit('lifetime');
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < 1) {
      onShowToast('Please specify a quantity of at least 1', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const keysToCreate = [];
      for (let i = 0; i < quantity; i++) {
        keysToCreate.push({
          key: generateKeyString(prefix),
          plan_name: selectedPlan,
          credits: credits,
          total_credits: credits,
          duration_value: durationUnit === 'lifetime' ? 99 : durationValue,
          duration_unit: durationUnit,
          notes: notes.trim() || undefined
        });
      }

      const created = await LicenseService.createBulk(keysToCreate);
      setGeneratedKeys(created);
      onLicenseCreated();

      // Trigger confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onShowToast(`Successfully generated ${created.length} license key(s)!`, 'success');
    } catch (err: any) {
      console.error(err);
      onShowToast(`Failed to generate licenses: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const copyAllKeys = () => {
    const text = generatedKeys.map(k => k.key).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    onShowToast(`Copied ${generatedKeys.length} keys to clipboard!`, 'info');
  };

  const downloadCSV = () => {
    const header = 'Key,Plan,Credits,Duration,Unit,Status,Created At\n';
    const rows = generatedKeys.map(k => 
      `"${k.key}","${k.plan_name}","${k.credits}","${k.duration_value}","${k.duration_unit}","${k.status}","${k.created_at}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elite-ai-licenses-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const text = generatedKeys.map(k => k.key).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elite-ai-keys-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const durationUnits: { id: DurationUnit; label: string }[] = [
    { id: 'minutes', label: 'Minutes' },
    { id: 'hours', label: 'Hours' },
    { id: 'days', label: 'Days' },
    { id: 'months', label: 'Months' },
    { id: 'years', label: 'Years' },
    { id: 'lifetime', label: 'Lifetime' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: generatedKeys.length > 0 ? '1fr 1fr' : '1fr', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Generator Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Sparkles size={20} style={{ color: 'var(--accent-purple)' }} />
            <span>Create License Keys</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Direct Supabase Sync
          </span>
        </div>

        <form onSubmit={handleGenerate}>
          {/* Plan Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} style={{ color: 'var(--accent-purple)' }} />
              <span>Select Plan / Tier</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
              {plans.map(p => (
                <div
                  key={p.id}
                  onClick={() => handlePlanChange(p.name)}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${selectedPlan === p.name ? p.badge_color || 'var(--accent-purple)' : 'var(--border-color)'}`,
                    background: selectedPlan === p.name ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                    {p.display_name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {p.credits} Credits
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Duration Definition (Minutes, Hours, Days, Months, Years, Lifetime) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} style={{ color: 'var(--accent-blue)' }} />
              <span>License Duration</span>
            </label>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
              {durationUnit !== 'lifetime' && (
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Math.max(1, parseInt(e.target.value) || 1))}
                  className="form-input"
                  style={{ width: '130px', fontWeight: 700, fontSize: '16px' }}
                  placeholder="30"
                  required
                />
              )}
              
              <div className="duration-unit-grid" style={{ flex: 1 }}>
                {durationUnits.map(u => (
                  <button
                    type="button"
                    key={u.id}
                    onClick={() => setDurationUnit(u.id)}
                    className={`unit-pill ${durationUnit === u.id ? 'active' : ''}`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-hint">
              {durationUnit === 'lifetime' 
                ? '⭐ Key will never expire upon activation.' 
                : `Key expires ${durationValue} ${durationUnit} after the user activates it in the plugin.`}
            </div>
          </div>

          {/* Credits */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Coins size={15} style={{ color: 'var(--accent-pink)' }} />
              <span>Credits Balance</span>
            </label>
            <input
              type="number"
              min="1"
              max="100000"
              value={credits}
              onChange={(e) => setCredits(Math.max(1, parseInt(e.target.value) || 1))}
              className="form-input"
              style={{ fontWeight: 600 }}
              required
            />
            <div className="form-hint">
              Credits allocated to this license for Lovable AI prompting & downloads.
            </div>
          </div>

          {/* Quantity & Key Prefix */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hash size={15} style={{ color: 'var(--accent-emerald)' }} />
                <span>Quantity (Bulk)</span>
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
                className="form-input"
                style={{ fontWeight: 700 }}
                required
              />
              <div className="form-hint">1 to 500 keys</div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Key Prefix</span>
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                className="form-input font-mono"
                placeholder="ELITE"
                maxLength={10}
              />
              <div className="form-hint">e.g. ELITE, PRO, VIP</div>
            </div>
          </div>

          {/* Notes / Client Tag */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} style={{ color: 'var(--text-muted)' }} />
              <span>Notes / Client Name (Optional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
              placeholder="e.g. Batch #4 - Telegram customer John"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isGenerating}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '10px' }}
          >
            <Sparkles size={18} />
            <span>{isGenerating ? 'Generating Keys...' : `Generate ${quantity} License Key${quantity > 1 ? 's' : ''}`}</span>
          </button>
        </form>
      </div>

      {/* Generated Keys Results Card */}
      {generatedKeys.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={20} style={{ color: 'var(--accent-emerald)' }} />
              <span>Generated Keys ({generatedKeys.length})</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={copyAllKeys} 
                className="btn btn-secondary btn-sm"
                title="Copy all keys"
              >
                {copiedAll ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedAll ? 'Copied All' : 'Copy All'}</span>
              </button>
              
              <button 
                onClick={downloadTXT} 
                className="btn btn-secondary btn-sm"
                title="Download TXT"
              >
                <Download size={14} />
                <span>TXT</span>
              </button>

              <button 
                onClick={downloadCSV} 
                className="btn btn-secondary btn-sm"
                title="Download CSV"
              >
                <Download size={14} />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            maxHeight: '440px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            paddingRight: '6px'
          }}>
            {generatedKeys.map((item, idx) => {
              const isCopied = copiedKey === item.key;
              return (
                <div 
                  key={item.id || idx}
                  style={{
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="key-pill" onClick={() => copyKey(item.key)}>
                      {item.key}
                      {isCopied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                    </span>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                      <span>Plan: <strong style={{ color: 'var(--accent-purple)' }}>{item.plan_name}</strong></span>
                      <span>Credits: <strong>{item.credits}</strong></span>
                      <span>Duration: <strong>{item.duration_unit === 'lifetime' ? 'Lifetime' : `${item.duration_value} ${item.duration_unit}`}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyKey(item.key)}
                    className="btn btn-outline btn-sm"
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => onNavigate('tester')} 
              className="btn btn-outline btn-sm"
              style={{ color: 'var(--accent-purple)', borderColor: 'rgba(139, 92, 246, 0.4)' }}
            >
              Test key in Simulator <ExternalLink size={13} />
            </button>

            <button 
              onClick={() => onNavigate('licenses')} 
              className="btn btn-secondary btn-sm"
            >
              View in Licenses Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
