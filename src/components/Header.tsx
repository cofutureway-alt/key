import React from 'react';
import { Menu, Plus, Globe, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  adminUser: any;
  onOpenGenerate: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  isLoading: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  adminUser,
  onOpenGenerate,
  onRefresh,
  onLogout,
  isLoading,
  onToggleSidebar
}) => {
  const getTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Overview & Analytics';
      case 'generate': return 'License Generator';
      case 'licenses': return 'License Management';
      case 'plans': return 'Plans & Entitlements';
      case 'tester': return 'Extension Simulator';
      case 'settings': return 'System Settings';
      default: return 'Elite AI Dashboard';
    }
  };

  const adminEmail = adminUser?.email || 'mo22menmo7ammed@gmail.com';

  return (
    <header className="top-header">
      <div className="header-title-wrap">
        <button 
          onClick={onToggleSidebar}
          className="btn btn-secondary btn-icon"
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>
        <h1 className="header-page-title">{getTitle()}</h1>
      </div>

      <div className="header-actions">
        {/* Domain Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <Globe size={14} style={{ color: 'var(--accent-purple)' }} />
          <span>key.fakarli.com</span>
        </div>

        {/* Refresh */}
        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="btn btn-secondary btn-sm"
          title="Refresh live data"
        >
          <RefreshCw size={14} className={isLoading ? 'spin-anim' : ''} />
          <span>Refresh</span>
        </button>

        {/* Generate Button */}
        {activeTab !== 'generate' && (
          <button 
            onClick={onOpenGenerate} 
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} />
            <span>Generate Keys</span>
          </button>
        )}

        {/* Admin Profile Pill & Logout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          paddingLeft: '12px',
          borderLeft: '1px solid var(--border-color)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(139, 92, 246, 0.25)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '11px',
              fontWeight: 800
            }}>
              M
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '11.5px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminEmail}
              </span>
              <span style={{ fontSize: '9.5px', color: 'var(--accent-purple)', fontWeight: 700 }}>
                SUPER ADMIN
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="btn btn-outline btn-sm"
            title="Sign Out"
            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
