import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';
import { Generate } from './pages/Generate';
import { Licenses } from './pages/Licenses';
import { Plans } from './pages/Plans';
import { Tester } from './pages/Tester';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import type { License, Plan } from './types';
import { LicenseService, PlanService, AuthService } from './supabase';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Data State
  const [licenses, setLicenses] = useState<License[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Check auth session on startup
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await AuthService.getSession();
        if (session && session.user) {
          setCurrentUser(session.user);
        }
      } catch (err) {
        console.error('Session check failed', err);
      } finally {
        setAuthChecking(false);
      }
    };

    initAuth();

    const { data: authListener } = AuthService.onAuthStateChange((_event, session) => {
      if (session && session.user) {
        setCurrentUser(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [lData, pData] = await Promise.all([
        LicenseService.getAll(),
        PlanService.getAll()
      ]);
      setLicenses(lData);
      setPlans(pData);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to load data: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data whenever authenticated
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
      showToast('Logged out securely.', 'info');
    } catch (err: any) {
      showToast(`Logout error: ${err.message}`, 'error');
    }
  };

  const handleQuickGenerate = async (
    planName: string, 
    durationValue: number, 
    durationUnit: string, 
    credits: number
  ) => {
    try {
      await LicenseService.createSingle({
        key: `ELITE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        plan_name: planName,
        credits,
        total_credits: credits,
        duration_value: durationValue,
        duration_unit: durationUnit,
        notes: `Quick preset (${planName})`
      });
      showToast(`Created 1 ${planName.toUpperCase()} license key!`, 'success');
      loadData();
      setActiveTab('licenses');
    } catch (err: any) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  // 1. Initial loading screen
  if (authChecking) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#090a0f',
        color: '#94a3b8',
        fontSize: '14px',
        fontWeight: 600
      }}>
        Initializing secure session...
      </div>
    );
  }

  // 2. Not logged in -> Show Login portal (Direct Link Protection)
  if (!currentUser) {
    return (
      <>
        <Login
          onLoginSuccess={(user) => setCurrentUser(user)}
          onShowToast={showToast}
        />
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' && <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />}
              {t.type === 'error' && <AlertCircle size={16} style={{ color: 'var(--accent-rose)' }} />}
              {t.type === 'info' && <Info size={16} style={{ color: 'var(--accent-purple)' }} />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // 3. Authenticated -> Full Protected Dashboard
  const activeCount = licenses.filter(l => l.status === 'active').length;

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        totalLicenses={licenses.length}
        activeLicenses={activeCount}
      />

      <div className="main-wrapper">
        <Header
          activeTab={activeTab}
          adminUser={currentUser}
          onOpenGenerate={() => setActiveTab('generate')}
          onRefresh={loadData}
          onLogout={handleLogout}
          isLoading={isLoading}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="content-view">
          {activeTab === 'overview' && (
            <Overview
              licenses={licenses}
              plans={plans}
              onNavigate={setActiveTab}
              onQuickGenerate={handleQuickGenerate}
            />
          )}

          {activeTab === 'generate' && (
            <Generate
              plans={plans}
              onLicenseCreated={loadData}
              onNavigate={setActiveTab}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'licenses' && (
            <Licenses
              licenses={licenses}
              plans={plans}
              onRefresh={loadData}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'plans' && (
            <Plans
              plans={plans}
              onRefresh={loadData}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tester' && (
            <Tester
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)' }} />}
            {t.type === 'error' && <AlertCircle size={16} style={{ color: 'var(--accent-rose)' }} />}
            {t.type === 'info' && <Info size={16} style={{ color: 'var(--accent-purple)' }} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
