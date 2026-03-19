import React, { useState } from 'react';

const ALL_WORKOUTS = [
  { id: 1, name: 'Push Day — Chest & Shoulders', type: 'strength', tag: 'Strength', meta: '50 min · Intermediate · 420 cal', progress: 80, img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80' },
  { id: 2, name: 'Pull Day — Back & Biceps', type: 'strength', tag: 'Strength', meta: '50 min · Intermediate · 390 cal', progress: 75, img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80' },
  { id: 3, name: 'Leg Day — Quads & Glutes', type: 'strength', tag: 'Strength', meta: '55 min · Advanced · 480 cal', progress: 90, img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&q=80' },
  { id: 4, name: '5K Interval Run', type: 'cardio', tag: 'Cardio', meta: '35 min · Hard · 350 cal', progress: 60, img: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80' },
  { id: 5, name: 'Full Body HIIT Blast', type: 'hiit', tag: 'HIIT', meta: '25 min · Advanced · 320 cal', progress: 95, img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80' },
  { id: 6, name: 'Morning Yoga Flow', type: 'yoga', tag: 'Yoga', meta: '40 min · Beginner · 150 cal', progress: 40, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80' },
  { id: 7, name: 'Core Stability Circuit', type: 'strength', tag: 'Strength', meta: '30 min · Intermediate · 250 cal', progress: 65, img: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&q=80' },
  { id: 8, name: 'Cycling — Zone 3 Push', type: 'cardio', tag: 'Cardio', meta: '45 min · Moderate · 400 cal', progress: 55, img: 'https://images.unsplash.com/photo-1530143311094-34d807799e8f?w=600&q=80' },
  { id: 9, name: 'Kettlebell Swings AMRAP', type: 'hiit', tag: 'HIIT', meta: '20 min · Advanced · 280 cal', progress: 82, img: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&q=80' },
];

const FILTERS = ['All', 'Strength', 'Cardio', 'HIIT', 'Yoga'];

export default function Workouts() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All'
    ? ALL_WORKOUTS
    : ALL_WORKOUTS.filter(w => w.tag === active);

  return (
    <div className="page">
      <div className="hero-banner" style={{ height: 160 }}>
        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=1200&q=80"
          alt="Workouts"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="hero-overlay">
          <div className="hero-label">Library</div>
          <div className="hero-title" style={{ fontSize: 32 }}>WORKOUT LIBRARY</div>
        </div>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActive(f)}
            style={{
              padding: '8px 20px',
              borderRadius: '999px',
              border: `1px solid ${active === f ? 'rgba(198,241,53,0.4)' : 'var(--border)'}`,
              background: active === f ? 'rgba(198,241,53,0.1)' : 'transparent',
              color: active === f ? 'var(--lime)' : 'var(--muted)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 0.18s',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="workout-grid">
        {filtered.map(w => (
          <div className="workout-card" key={w.id}>
            <img
              className="workout-img"
              src={w.img}
              alt={w.name}
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="workout-body">
              <span className={`workout-tag tag-${w.type}`}>{w.tag}</span>
              <div className="workout-name">{w.name}</div>
              <div className="workout-meta">{w.meta}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${w.progress}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
