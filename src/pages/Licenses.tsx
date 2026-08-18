import React, { useState } from 'react';
import { 
  Search, 
  Copy, 
  Check, 
  Trash2, 
  Download, 
  Edit3,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import type { License, Plan, DurationUnit, LicenseStatus } from '../types';
import { LicenseService } from '../supabase';

interface LicensesProps {
  licenses: License[];
  plans: Plan[];
  onRefresh: () => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Licenses: React.FC<LicensesProps> = ({
  licenses,
  plans,
  onRefresh,
  onShowToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Comprehensive Edit Modal
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editPlan, setEditPlan] = useState('pro');
  const [editCredits, setEditCredits] = useState(100);
  const [editDurationVal, setEditDurationVal] = useState(30);
  const [editDurationUnit, setEditDurationUnit] = useState<DurationUnit>('days');
  const [editExpiresAt, setEditExpiresAt] = useState('');
  const [editStatus, setEditStatus] = useState<LicenseStatus>('unused');
  const [editNotes, setEditNotes] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editDeviceId, setEditDeviceId] = useState('');

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleRevoke = async (l: License) => {
    const nextStatus: LicenseStatus = l.status === 'revoked' ? (l.activated_at ? 'active' : 'unused') : 'revoked';
    try {
      await LicenseService.updateStatus(l.id, nextStatus);
      onShowToast(`License ${l.key} marked as ${nextStatus.toUpperCase()}`, 'success');
      onRefresh();
    } catch (err: any) {
      onShowToast(`Failed to update status: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (id: string, key: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete key "${key}"?`)) return;
    try {
      await LicenseService.delete(id);
      onShowToast(`Key ${key} deleted permanently`, 'info');
      onRefresh();
    } catch (err: any) {
      onShowToast(`Failed to delete: ${err.message}`, 'error');
    }
  };

  const openEditModal = (l: License) => {
    setEditingLicense(l);
    setEditKey(l.key);
    setEditPlan(l.plan_name);
    setEditCredits(l.credits);
    setEditDurationVal(l.duration_value);
    setEditDurationUnit(l.duration_unit);
    setEditExpiresAt(l.expires_at ? new Date(l.expires_at).toISOString().slice(0, 16) : '');
    setEditStatus(l.status);
    setEditNotes(l.notes || '');
    setEditEmail(l.email || '');
    setEditUserName(l.user_name || '');
    setEditDeviceId(l.device_id || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;

    try {
      const updates: Partial<License> = {
        key: editKey.trim().toUpperCase(),
        plan_name: editPlan.toLowerCase(),
        credits: editCredits,
        total_credits: editCredits,
        duration_value: editDurationVal,
        duration_unit: editDurationUnit,
        status: editStatus,
        notes: editNotes.trim() || null,
        email: editEmail.trim() || null,
        user_name: editUserName.trim() || null,
        device_id: editDeviceId.trim() || null,
        expires_at: editExpiresAt ? new Date(editExpiresAt).toISOString() : null
      };

      await LicenseService.updateLicense(editingLicense.id, updates);
      onShowToast(`License ${editKey} updated successfully!`, 'success');
      setEditingLicense(null);
      onRefresh();
    } catch (err: any) {
      onShowToast(`Failed to save changes: ${err.message}`, 'error');
    }
  };

  const handleExportCSV = () => {
    const header = 'Key,Plan,Credits,Duration,Unit,Status,User,Device ID,Email,Activated At,Expires At,Notes\n';
    const rows = filteredLicenses.map(l => 
      `"${l.key}","${l.plan_name}","${l.credits}","${l.duration_value}","${l.duration_unit}","${l.status}","${l.user_name || ''}","${l.device_id || ''}","${l.email || ''}","${l.activated_at || ''}","${l.expires_at || ''}","${(l.notes || '').replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elite-licenses-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLicenses = licenses.filter(l => {
    const matchesSearch = 
      l.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.user_name && l.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.notes && l.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    const matchesPlan = planFilter === 'all' || l.plan_name.toLowerCase() === planFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredLicenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLicenses.map(l => l.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkRevoke = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Revoke ${selectedIds.length} selected license(s)?`)) return;
    try {
      await Promise.all(selectedIds.map(id => LicenseService.updateStatus(id, 'revoked')));
      onShowToast(`Revoked ${selectedIds.length} licenses`, 'success');
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      onShowToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected license(s)?`)) return;
    try {
      await Promise.all(selectedIds.map(id => LicenseService.delete(id)));
      onShowToast(`Deleted ${selectedIds.length} licenses`, 'info');
      setSelectedIds([]);
      onRefresh();
    } catch (err: any) {
      onShowToast(`Error: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by key, email, client name, or notes..."
            className="search-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '10px 14px' }}
          >
            <option value="all">All Statuses</option>
            <option value="unused">Unused</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '10px 14px' }}
          >
            <option value="all">All Plans</option>
            {plans.map(p => (
              <option key={p.id} value={p.name}>{p.display_name}</option>
            ))}
          </select>

          {/* Export CSV */}
          <button 
            onClick={handleExportCSV}
            className="btn btn-secondary"
            title="Export filtered to CSV"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(139, 92, 246, 0.15)',
          border: '1px solid var(--accent-purple)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontWeight: 600, fontSize: '13.5px' }}>
            {selectedIds.length} license(s) selected
          </span>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleBulkRevoke} className="btn btn-secondary btn-sm">
              <ShieldAlert size={14} style={{ color: 'var(--accent-rose)' }} />
              <span>Revoke Selected</span>
            </button>

            <button onClick={handleBulkDelete} className="btn btn-danger btn-sm">
              <Trash2 size={14} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filteredLicenses.length > 0 && selectedIds.length === filteredLicenses.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>License Key</th>
                <th>Plan Tier</th>
                <th>Credits</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Activated / User</th>
                <th>Expires At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '50px', color: 'var(--text-muted)' }}>
                    No licenses found. Use the <strong>Generate Keys</strong> tab to create your first real key!
                  </td>
                </tr>
              ) : (
                filteredLicenses.map(l => {
                  const isCopied = copiedKey === l.key;
                  const isSelected = selectedIds.includes(l.id);
                  const isExpired = l.expires_at && new Date() >= new Date(l.expires_at);

                  return (
                    <tr key={l.id} style={{ background: isSelected ? 'rgba(139, 92, 246, 0.05)' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectId(l.id)}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span 
                            className="key-pill"
                            onClick={() => copyToClipboard(l.key)}
                            title="Click to copy key"
                          >
                            {l.key}
                            {isCopied ? <Check size={13} style={{ color: 'var(--accent-emerald)' }} /> : <Copy size={13} />}
                          </span>
                          {l.notes && (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {l.notes}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge plan-badge" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-purple)', border: '1px solid rgba(139, 92, 246, 0.4)' }}>
                          {l.plan_name}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--accent-pink)' }}>
                          {l.credits}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {l.duration_unit === 'lifetime' ? 'Lifetime' : `${l.duration_value} ${l.duration_unit}`}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${l.status}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {l.activated_at ? (
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{l.user_name || 'Active User'}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(l.activated_at).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Not activated</span>
                        )}
                      </td>
                      <td>
                        {l.expires_at ? (
                          <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                            <span style={{ color: isExpired ? 'var(--accent-rose)' : 'var(--text-primary)', fontWeight: 600 }}>
                              {new Date(l.expires_at).toLocaleDateString()}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              {new Date(l.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {l.duration_unit === 'lifetime' ? 'Never' : 'Upon activation'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => openEditModal(l)}
                            className="btn btn-secondary btn-sm"
                            title="Edit License"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleToggleRevoke(l)}
                            className={`btn ${l.status === 'revoked' ? 'btn-secondary' : 'btn-outline'} btn-sm`}
                            style={{ color: l.status === 'revoked' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}
                            title={l.status === 'revoked' ? 'Restore License' : 'Revoke License'}
                          >
                            {l.status === 'revoked' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                            <span>{l.status === 'revoked' ? 'Restore' : 'Revoke'}</span>
                          </button>

                          <button
                            onClick={() => handleDelete(l.id, l.key)}
                            className="btn btn-outline btn-icon"
                            style={{ color: 'var(--text-muted)' }}
                            title="Delete License"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Edit License Modal */}
      {editingLicense && (
        <div className="modal-overlay" onClick={() => setEditingLicense(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="card-header">
              <div className="card-title">
                <Edit3 size={18} style={{ color: 'var(--accent-purple)' }} />
                <span>Edit License: {editingLicense.key}</span>
              </div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">License Key</label>
                  <input
                    type="text"
                    value={editKey}
                    onChange={e => setEditKey(e.target.value.toUpperCase())}
                    className="form-input font-mono"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plan Tier</label>
                  <select
                    value={editPlan}
                    onChange={e => setEditPlan(e.target.value)}
                    className="form-select"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.name}>{p.display_name} ({p.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    min="0"
                    max="100000"
                    value={editCredits}
                    onChange={e => setEditCredits(parseInt(e.target.value) || 0)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={editDurationVal}
                    onChange={e => setEditDurationVal(parseInt(e.target.value) || 1)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    value={editDurationUnit}
                    onChange={e => setEditDurationUnit(e.target.value as DurationUnit)}
                    className="form-select"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                    <option value="lifetime">Lifetime</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as LicenseStatus)}
                    className="form-select"
                  >
                    <option value="unused">Unused</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="revoked">Revoked</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Expiration Date</label>
                  <input
                    type="datetime-local"
                    value={editExpiresAt}
                    onChange={e => setEditExpiresAt(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Bound User / Client Name</label>
                  <input
                    type="text"
                    value={editUserName}
                    onChange={e => setEditUserName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. John Doe"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">User Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="form-input"
                    placeholder="user@domain.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Notes / Tag</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="form-input"
                  placeholder="Notes about client, sales channel, batch number, etc."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingLicense(null)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save All Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
