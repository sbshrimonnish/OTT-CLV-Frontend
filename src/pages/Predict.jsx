import { useState } from 'react';
import { PageHead, Card, Button, Icon, Field, FormInput, FormSelect } from '../components/UIComponents';
import { predictCLV } from '../services/api';

function FormSection({ number, title, subtitle, children }) {
  return (
    <Card className="form-section">
      <div className="form-section-head">
        <span>{number}</span>
        <div><h3>{title}</h3><p>{subtitle}</p></div>
      </div>
      <div className="form-grid">{children}</div>
    </Card>
  );
}

const DEFAULT_FORM = {
  ageGroup: '25-34',
  location: 'Urban',
  platform: 'Netflix',
  plan: 'Standard',
  fee: '499',
  billingCycle: 'Monthly',
  movies: '15',
  watch: '30.0',
  login: '20',
  lastActive: '2',
  renewals: '2',
  upgrades: '0',
  downgrades: '0',
  paymentFailures: '0',
  discount: '0',
  supportTickets: '0',
  churn: '0',
  lifetimeMonths: '12',
};

export default function Predict() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await predictCLV(form);
      setResult(data);
    } catch (err) {
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('Backend not connected - please verify FastAPI server is running on http://localhost:8000');
      } else {
        setError(err.message || 'Prediction failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setForm(DEFAULT_FORM); setResult(null); setError(null); };

  return (
    <>
      <PageHead
        title="Single-customer CLV prediction"
        subtitle="Real ML inference via Random Forest pipeline - results powered by FastAPI backend."
        action={<span className="status green"><Icon name="spark" size={14} /> Live ML Backend</span>}
      />

      <div className="prediction-layout">
        <form onSubmit={submit} className="form-stack">
          <FormSection number="01" title="Customer information" subtitle="Subscription and demographic details">
            <Field label="Age Group">
              <FormSelect value={form.ageGroup} onChange={e => update('ageGroup', e.target.value)}>
                <option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55+</option>
              </FormSelect>
            </Field>
            <Field label="Location">
              <FormSelect value={form.location} onChange={e => update('location', e.target.value)}>
                <option>Urban</option><option>Suburban</option><option>Rural</option>
              </FormSelect>
            </Field>
            <Field label="Platform">
              <FormSelect value={form.platform} onChange={e => update('platform', e.target.value)}>
                <option>Netflix</option>
                <option>Amazon Prime Video</option>
                <option>JioHotstar</option>
              </FormSelect>
            </Field>
            <Field label="Plan">
              <FormSelect value={form.plan} onChange={e => update('plan', e.target.value)}>
                <option>Basic</option><option>Standard</option><option>Premium</option>
              </FormSelect>
            </Field>
            <Field label="Monthly Fee (INR)">
              <FormInput min="0" step="1" required type="number" value={form.fee} onChange={e => update('fee', e.target.value)} />
            </Field>
            <Field label="Billing Cycle">
              <FormSelect value={form.billingCycle} onChange={e => update('billingCycle', e.target.value)}>
                <option>Monthly</option><option>Annual</option>
              </FormSelect>
            </Field>
          </FormSection>

          <FormSection number="02" title="Engagement" subtitle="Recent content and product activity">
            <Field label="Movies Watched">
              <FormInput min="0" required type="number" value={form.movies} onChange={e => update('movies', e.target.value)} />
            </Field>
            <Field label="Watch Hours">
              <FormInput min="0" step="0.1" required type="number" value={form.watch} onChange={e => update('watch', e.target.value)} />
            </Field>
            <Field label="Login Days" hint="0-31">
              <FormInput min="0" max="31" required type="number" value={form.login} onChange={e => update('login', e.target.value)} />
            </Field>
          </FormSection>

          <FormSection number="03" title="Behavior and payment" subtitle="Renewal, account, and payment signals">
            <Field label="Last Active Days"><FormInput min="0" required type="number" value={form.lastActive} onChange={e => update('lastActive', e.target.value)} /></Field>
            <Field label="Renewals"><FormInput min="0" required type="number" value={form.renewals} onChange={e => update('renewals', e.target.value)} /></Field>
            <Field label="Upgrades"><FormInput min="0" required type="number" value={form.upgrades} onChange={e => update('upgrades', e.target.value)} /></Field>
            <Field label="Downgrades"><FormInput min="0" required type="number" value={form.downgrades} onChange={e => update('downgrades', e.target.value)} /></Field>
            <Field label="Payment Failures"><FormInput min="0" required type="number" value={form.paymentFailures} onChange={e => update('paymentFailures', e.target.value)} /></Field>
            <Field label="Discount (%)"><FormInput min="0" max="100" required type="number" value={form.discount} onChange={e => update('discount', e.target.value)} /></Field>
            <Field label="Support Tickets"><FormInput min="0" required type="number" value={form.supportTickets} onChange={e => update('supportTickets', e.target.value)} /></Field>
          </FormSection>

          <FormSection number="04" title="Account status" subtitle="Churn flag and tenure - required by model">
            <Field label="Churn State (Required)">
              <FormSelect value={form.churn} onChange={e => update('churn', e.target.value)}>
                <option value="0">0 - Active Customer</option>
                <option value="1">1 - Churned Customer</option>
              </FormSelect>
            </Field>
            <Field label="Lifetime Months (Required)" hint="Total tenure in months (>= 0)">
              <FormInput min="0" step="0.5" required type="number" value={form.lifetimeMonths} onChange={e => update('lifetimeMonths', e.target.value)} />
            </Field>
          </FormSection>

          <Card className="form-actions">
            <div>
              <strong>Ready to predict real CLV?</strong>
              <p>Results are generated directly by the Random Forest model via FastAPI backend.</p>
            </div>
            <div>
              <Button variant="ghost" onClick={reset}>Reset</Button>
              <Button type="submit" disabled={loading} icon="spark">
                {loading ? 'Predicting...' : 'Predict CLV'}
              </Button>
            </div>
          </Card>
        </form>

        <aside className="result-column">
          {error && (
            <Card className="result-card" style={{ borderColor: 'var(--error, #ef4444)' }}>
              <div style={{ color: 'var(--error, #ef4444)', fontWeight: 600, marginBottom: 8 }}>Prediction Error</div>
              <p style={{ fontSize: '0.875rem' }}>{error}</p>
              <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: 8 }}>
                Ensure backend server is active: <code>python -m uvicorn app.main:app --port 8000</code>
              </p>
            </Card>
          )}

          {result && !error ? (
            <Card className="result-card">
              <div className="success-mark"><Icon name="check" /></div>
              <span className="eyebrow">REAL FASTAPI ML PREDICTION</span>
              <h3>Predicted Lifetime Value</h3>
              <div className="result-value">
                &#8377;{result.predictedCLV?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="result-details">
                {result.predicted6mCLV != null && (
                  <div><span>6-Month CLV Forecast</span><b>&#8377;{result.predicted6mCLV?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
                )}
                {result.predicted12mCLV != null && (
                  <div><span>12-Month CLV Forecast</span><b>&#8377;{result.predicted12mCLV?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b></div>
                )}
                <div><span>Platform</span><b>{form.platform}</b></div>
                <div><span>Plan</span><b>{form.plan}</b></div>
                <div><span>Customer ID</span><b>{result.customerId}</b></div>
                <div><span>Model</span><b>{result.modelVersion}</b></div>
                <div><span>Currency</span><b>INR (&#8377;)</b></div>
              </div>
              <div className="notice">
                <Icon name="info" size={16} />
                <p>Prediction served by real saved Random Forest joblib pipeline. Saved to database.</p>
              </div>
              <Button variant="secondary" onClick={reset}>Edit inputs</Button>
            </Card>
          ) : !error ? (
            <Card className="empty-result">
              <div className="empty-icon"><Icon name="spark" size={24} /></div>
              <h3>Your prediction will appear here</h3>
              <p>Complete all 18 model inputs and click <strong>Predict CLV</strong> to run real ML inference.</p>
              <div className="mini-flow">
                <span>Input</span><Icon name="arrow" /><span>Validate</span><Icon name="arrow" /><span>Predict</span>
              </div>
              <div className="notice" style={{ marginTop: 16 }}>
                <Icon name="database" size={16} />
                <p>Each prediction is automatically saved to the SQLite database and appears in Prediction History.</p>
              </div>
            </Card>
          ) : null}
        </aside>
      </div>
    </>
  );
}
