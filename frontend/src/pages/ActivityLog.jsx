import React, { useState, useEffect } from 'react';
import { getLogs, createLog, updateLog, deleteLog } from '../utils/api';

const WORKOUT_PRESETS = {
  'Upper Body Blast':      { type: 'strength', calPerMin: 8.5 },
  'Push Day — Chest':      { type: 'strength', calPerMin: 8.2 },
  'Pull Day — Back':       { type: 'strength', calPerMin: 8.0 },
  'Leg Day':               { type: 'strength', calPerMin: 9.5 },
  'Core Circuit':          { type: 'strength', calPerMin: 7.5 },
  'Full Body Strength':    { type: 'strength', calPerMin: 8.8 },
  '5K Run':                { type: 'cardio',   calPerMin: 10.5 },
  'Zone 2 Run':            { type: 'cardio',   calPerMin: 9.0 },
  'Cycling':               { type: 'cardio',   calPerMin: 9.5 },
  'Swimming':              { type: 'cardio',   calPerMin: 10.0 },
  'Jump Rope':             { type: 'cardio',   calPerMin: 12.0 },
  'Full Body HIIT':        { type: 'hiit',     calPerMin: 13.0 },
  'Tabata':                { type: 'hiit',     calPerMin: 14.0 },
  'Kettlebell AMRAP':      { type: 'hiit',     calPerMin: 12.5 },
  'Morning Yoga':          { type: 'yoga',     calPerMin: 3.5 },
  'Flexibility / Stretch': { type: 'yoga',     calPerMin: 3.0 },
  'Custom':                { type: 'strength', calPerMin: 8.0 },
};

const TYPE_COLORS = {
  strength: { cls: 'tag-strength', label: 'Strength' },
  cardio:   { cls: 'tag-cardio',   label: 'Cardio'   },
  hiit:     { cls: 'tag-hiit',     label: 'HIIT'     },
  yoga:     { cls: 'tag-yoga',     label: 'Yoga'     },
  custom:   { cls: 'tag-strength', label: 'Custom'   },
};

const EMPTY_FORM = {
  date: new Date().toISOString().split('T')[0],
  name: '', customName: '', minutes: '', sets: '', notes: '',
};

