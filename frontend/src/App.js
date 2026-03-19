import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AICoach from './pages/AICoach';
import Workouts from './pages/Workouts';
import WorkoutPlan from './pages/WorkoutPlan';
import Nutrition from './pages/Nutrition';
import ActivityLog from './pages/ActivityLog';
import Progress from './pages/Progress';
import Goals from './pages/Goals';
import AuthPage from './pages/AuthPage';

const PAGE_TITLES = {
  dashboard: 'Dashboard', coach: 'AI Coach', workouts: 'Workouts',
  plan: 'Workout Plan', nutrition: 'Nutrition', log: 'Activity Log',
  progress: 'Progress', goals: 'My Goals',
};

function AppShell() {
  const { user, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#080808',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Barlow Condensed', sans-serif",
      fontSize: 32, fontWeight: 900, letterSpacing: 4, color: '#c6f135',
    }}>
      FIT<span style={{ color: '#f2f0ea', fontWeight: 300 }}>AI</span>
    </div>
  );

  if (!user) return <AuthPage />;

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard onNavigate={setActivePage} />;
      case 'coach':     return <AICoach />;
      case 'workouts':  return <Workouts />;
      case 'plan':      return <WorkoutPlan />;
      case 'nutrition': return <Nutrition />;
      case 'log':       return <ActivityLog />;
      case 'progress':  return <Progress />;
      case 'goals':     return <Goals />;
      default:          return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} onNavigate={setActivePage} user={user} onLogout={logout} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">{PAGE_TITLES[activePage]}</div>
          <div className="topbar-right">
            <div className="status-badge">
              <div className="status-dot" />
              AI Coach Online
            </div>
          </div>
        </div>
        {renderPage()}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
