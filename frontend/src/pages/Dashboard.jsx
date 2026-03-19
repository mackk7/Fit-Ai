import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const TYPE_META = {
  strength: { tag: 'Strength', cls: 'tag-strength', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80' },
  cardio:   { tag: 'Cardio',   cls: 'tag-cardio',   img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80' },
  hiit:     { tag: 'HIIT',     cls: 'tag-hiit',     img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80' },
  yoga:     { tag: 'Yoga',     cls: 'tag-yoga',     img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80' },
  custom:   { tag: 'Custom',   cls: 'tag-strength', img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80' },
};

function EmptyState({ onNavigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🏋️</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>
        NO WORKOUTS YET
      </div>
      <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
        Log your first workout to see your stats, streak, and progress here.
      </div>
      <button onClick={() => onNavigate('log')} style={{
        padding: '12px 28px', background: 'var(--lime)', color: '#0a0a0a',
        borderRadius: 12, fontWeight: 600, fontSize: 14,
        fontFamily: 'var(--font-body)', border: 'none', cursor: 'pointer',
      }}>
        + Log Your First Workout
      </button>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getDashboardStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Athlete';

  // For bar chart height — scale relative to max minutes in week
  const maxMinutes = stats
    ? Math.max(...(stats.weeklyActivity || []).map(d => d.minutes), 1)
    : 1;

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your stats...</div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div style={{ color: '#ff6b6b', padding: 20, background: 'rgba(255,107,107,0.08)', borderRadius: 12, fontSize: 14 }}>
        ⚠️ {error}
      </div>
    </div>
  );

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero-banner">
        <img className="hero-img"
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
          alt="Gym" onError={e => { e.target.style.display = 'none'; }} />
        <div className="hero-overlay">
          <div className="hero-label">Welcome back, {firstName}</div>
          <div className="hero-title">
            {stats?.streak > 0 ? 'KEEP\nPUSHING.' : "LET'S\nSTART."}
          </div>
          <div className="hero-sub">
            {stats?.streak > 0
              ? `${stats.streak}-day streak · ${stats.monthlyProgress}% of monthly goal`
              : `Goal: ${stats?.goal || 'General Fitness'} · Log your first workout`}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card highlight">
          <div className="stat-label">Active Streak</div>
          <div className="stat-value">{stats?.streak ?? 0}</div>
          <div className="stat-unit">{stats?.streak === 1 ? 'day' : 'days'} in a row</div>
          {stats?.streak > 0 && <div className="stat-change">🔥 Keep it going!</div>}
        </div>
        <div className="stat-card">
          <div className="stat-label">This Week</div>
          <div className="stat-value">{stats?.weeklySessions ?? 0}</div>
          <div className="stat-unit">of {stats?.weeklyTarget ?? 4} target sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Calories Burned</div>
          <div className="stat-value">{(stats?.weeklyCalories ?? 0).toLocaleString()}</div>
          <div className="stat-unit">this week</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Goal</div>
          <div className="stat-value">{stats?.monthlyProgress ?? 0}%</div>
          <div className="stat-unit">
            {stats?.monthlySessions ?? 0} / {stats?.monthlyTarget ?? 20} sessions
          </div>
        </div>
      </div>

      {stats?.totalSessions === 0 ? (
        <EmptyState onNavigate={onNavigate} />
      ) : (
        <>
          {/* Weekly Activity */}
          <div className="section-header">
            <div className="section-title">Weekly Activity</div>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              {stats?.weeklyActivity?.reduce((s, d) => s + d.minutes, 0) ?? 0} min this week
            </span>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            {stats?.weeklyActivity?.every(d => d.minutes === 0) ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 13 }}>
                No activity logged in the last 7 days
              </div>
            ) : (
              <div className="week-bars">
                {stats.weeklyActivity.map((day, i) => {
                  const barH = day.minutes > 0
                    ? Math.max(Math.round((day.minutes / maxMinutes) * 80), 8)
                    : 4;
                  return (
                    <div key={i} className="week-col">
                      <div
                        className={`week-bar${day.minutes > 0 ? ' active' : ''}`}
                        style={{ height: `${barH}px` }}
                        title={day.minutes > 0 ? `${day.minutes} min · ${day.calories} cal` : 'Rest day'}
                      />
                      <span className="week-label">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Goal Progress */}
          <div className="section-header">
            <div className="section-title">Monthly Goal</div>
            <span
              style={{ fontSize: 12, color: 'var(--lime)', cursor: 'pointer' }}
              onClick={() => onNavigate('goals')}
            >
              Edit goals →
            </span>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                {stats?.goal} · {stats?.monthlySessions} of {stats?.monthlyTarget} sessions
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--lime)' }}>
                {stats?.monthlyProgress}%
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: stats?.monthlyProgress >= 100 ? '#5cb85c' : 'var(--lime)',
                width: `${stats?.monthlyProgress ?? 0}%`,
                transition: 'width 1s ease',
              }} />
            </div>
            {/* Mini breakdown */}
            <div style={{ display: 'flex', gap: 24, marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Active minutes</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{(stats?.monthlyMinutes ?? 0).toLocaleString()} min</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Calories</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{(stats?.monthlyCalories ?? 0).toLocaleString()} kcal</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>This week</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{stats?.weeklySessions ?? 0} / {stats?.weeklyTarget ?? 4} sessions</div>
              </div>
            </div>
          </div>

          {/* Recent Workouts */}
          {stats?.recentWorkouts?.length > 0 && (
            <>
              <div className="section-header">
                <div className="section-title">Recent Workouts</div>
                <span className="section-link" onClick={() => onNavigate('log')}>See all →</span>
              </div>
              <div className="workout-grid">
                {stats.recentWorkouts.map(w => {
                  const meta = TYPE_META[w.type] || TYPE_META.custom;
                  return (
                    <div className="workout-card" key={w._id}>
                      <img className="workout-img" src={meta.img} alt={w.name}
                        onError={e => { e.target.style.display = 'none'; }} />
                      <div className="workout-body">
                        <span className={`workout-tag ${meta.cls}`}>{meta.tag}</span>
                        <div className="workout-name">{w.name}</div>
                        <div className="workout-meta">
                          <span>{w.minutes} min</span>
                          <span>{w.calories} cal</span>
                          <span>
                            {new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
