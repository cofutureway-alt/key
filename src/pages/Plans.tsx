import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Coins 
} from 'lucide-react';
import type { Plan } from '../types';
import { PlanService } from '../supabase';

interface PlansProps {
  plans: Plan[];
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Plans: React.FC<PlansProps> = ({
  plans,
  onRefresh,
  onShowToast
}) => {
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState(100);
  const [badgeColor, setBadgeColor] = useState('#8b5cf6');
  const [features, setFeatures] = useState({
    chat: true,
    projectDownload: true,
    removeWatermark: true,
    approvePlan: true
  });

  const openCreateModal = () => {
    setName('');
    setDisplayName('');
    setDescription('');
    setCredits(100);
    setBadgeColor('#8b5cf6');
    setFeatures({ chat: true, projectDownload: true, removeWatermark: true, approvePlan: true });
    setIsCreating(true);
  };

  const openEditModal = (p: Plan) => {
    setEditingPlan(p);
    setName(p.name);
    setDisplayName(p.display_name);
    setDescription(p.description || '');
    setCredits(p.credits);
    setBadgeColor(p.badge_color || '#8b5cf6');
    setFeatures({
      chat: p.features?.chat !== false,
      projectDownload: p.features?.projectDownload !== false,
      removeWatermark: p.features?.removeWatermark !== false,
      approvePlan: p.features?.approvePlan !== false
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await PlanService.update(editingPlan.id, {
          display_name: displayName,
          description: description || null,
          credits,
          total_credits: credits,
          badge_color: badgeColor,
          features
        });
        onShowToast(`Plan ${displayName} updated successfully`, 'success');
      } else {
        await PlanService.create({
          name,
          display_name: displayName,
          description: description || null,
          credits,
          total_credits: credits,
          badge_color: badgeColor,
          features,
          is_default: false
        });
        onShowToast(`Plan ${displayName} created successfully`, 'success');
      }
      setEditingPlan(null);
      setIsCreating(false);
      onRefresh();
    } catch (err: any) {
      onShowToast(`Failed to save plan: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: string, planName: string) => {
    if (!window.confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;
    try {
      await PlanService.delete(id);
      onShowToast(`Plan ${planName} deleted`, 'info');
      onRefresh();
    } catch (err: any) {
      onShowToast(`Failed to delete plan: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Plan Configurations</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Define the plan tiers, feature entitlements, and default credit quotas for generated licenses.
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={16} />
          <span>New Plan Tier</span>
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {plans.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span 
                    className="badge" 
                    style={{ 
                      background: `${p.badge_color || '#8b5cf6'}25`, 
                      color: p.badge_color || '#8b5cf6', 
                      border: `1px solid ${p.badge_color || '#8b5cf6'}60`,
                      marginBottom: '8px'
                    }}
                  >
                    SLUG: {p.name.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {p.display_name}
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => openEditModal(p)}
                    className="btn btn-secondary btn-icon"
                    title="Edit Plan"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id, p.display_name)}
                    className="btn btn-outline btn-icon"
                    style={{ color: 'var(--accent-rose)' }}
                    title="Delete Plan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', minHeight: '38px' }}>
                {p.description || 'No description provided.'}
              </p>

              {/* Credits & Features Breakdown */}
              <div style={{
                padding: '14px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={16} style={{ color: 'var(--accent-pink)' }} />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Default Quota:</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {p.credits} Credits
                </span>
              </div>

              {/* Entitlement Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: p.features?.chat !== false ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {p.features?.chat !== false ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <span style={{ width: 14 }}>✕</span>}
                  <span>AI Prompting & Chat Assist</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: p.features?.projectDownload !== false ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {p.features?.projectDownload !== false ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <span style={{ width: 14 }}>✕</span>}
                  <span>One-Click Full Project Download</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: p.features?.removeWatermark !== false ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {p.features?.removeWatermark !== false ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <span style={{ width: 14 }}>✕</span>}
                  <span>Remove Lovable Watermark / Badge</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: p.features?.approvePlan !== false ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {p.features?.approvePlan !== false ? <Check size={14} style={{ color: 'var(--accent-emerald)' }} /> : <span style={{ width: 14 }}>✕</span>}
                  <span>Auto-Approve Plan Modifications</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Selected plan appears inside the extension upon key activation.
            </div>
          </div>
        ))}
      </div>

      {/* Plan Edit / Create Modal */}
      {(editingPlan || isCreating) && (
        <div className="modal-overlay" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="card-header">
              <div className="card-title">
                <Layers size={18} style={{ color: 'var(--accent-purple)' }} />
                <span>{isCreating ? 'Create New Plan' : `Edit Plan: ${displayName}`}</span>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Plan Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. VIP Developer"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Internal Name / Slug</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="e.g. vip"
                    disabled={!isCreating}
                    className="form-input font-mono"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Plan description displayed to admins"
                  className="form-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Default Credits</label>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={credits}
                    onChange={e => setCredits(parseInt(e.target.value) || 0)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Badge Color</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={badgeColor}
                      onChange={e => setBadgeColor(e.target.value)}
                      style={{ width: '42px', height: '42px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={badgeColor}
                      onChange={e => setBadgeColor(e.target.value)}
                      className="form-input font-mono"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Feature Flags */}
              <div className="form-group">
                <label className="form-label">Feature Entitlements</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={features.chat}
                      onChange={e => setFeatures(prev => ({ ...prev, chat: e.target.checked }))}
                    />
                    <span>Allow AI Prompting & Chat Features</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={features.projectDownload}
                      onChange={e => setFeatures(prev => ({ ...prev, projectDownload: e.target.checked }))}
                    />
                    <span>Allow Full Project ZIP Download</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={features.removeWatermark}
                      onChange={e => setFeatures(prev => ({ ...prev, removeWatermark: e.target.checked }))}
                    />
                    <span>Allow Watermark / Badge Removal</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={features.approvePlan}
                      onChange={e => setFeatures(prev => ({ ...prev, approvePlan: e.target.checked }))}
                    />
                    <span>Allow Auto-Approve Plan Modifications</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => { setEditingPlan(null); setIsCreating(false); }} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isCreating ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
