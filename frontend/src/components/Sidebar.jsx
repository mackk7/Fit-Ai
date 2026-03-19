import React from 'react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg> },
  { id: 'coach',     label: 'AI Coach',     icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 10.5c0 .83-.67 1.5-1.5 1.5H4l-2.5 2.5V3.5C1.5 2.67 2.17 2 3 2h9.5c.83 0 1.5.67 1.5 1.5v7z"/></svg> },
  { id: 'workouts',  label: 'Workouts',     icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h2M13 8h2M3 8h10M5 5v6M11 5v6"/></svg> },
  { id: 'plan',      label: 'Workout Plan', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 5h6M5 8h6M5 11h4"/></svg> },
  { id: 'nutrition', label: 'Nutrition',    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2C5.24 2 3 4.24 3 7c0 2.38 1.64 4.37 3.88 4.88L7 14h2l.12-2.12C11.36 11.37 13 9.38 13 7c0-2.76-2.24-5-5-5z"/></svg> },
  { id: 'log',       label: 'Activity Log', icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 8l2 2 4-4"/></svg> },
  { id: 'progress',  label: 'Progress',     icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="2,12 5,7 9,9 12,4 14,5"/></svg> },
  { id: 'goals',     label: 'My Goals',     icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/></svg> },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="sidebar">
      <div className="logo">FIT<span>AI</span></div>
      <div className="logo-sub">AI Personal Coach</div>

      <div className="nav-section-label">Main Menu</div>
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`nav-item${activePage === item.id ? ' active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div className="user-plan">{user?.goal || 'Pro Member'}</div>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#444', padding: 4, borderRadius: 6,
              transition: 'color 0.18s', flexShrink: 0,
            }}
            onMouseOver={e => e.currentTarget.style.color = '#ff6b6b'}
            onMouseOut={e => e.currentTarget.style.color = '#444'}
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 2h3a1 1 0 011 1v10a1 1 0 01-1 1h-3M7 11l3-3-3-3M10 8H2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