export default function ActivityLog() {
  const [log, setLog]           = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [editId, setEditId]     = useState(null);
  const [filterType, setFilter] = useState('All');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  // Load logs from database on mount
  useEffect(() => {
    getLogs()
      .then(data => setLog(data.logs || []))
      .catch(err => setError(err.message))
      .finally(() => setPageLoading(false));
  }, []);

  const totalCalories = log.reduce((s, e) => s + e.calories, 0);
  const totalMinutes  = log.reduce((s, e) => s + e.minutes, 0);
  const totalSessions = log.length;
  const avgCal        = totalSessions ? Math.round(totalCalories / totalSessions) : 0;

  const calcCalories = (name, minutes) => {
    const preset = WORKOUT_PRESETS[name] || WORKOUT_PRESETS['Custom'];
    return Math.round(preset.calPerMin * Number(minutes));
  };
  const getType = (name) => (WORKOUT_PRESETS[name] || WORKOUT_PRESETS['Custom']).type;

  const handleChange = (e) => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(''); };

  const handleSubmit = async () => {
    const workoutName = form.name === 'Custom' ? form.customName.trim() : form.name;
    if (!workoutName || !form.date || !form.minutes) { setError('Please fill in date, workout, and duration.'); return; }
    if (Number(form.minutes) < 1 || Number(form.minutes) > 600) { setError('Duration must be 1–600 minutes.'); return; }

    setSaving(true);
    setError('');
    const type     = getType(form.name);
    const calories = calcCalories(form.name, form.minutes);
    const payload  = { name: workoutName, type, date: form.date, minutes: Number(form.minutes), calories, sets: Number(form.sets) || 0, notes: form.notes.trim() };

    try {
      if (editId) {
        const data = await updateLog(editId, payload);
        setLog(l => l.map(e => e._id === editId ? data.log : e));
        setEditId(null);
      } else {
        const data = await createLog(payload);
        setLog(l => [data.log, ...l].sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setForm({
      date:       entry.date?.split('T')[0] || new Date().toISOString().split('T')[0],
      name:       WORKOUT_PRESETS[entry.name] ? entry.name : 'Custom',
      customName: WORKOUT_PRESETS[entry.name] ? '' : entry.name,
      minutes:    String(entry.minutes),
      sets:       String(entry.sets || ''),
      notes:      entry.notes || '',
    });
    setEditId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteLog(id);
      setLog(l => l.filter(e => e._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => { setShowForm(false); setForm(EMPTY_FORM); setEditId(null); setError(''); };

  const filtered = filterType === 'All' ? log : log.filter(e => e.type === filterType.toLowerCase());
  const previewCal = form.name && form.minutes ? calcCalories(form.name, form.minutes) : null;

  const fmtDate = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const yest  = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const d = dateStr?.split('T')[0];
    if (d === today) return 'Today';
    if (d === yest)  return 'Yesterday';
    return new Date((d || dateStr) + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (pageLoading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: 'var(--muted)', fontSize: 14 }}>Loading your workouts...</div>
    </div>
  );

  return (
    <div className="page">
      <div className="hero-banner" style={{ height: 130 }}>
        <img className="hero-img" src="https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=1200&q=80" alt="Activity" onError={e => { e.target.style.display = 'none'; }} />
        <div className="hero-overlay">
          <div className="hero-label">Your Journey</div>
          <div className="hero-title" style={{ fontSize: 30 }}>ACTIVITY LOG</div>
        </div>
      </div>

      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card highlight">
          <div className="stat-label">Total Sessions</div>
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-unit">logged workouts</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Time</div>
          <div className="stat-value">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</div>
          <div className="stat-unit">active time</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Calories Burned</div>
          <div className="stat-value">{totalCalories.toLocaleString()}</div>
          <div className="stat-unit">total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Per Session</div>
          <div className="stat-value">{avgCal}</div>
          <div className="stat-unit">calories</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['All','Strength','Cardio','HIIT','Yoga'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 18px', borderRadius: '999px',
              border: `1px solid ${filterType===f?'rgba(198,241,53,0.4)':'var(--border)'}`,
              background: filterType===f?'rgba(198,241,53,0.1)':'transparent',
              color: filterType===f?'var(--lime)':'var(--muted)',
              fontSize: 13, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all .18s',
            }}>{f}</button>
          ))}
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(EMPTY_FORM); }} style={{
          padding: '10px 22px', background: 'var(--lime)', color: '#0a0a0a',
          borderRadius: 10, fontWeight: 600, fontSize: 14, fontFamily: 'var(--font-body)', border: 'none', cursor: 'pointer',
        }}>+ Log Workout</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(198,241,53,0.25)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 20, textTransform: 'uppercase' }}>
            {editId ? 'Edit Entry' : 'Log New Workout'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Workout *</label>
              <select className="form-select" name="name" value={form.name} onChange={handleChange}>
                <option value="">Select workout</option>
                {Object.keys(WORKOUT_PRESETS).map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            {form.name === 'Custom' && (
              <div className="form-group">
                <label className="form-label">Custom Name *</label>
                <input className="form-input" type="text" name="customName" placeholder="e.g. Beach Volleyball" value={form.customName} onChange={handleChange} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Duration (min) *</label>
              <input className="form-input" type="number" name="minutes" placeholder="45" min="1" max="600" value={form.minutes} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Sets Completed</label>
              <input className="form-input" type="number" name="sets" placeholder="0" min="0" value={form.sets} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Notes (optional)</label>
              <input className="form-input" type="text" name="notes" placeholder="How did it feel? Any PRs?" value={form.notes} onChange={handleChange} />
            </div>
          </div>
          {previewCal && (
            <div style={{ margin: '14px 0', padding: '12px 16px', background: 'rgba(198,241,53,0.07)', border: '1px solid rgba(198,241,53,0.2)', borderRadius: 10, fontSize: 14, color: 'var(--lime)' }}>
              🔥 Estimated calories burned: <strong>{previewCal} kcal</strong>
              <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 12 }}>(based on {form.minutes} min of {form.name})</span>
            </div>
          )}
          {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 14 }}>⚠️ {error}</div>}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={saving}>
              {saving ? 'Saving...' : (editId ? 'Save Changes' : '+ Add to Log')}
            </button>
            <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, marginBottom: 8 }}>No workouts logged yet</div>
          <div style={{ fontSize: 13 }}>Click "Log Workout" to add your first session</div>
        </div>
      ) : (
        <div className="log-list">
          {filtered.map(entry => {
            const tag = TYPE_COLORS[entry.type] || TYPE_COLORS.custom;
            return (
              <div className="log-item" key={entry._id}>
                <div style={{ flex: 1 }}>
                  <div className="log-date">{fmtDate(entry.date)}</div>
                  <div className="log-name">{entry.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                    <span className={`workout-tag ${tag.cls}`}>{tag.label}</span>
                    {entry.notes && <span style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>"{entry.notes}"</span>}
                  </div>
                </div>
                <div className="log-stats" style={{ marginRight: 20 }}>
                  <div><div className="log-stat-val">{entry.minutes}</div><div className="log-stat-label">min</div></div>
                  <div><div className="log-stat-val">{entry.calories}</div><div className="log-stat-label">cal</div></div>
                  {entry.sets > 0 && <div><div className="log-stat-val">{entry.sets}</div><div className="log-stat-label">sets</div></div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => handleEdit(entry)} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(entry._id)} style={{ padding: '6px 14px', background: 'transparent', border: 'none', borderRadius: 8, color: '#ff6b6b', fontSize: 12, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
