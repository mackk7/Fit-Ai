import React, { useState, useEffect } from 'react';
import { getGoals, saveGoals } from '../utils/api';

const PRESETS = [
  { label: 'Light',       sessions: 8,  minutes: 480,  calories: 6000,  weekly: 2, desc: '2x/week · 30 min avg' },
  { label: 'Moderate',    sessions: 16, minutes: 960,  calories: 12000, weekly: 4, desc: '4x/week · 45 min avg' },
  { label: 'Active',      sessions: 20, minutes: 1200, calories: 15000, weekly: 5, desc: '5x/week · 60 min avg' },
  { label: 'Athlete',     sessions: 26, minutes: 2000, calories: 22000, weekly: 6, desc: '6x/week · 75 min avg' },
];

export default function Goals() {
  const [form, setForm] = useState({
    monthlySessions: 20,
    monthlyMinutes:  1200,
    monthlyCalories: 15000,
    weeklySessions:  4,
    customNote:      '',
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    getGoals()
      .then(data => setForm({
        monthlySessions: data.goals.monthlySessions,
        monthlyMinutes:  data.goals.monthlyMinutes,
        monthlyCalories: data.goals.monthlyCalories,
        weeklySessions:  data.goals.weeklySessions,
        customNote:      data.goals.customNote || '',
      }))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: val }));
    setSaved(false);
    setError('');
  };

  const applyPreset = (preset) => {
    setForm(f => ({
      ...f,
      monthlySessions: preset.sessions,
      monthlyMinutes:  preset.minutes,
      monthlyCalories: preset.calories,
      weeklySessions:  preset.weekly,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (form.monthlySessions < 1 || form.monthlyMinutes < 10 || form.monthlyCalories < 100 || form.weeklySessions < 1) {
      setError('All values must be greater than 0.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveGoals(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your goals...</div>
    </div>
  );

  return (
    <div className="page">
      <div className="hero-banner" style={{ height: 130 }}>
        <img className="hero-img"
          src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80"
          alt="Goals" onError={e => { e.target.style.display = 'none'; }} />
        <div className="hero-overlay">
          <div className="hero-label">Personalise</div>
          <div className="hero-title" style={{ fontSize: 30 }}>YOUR GOALS</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Left — Presets */}
        <div className="card">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            Quick Presets
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
            Pick a starting point and customise below.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRESETS.map(p => {
              const active =
                form.monthlySessions === p.sessions &&
                form.monthlyMinutes  === p.minutes  &&
                form.monthlyCalories === p.calories;
              return (
                <button key={p.label} onClick={() => applyPreset(p)} style={{
                  padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                  background: active ? 'rgba(198,241,53,0.1)' : 'var(--bg2)',
                  border: `1px solid ${active ? 'rgba(198,241,53,0.35)' : 'var(--border)'}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  transition: 'all 0.18s', fontFamily: 'var(--font-body)',
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: active ? 'var(--lime)' : 'var(--text)', marginBottom: 3 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.desc}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.sessions} sessions</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(p.calories).toLocaleString()} kcal</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Custom inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              Monthly Targets
            </div>

            <GoalInput
              label="Workout Sessions"
              name="monthlySessions"
              value={form.monthlySessions}
              onChange={handleChange}
              min={1} max={200}
              unit="sessions/month"
              hint="How many workouts do you want to complete this month?"
            />
            <GoalInput
              label="Active Minutes"
              name="monthlyMinutes"
              value={form.monthlyMinutes}
              onChange={handleChange}
              min={10} max={50000}
              unit="min/month"
              hint={`~${Math.round(form.monthlyMinutes / (form.monthlySessions || 1))} min per session`}
            />
            <GoalInput
              label="Calories to Burn"
              name="monthlyCalories"
              value={form.monthlyCalories}
              onChange={handleChange}
              min={100} max={500000}
              unit="kcal/month"
              hint={`~${Math.round(form.monthlyCalories / (form.monthlySessions || 1))} kcal per session`}
            />
          </div>

          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
              Weekly Target
            </div>
            <GoalInput
              label="Workouts Per Week"
              name="weeklySessions"
              value={form.weeklySessions}
              onChange={handleChange}
              min={1} max={30}
              unit="sessions/week"
              hint="Used for your weekly dashboard view"
            />
          </div>

          <div className="card">
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
              Personal Note
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">What's your main motivation? (optional)</label>
              <input
                className="form-input"
                type="text"
                name="customNote"
                value={form.customNote}
                onChange={handleChange}
                placeholder="e.g. Prep for marathon, lose 5kg, feel stronger"
                maxLength={200}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, padding: '12px 16px', background: 'rgba(255,107,107,0.08)', borderRadius: 10, border: '1px solid rgba(255,107,107,0.2)' }}>
              ⚠️ {error}
            </div>
          )}

          {saved && (
            <div style={{ color: 'var(--lime)', fontSize: 13, padding: '12px 16px', background: 'rgba(198,241,53,0.08)', borderRadius: 10, border: '1px solid rgba(198,241,53,0.2)' }}>
              ✓ Goals saved! Dashboard and Progress will now reflect your targets.
            </div>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save My Goals'}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoalInput({ label, name, value, onChange, min, max, unit, hint }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--lime)' }}>
          {Number(value).toLocaleString()} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>{unit}</span>
        </span>
      </div>
      <input
        className="form-input"
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        style={{ marginBottom: hint ? 6 : 0 }}
      />
      {hint && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>↳ {hint}</div>}
    </div>
  );
}
