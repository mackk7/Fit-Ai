import React, { useState } from 'react';
import { generateWorkoutPlan } from '../utils/api';

export default function WorkoutPlan() {
  const [form, setForm] = useState({ goal: '', level: '', days: '', equipment: '' });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.goal || !form.level || !form.days) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);
    setPlan('');
    try {
      const { plan: result } = await generateWorkoutPlan(form);
      setPlan(result);
    } catch (err) {
      setError(err.message || 'Failed to generate plan. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="hero-banner" style={{ height: 140 }}>
        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80"
          alt="Plan"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="hero-overlay">
          <div className="hero-label">AI Generated</div>
          <div className="hero-title" style={{ fontSize: 30 }}>CUSTOM WORKOUT PLAN</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: plan ? '380px 1fr' : '480px', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: 1, marginBottom: 22, textTransform: 'uppercase' }}>
            Configure Your Plan
          </h3>

          <div className="form-group">
            <label className="form-label">Fitness Goal *</label>
            <select className="form-select" name="goal" value={form.goal} onChange={handleChange}>
              <option value="">Select a goal</option>
              <option value="build muscle and increase strength">Build Muscle & Strength</option>
              <option value="lose body fat and improve conditioning">Fat Loss & Conditioning</option>
              <option value="improve cardiovascular endurance">Improve Cardio Endurance</option>
              <option value="increase athletic performance">Athletic Performance</option>
              <option value="maintain fitness and general wellness">General Wellness</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Fitness Level *</label>
            <select className="form-select" name="level" value={form.level} onChange={handleChange}>
              <option value="">Select level</option>
              <option value="beginner (less than 6 months experience)">Beginner (&lt;6 months)</option>
              <option value="intermediate (6 months to 2 years experience)">Intermediate (6mo–2yr)</option>
              <option value="advanced (over 2 years consistent training)">Advanced (2yr+)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Days Per Week *</label>
            <select className="form-select" name="days" value={form.days} onChange={handleChange}>
              <option value="">Select days</option>
              {[3,4,5,6].map(d => <option key={d} value={d}>{d} days/week</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Available Equipment</label>
            <select className="form-select" name="equipment" value={form.equipment} onChange={handleChange}>
              <option value="">Select equipment</option>
              <option value="full gym with barbells, dumbbells, cables, and machines">Full Gym</option>
              <option value="dumbbells and a pull-up bar at home">Home (Dumbbells + Pull-up bar)</option>
              <option value="bodyweight only, no equipment">Bodyweight Only</option>
              <option value="resistance bands and dumbbells">Resistance Bands + Dumbbells</option>
            </select>
          </div>

          {error && (
            <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>
          )}

          <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating your plan...' : '✨ Generate AI Workout Plan'}
          </button>
        </div>

        {plan && (
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: 1, marginBottom: 18, textTransform: 'uppercase', color: 'var(--lime)' }}>
              Your Custom Plan
            </h3>
            <div className="plan-result">{plan}</div>
            <button
              className="btn-ghost"
              style={{ marginTop: 16 }}
              onClick={() => { setPlan(''); setForm({ goal: '', level: '', days: '', equipment: '' }); }}
            >
              Generate New Plan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
