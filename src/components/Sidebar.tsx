import React from 'react';
import { 
  LayoutDashboard, 
  KeyRound, 
  PlusCircle, 
  Layers, 
  Radio, 
  Settings, 
  ShieldCheck,
  ExternalLink,
  Zap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  totalLicenses: number;
  activeLicenses: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen,
  totalLicenses,
  activeLicenses
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'generate', label: 'Generate Keys', icon: PlusCircle, badge: 'New' },
    { id: 'licenses', label: 'Licenses', icon: KeyRound, count: totalLicenses },
    { id: 'plans', label: 'Plans & Tiers', icon: Layers },
    { id: 'tester', label: 'Extension Tester', icon: Radio },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-icon">
          <Zap size={22} />
        </div>
        <div>
          <div className="brand-title">Elite AI</div>
          <span className="brand-badge">Server v17</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 6px', letterSpacing: '0.08em' }}>
          Management
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge && (
                <span style={{ 
                  fontSize: '10px', 
                  padding: '2px 6px', 
                  background: 'var(--gradient-primary)', 
                  color: 'white', 
                  borderRadius: '999px',
                  fontWeight: 700
                }}>
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && (
                <span style={{ 
                  fontSize: '11px', 
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ marginTop: '20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 6px', letterSpacing: '0.08em' }}>
          Quick Links
        </div>

        <a 
          href="https://supabase.com/dashboard/project/yvnbmlkrwupwlzfbxtvc" 
          target="_blank" 
          rel="noreferrer"
          className="nav-item"
        >
          <ShieldCheck size={18} />
          <span style={{ flex: 1, textAlign: 'left' }}>Supabase Backend</span>
          <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="server-status-pill">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="status-dot-pulse" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Live Server</span>
          </div>
          <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
            {activeLicenses} Active
          </span>
        </div>
      </div>
    </aside>
  );
};
