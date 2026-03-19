import React, { useState, useEffect } from 'react';
import { getProgressStats } from '../utils/api';


const TYPE_COLORS = {
  strength: '#c6f135',
  cardio:   '#7da8ff',
  hiit:     '#ffaa55',
  yoga:     '#cc88ff',
  custom:   '#5cc8c8',
};

const LEVEL_PCT = { beginner: 25, intermediate: 60, advanced: 90 };

export default function Progress() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getProgressStats()
      .then(data => setStats(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your progress...</div>
    </div>
  );

  if (error) return (
    <div className="page">
      <div style={{ color: '#ff6b6b', padding: 20, background: 'rgba(255,107,107,0.08)', borderRadius: 12, fontSize: 14 }}>
        ⚠️ {error}
      </div>
    </div>
  );

  // Empty state
  if (!stats || stats.allTime.sessions === 0) return (
    <div className="page">
      <div className="hero-banner" style={{ height: 130 }}>
        <img className="hero-img" src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&q=80" alt="Progress" onError={e => { e.target.style.display='none'; }} />
        <div className="hero-overlay">
          <div className="hero-label">Your Journey</div>
          <div className="hero-title" style={{ fontSize: 30 }}>PROGRESS</div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>📈</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>
          NO DATA YET
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>
          Log workouts in Activity Log to see your progress charts here.
        </div>
      </div>
    </div>
  );

  const maxWeeklyCalories = Math.max(...stats.weeklyTrend.map(w => w.calories), 1);
  const levelPct = LEVEL_PCT[stats.fitnessLevel] || 25;

  return (
    <div className="page">
      <div className="hero-banner" style={{ height: 130 }}>
        <img className="hero-img" src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=1200&q=80" alt="Progress" onError={e => { e.target.style.display='none'; }} />
        <div className="hero-overlay">
          <div className="hero-label">Your Journey</div>
          <div className="hero-title" style={{ fontSize: 30 }}>YOUR PROGRESS</div>
        </div>
      </div>

      {/* All-time stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card highlight">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{stats.allTime.sessions}</div>
          <div className="stat-unit">workouts logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Time</div>
          <div className="stat-value">{stats.allTime.hours}h</div>
          <div className="stat-unit">{stats.allTime.minutes % 60}m remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Calories Burned</div>
          <div className="stat-value">{stats.allTime.calories.toLocaleString()}</div>
          <div className="stat-unit">all time total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Fitness Level</div>
          <div className="stat-value" style={{ fontSize: 22, textTransform: 'capitalize', color: 'var(--lime)' }}>
            {stats.fitnessLevel}
          </div>
          <div className="stat-unit">{stats.goal}</div>
        </div>
      </div>

      <div className="progress-grid">
        {/* Monthly Goals */}
        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 20 }}>Monthly Goals</div>
          {stats.monthlyGoals.map(g => (
            <div key={g.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{g.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                  {g.value.toLocaleString()} / {g.target.toLocaleString()} {g.unit}
                </span>
              </div>
              <div className="prog-bar-row" style={{ marginBottom: 16 }}>
                <div className="prog-bar" style={{ flex: 1 }}>
                  <div className="prog-fill" style={{ width: `${g.pct}%`, background: 'var(--lime)' }} />
                </div>
                <span className="prog-val">{g.pct}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Fitness Level */}
        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 20 }}>Fitness Level</div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Current level</span>
              <span style={{ fontSize: 13, color: 'var(--lime)', fontWeight: 500, textTransform: 'capitalize' }}>{stats.fitnessLevel}</span>
            </div>
            <div className="prog-bar" style={{ height: 8 }}>
              <div className="prog-fill" style={{ width: `${levelPct}%`, background: 'var(--lime)' }} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Goal</span>
              <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{stats.goal}</span>
            </div>
          </div>
          {/* Sessions milestone */}
          {[10, 25, 50, 100].map(milestone => {
            const reached = stats.allTime.sessions >= milestone;
            return (
              <div key={milestone} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                opacity: reached ? 1 : 0.35,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: reached ? 'rgba(198,241,53,0.15)' : 'var(--bg3)',
                  border: `1px solid ${reached ? 'rgba(198,241,53,0.4)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14,
                }}>
                  {reached ? '✓' : '○'}
                </div>
                <span style={{ fontSize: 13, color: reached ? 'var(--text)' : 'var(--muted)' }}>
                  {milestone} sessions milestone
                </span>
              </div>
            );
          })}
        </div>

        {/* Weekly Calorie Trend */}
        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 20 }}>8-Week Calorie Trend</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {stats.weeklyTrend.map((w, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div
                  style={{
                    width: '100%', borderRadius: 4,
                    background: w.calories > 0 ? 'var(--lime)' : 'var(--bg3)',
                    height: `${Math.max((w.calories / maxWeeklyCalories) * 80, w.calories > 0 ? 6 : 4)}px`,
                    transition: 'height 0.6s ease',
                  }}
                  title={`${w.calories} cal · ${w.sessions} sessions`}
                />
                <span style={{ fontSize: 10, color: 'var(--muted)' }}>{w.week}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
            Total: {stats.weeklyTrend.reduce((s, w) => s + w.calories, 0).toLocaleString()} cal over 8 weeks
          </div>
        </div>

        {/* Workout Type Split */}
        <div className="card">
          <div className="section-title" style={{ fontSize: 16, marginBottom: 20 }}>Workout Split</div>
          {stats.typeSplit.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>No workouts logged yet.</div>
          ) : (
            <>
              {stats.typeSplit.map(item => (
                <div key={item.type} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'capitalize' }}>{item.type}</span>
                    <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>
                      {item.count} sessions · {item.pct}%
                    </span>
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{ width: `${item.pct}%`, background: TYPE_COLORS[item.type] || '#888' }} />
                  </div>
                </div>
              ))}
              {/* Visual donut-style split */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 20 }}>
                {stats.typeSplit.map(item => (
                  <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: TYPE_COLORS[item.type] || '#888', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'capitalize' }}>{item.type} {item.pct}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
