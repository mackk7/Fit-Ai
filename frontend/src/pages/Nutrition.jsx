import React, { useState } from 'react';
import { calculateNutrition } from '../utils/api';

export default function Nutrition() {
  const [form, setForm] = useState({ weight: '', height: '', age: '', gender: '', activityLevel: '', goal: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCalculate = async () => {
    const { weight, height, age, gender, activityLevel, goal } = form;
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    setResult('');
    try {
      const { nutrition } = await calculateNutrition(form);
      setResult(nutrition);
    } catch (err) {
      setError(err.message || 'Failed to calculate. Make sure your backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="hero-banner" style={{ height: 140 }}>
        <img
          className="hero-img"
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80"
          alt="Nutrition"
          onError={e => { e.target.style.display = 'none'; }}
        />
        <div className="hero-overlay">
          <div className="hero-label">AI Calculated</div>
          <div className="hero-title" style={{ fontSize: 30 }}>NUTRITION PLANNER</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '380px 1fr' : '480px', gap: 24, alignItems: 'start' }}>
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: 1, marginBottom: 22, textTransform: 'uppercase' }}>
            Your Metrics
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Weight (kg) *</label>
              <input className="form-input" type="number" name="weight" placeholder="75" value={form.weight} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm) *</label>
              <input className="form-input" type="number" name="height" placeholder="175" value={form.height} onChange={handleChange} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Age *</label>
              <input className="form-input" type="number" name="age" placeholder="25" value={form.age} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-select" name="gender" value={form.gender} onChange={handleChange}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Activity Level *</label>
            <select className="form-select" name="activityLevel" value={form.activityLevel} onChange={handleChange}>
              <option value="">Select activity level</option>
              <option value="sedentary (desk job, little exercise)">Sedentary (desk job)</option>
              <option value="lightly active (1-3 workouts/week)">Lightly Active (1–3x/week)</option>
              <option value="moderately active (3-5 workouts/week)">Moderately Active (3–5x/week)</option>
              <option value="very active (6-7 intense workouts/week)">Very Active (6–7x/week)</option>
              <option value="extremely active (athlete or physical job)">Athlete / Physical Job</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Primary Goal *</label>
            <select className="form-select" name="goal" value={form.goal} onChange={handleChange}>
              <option value="">Select goal</option>
              <option value="lose body fat (caloric deficit)">Lose Body Fat</option>
              <option value="build muscle (lean bulk)">Build Muscle (Lean Bulk)</option>
              <option value="maintain current weight and body composition">Maintain Weight</option>
              <option value="aggressive bulk to maximize muscle gain">Aggressive Bulk</option>
            </select>
          </div>

          {error && <div style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}

          <button className="btn-primary" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : '🥗 Calculate My Macros'}
          </button>
        </div>

        {result && (
          <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: 1, marginBottom: 18, textTransform: 'uppercase', color: 'var(--lime)' }}>
              Your Nutrition Plan
            </h3>
            <div className="plan-result">{result}</div>
            <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => { setResult(''); }}>
              Recalculate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
