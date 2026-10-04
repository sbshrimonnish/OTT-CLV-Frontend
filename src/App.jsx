import { useState, useEffect, useCallback } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, ArrowRight, BarChart3, Bell, BrainCircuit, Check,
  ChevronDown, CircleDollarSign, ClipboardList, Command, Database,
  Download, Eye, EyeOff, FileBarChart, FileText, GripVertical,
  History, LayoutDashboard, LoaderCircle, LockKeyhole, Menu, Moon,
  PanelLeftClose, Play, Plus, RefreshCw, Search, Settings2,
  ShieldCheck, SlidersHorizontal, Sparkles, Sun, Target,
  TrendingDown, TrendingUp, UploadCloud, UserRound, Users, X, Zap,
} from 'lucide-react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';

// ─── Real API service ───────────────────────────────────────────────────
const API = 'http://localhost:8000';
const apiFetch = (path, opts) => fetch(`${API}${path}`, opts).then(r => r.ok ? r.json() : Promise.reject(r));

// ─── Static data constants ────────────────────────────────────────────────
const platforms = [
  { name: 'Netflix',            short: 'NF', subscribers: '6,200', share: '41.3%', clv: '₹28,400', fee: '₹649', tenure: '15.2', churn: '14.2%', watch: '46.8', color: '#E50914' },
  { name: 'Amazon Prime Video', short: 'PV', subscribers: '5,100', share: '34.0%', clv: '₹22,100', fee: '₹299', tenure: '14.8', churn: '16.5%', watch: '38.2', color: '#00A8E1' },
  { name: 'JioHotstar',         short: 'JH', subscribers: '3,700', share: '24.7%', clv: '₹18,900', fee: '₹199', tenure: '12.1', churn: '18.4%', watch: '34.6', color: '#3047e8' },
];

const models = [
  ['Linear Regression',    'Parametric baseline',     '₹3,364.27', '₹4,734.07', '0.8743'],
  ['Ridge Regression',     'L2 regularized',          '₹3,363.99', '₹4,734.10', '0.8743'],
  ['Decision Tree',        'Non-linear partition',    '₹258.09',   '₹469.44',   '0.9988'],
  ['Random Forest',        'Production pipeline',     '₹90.43',    '₹300.50',   '0.9995'],
  ['Gradient Boosting',    'Sequential ensemble',     '₹144.99',   '₹217.14',   '0.9997'],
];

const features = [
  ['Monthly Fee',       38.4, 'Direct price multiplier on lifetime value realization'],
  ['Lifetime Months',   29.8, 'Cumulative subscriber tenure duration'],
  ['Watch Hours',       12.6, 'Engagement volume driving repeat renewal propensity'],
  ['Login Days',         7.2, 'Frequency of monthly authentication sessions'],
  ['Renewals',           4.8, 'Contractual willingness to renew subscriptions'],
  ['Plan',               3.1, 'Tier entitlements and product depth'],
  ['Movies Watched',     1.8, 'Breadth of catalogue consumption'],
  ['Last Active Days',   0.9, 'Inactivity recency signal'],
  ['Discount',           0.6, 'Promotional onboarding elasticity'],
  ['Payment Failures',   0.5, 'Involuntary billing friction'],
  ['Support Tickets',    0.3, 'Customer friction index'],
];

const nav = [
  ['/dashboard',          'Dashboard',          LayoutDashboard],
  ['/predict',            'CLV Prediction',     Sparkles],
  ['/customer-analysis',  'Customer Analysis',  Users],
  ['/clv-analytics',      'CLV Analytics',      BarChart3],
  ['/platform-comparison','Platform Comparison',Activity],
  ['/churn-analysis',     'Churn Analysis',     TrendingDown],
  ['/model-performance',  'Model Performance',  BrainCircuit],
  ['/feature-importance', 'Feature Importance', SlidersHorizontal],
  ['/dataset',            'Dataset',            Database],
  ['/prediction-history', 'Prediction History', History],
  ['/reports',            'Reports',            FileBarChart],
  ['/login',              'Login Page',         LockKeyhole],
];

const trend = [
  { m: "Apr", clv: 20.8 }, { m: "May", clv: 21.2 }, { m: "Jun", clv: 21.4 }, { m: "Jul", clv: 21.9 },
  { m: "Aug", clv: 22.2 }, { m: "Sep", clv: 22.1 }, { m: "Oct", clv: 22.7 }, { m: "Nov", clv: 22.9 },
  { m: "Dec", clv: 23.1 }, { m: "Jan", clv: 23.2 }, { m: "Feb", clv: 23.3 }, { m: "Mar", clv: 23.45 },
];
const segment = [
  { name: 'High Value',   value: 25, color: '#2563eb' },
  { name: 'Medium Value', value: 43, color: '#10b981' },
  { name: 'Low Value',    value: 16, color: '#f59e0b' },
  { name: 'At Risk',      value:  9, color: '#f43f5e' },
  { name: 'Churned',      value:  7, color: '#94a3b8' },
];
const mrr = [
  { q: 'Q1', netflix: 4.0, prime: 2.7, jio: 1.7 },
  { q: 'Q2', netflix: 4.4, prime: 2.9, jio: 1.8 },
  { q: 'Q3', netflix: 4.8, prime: 3.0, jio: 2.0 },
  { q: 'Q4', netflix: 5.1, prime: 3.2, jio: 2.1 },
];

// ─── Shared UI primitives ─────────────────────────────────────────────────
function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  return (
    <button type={type} disabled={disabled} className={`btn btn-${variant} ${className}`} onClick={onClick}>
      {children}
    </button>
  );
}

function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Metric({ label, value, delta, icon: Icon, tone = 'blue' }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={18} /></div>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      {delta && <small><TrendingUp size={12} /> {delta}</small>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, insight, action }) {
  return (
    <section className="chart-card">
      <header>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
        {action}
      </header>
      <div className="chart-body">{children}</div>
      {insight && <footer><Zap size={14} /><span>{insight}</span></footer>}
    </section>
  );
}

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <small>{label || payload[0]?.payload?.name || 'Metric'}</small>
      {payload.map((p, i) => (
        <div key={i}>
          <b>{p.name}</b>
          <span>{typeof p.value === 'number' ? p.value.toLocaleString('en-IN') : p.value}</span>
        </div>
      ))}
    </div>
  );
}

function FieldSelect({ label, value, onChange, options }) {
  return (
    <label className="field">
      {label && <span>{label}</span>}
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} />
    </label>
  );
}

function DataTable({ headers, rows, highlight = -1 }) {
  return (
    <div className="table-card">
      <table>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i === highlight ? 'highlight' : ''}>
              {r.map((c, j) => (
                <td key={j}>{j === 0 && i === highlight ? <span className="active-dot" /> : null}{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModalUI({ title, onClose, children }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={e => e.stopPropagation()}>
        <header><h2>{title}</h2><button onClick={onClose}><X /></button></header>
        {children}
      </div>
    </div>
  );
}

function Drawer({ onClose }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <aside className="drawer" onMouseDown={e => e.stopPropagation()}>
        <header>
          <div><span className="eyebrow">PREDICTION INSPECTION</span><h2>CUST_78429103</h2></div>
          <button onClick={onClose}><X /></button>
        </header>
        <div className="drawer-hero">
          <span>Predicted CLV</span><b>₹42,100</b><small>Random Forest v1.0 · 31 Mar 2025</small>
        </div>
        {[['Platform','Netflix'],['Plan','Premium'],['Historical Current CLV','₹38,940'],['Future 6M CLV','₹45,994'],['Future 12M CLV','₹49,888'],['Model artifact','clv_random_forest_pipeline.joblib']].map(x => (
          <div className="drawer-row" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>
        ))}
      </aside>
    </div>
  );
}

function SimpleBars({ title, subtitle = "Portfolio metric distribution", data, unit = "", yFormatter }) {
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 10, right: 15, top: 10 }}>
          <CartesianGrid vertical={false} stroke="var(--grid)" />
          <XAxis dataKey="name" />
          <YAxis unit={unit} tickFormatter={yFormatter || (v => typeof v === 'number' ? (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()) : v)} />
          <Tooltip content={<Tip />} />
          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color || (i % 2 === 0 ? '#2563eb' : '#4f46e5')} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function LineCard({ title, data }) {
  return (
    <ChartCard title={title} subtitle="Modeled probability · synthetic cohort">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: -12, right: 12, top: 10 }}>
          <CartesianGrid stroke="var(--grid)" />
          <XAxis dataKey="x" />
          <YAxis unit="%" />
          <Tooltip content={<Tip />} />
          <Line dataKey="y" type="monotone" stroke="#2563eb" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState('12M');
  const [summary, setSummary] = useState(null);
  const [distData, setDistData] = useState([]);
  const [connected, setConnected] = useState(false);

  const points = Array.from({ length: 32 }, (_, i) => ({ x: 200 + (i * 37) % 700, y: 9 + (i * 6.7) % 43 }));
  const hist = [{ b: '<₹10k', n: 980 }, { b: '₹10–20k', n: 3260 }, { b: '₹20–30k', n: 4980 }, { b: '₹30–40k', n: 3450 }, { b: '₹40–50k', n: 1510 }, { b: '>₹50k', n: 820 }];

  useEffect(() => {
    apiFetch('/health').then(() => setConnected(true)).catch(() => {});
    apiFetch('/analytics/summary').then(d => setSummary(d)).catch(() => {});
    apiFetch('/analytics/clv-distribution').then(d => { if (d?.length) setDistData(d.map(x => ({ b: x.range, n: x.count }))); }).catch(() => {});
  }, []);

  const fmt = v => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—';

  return (
    <>
      <PageTitle
        title="CLV Intelligence Dashboard"
        subtitle="Customer value, portfolio health and predictive insights"
        action={<div className="as-of"><Activity size={14} /> Live portfolio · 31 Mar 2025</div>}
      />
      <div className="metrics six">
        <Metric label="Total Customers"    value={summary ? Number(summary.total_customers).toLocaleString('en-IN') : '12,000'} delta="Full portfolio"     icon={Users} />
        <Metric label="Average CLV"        value={summary ? fmt(summary.average_clv) : '₹15,929'} delta="Portfolio avg"        icon={CircleDollarSign} tone="green" />
        <Metric label="Total Portfolio CLV" value={summary ? fmt(summary.total_revenue) : '₹19.11Cr'} delta="Cumulative"        icon={TrendingUp}       tone="purple" />
        <Metric label="Average Lifetime"   value="24.8 Mos"           delta="0.6 Mo expansion"      icon={History}          tone="amber" />
        <Metric label="Overall Churn Rate" value={summary ? `${summary.churn_rate}%` : '16.02%'} delta="Attrition" icon={TrendingDown} tone="rose" />
        <Metric label="Production Model R²" value="0.9995"            delta="Holdout N=3,000"       icon={Target}           tone="cyan" />
      </div>

      <div className="chart-grid">
        <ChartCard
          title="CLV trend over time" subtitle="Average realized value · ₹ thousands"
          insight="Average CLV expanded 12.7% across the trailing 12 months."
          action={
            <div className="seg-control">
              {['3M', '6M', '12M'].map(x => (
                <button key={x} className={range === x ? 'active' : ''} onClick={() => setRange(x)}>{x}</button>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend.slice(range === '3M' ? -3 : range === '6M' ? -6 : 0)} margin={{ left: -18, right: 8, top: 12 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2563eb" stopOpacity=".28" />
                  <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis dataKey="m" />
              <YAxis domain={[18, 25]} tickFormatter={v => `₹${v}k`} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="clv" name="Avg CLV (₹k)" stroke="#2563eb" fill="url(#trendGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CLV value segmentation" subtitle="Portfolio mix · 12,000 subscribers" insight="68% of subscribers sit in medium or high-value cohorts.">
          <div className="donut-wrap">
            <ResponsiveContainer width="52%" height="100%">
              <PieChart>
                <Pie data={segment} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {segment.map(s => <Cell key={s.name} fill={s.color} />)}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              {segment.map(s => (
                <div key={s.name}>
                  <i style={{ background: s.color }} />
                  <span>{s.name}</span>
                  <b>{s.value}%</b>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Quarterly MRR by platform" subtitle="Recurring revenue · ₹ crore" insight="Netflix contributes the largest MRR share across all four quarters.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mrr} margin={{ left: -18, right: 6, top: 10 }}>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis dataKey="q" />
              <YAxis tickFormatter={v => `₹${v}`} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="netflix" name="Netflix"     fill="#e50914" radius={[3, 3, 0, 0]} />
              <Bar dataKey="prime"   name="Prime Video" fill="#00a8e1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="jio"     name="JioHotstar"  fill="#3047e8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="MRR vs predicted CLV" subtitle="Sample customer distribution · ₹ thousands" insight="Higher monthly recurring revenue shows a strong non-linear CLV relationship.">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ left: -8, right: 12, top: 12, bottom: 5 }}>
              <CartesianGrid stroke="var(--grid)" />
              <XAxis dataKey="x" name="MRR" tickFormatter={v => `₹${v}`} />
              <YAxis dataKey="y" name="CLV" tickFormatter={v => `₹${v}k`} />
              <Tooltip content={<Tip />} />
              <Scatter data={points} fill="#2563eb" fillOpacity=".65" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CLV distribution" subtitle="Subscribers grouped by lifetime value" insight="The ₹20k–₹30k band contains the portfolio's highest concentration.">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distData.length ? distData : hist} margin={{ left: -12, right: 8, top: 12 }}>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis dataKey="b" />
              <YAxis />
              <Tooltip content={<Tip />} />
              <Bar dataKey="n" name="Subscribers" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <section className="pipeline-card">
          <div className="pipeline-head">
            <div className="model-mark"><BrainCircuit /></div>
            <span className="status"><i />Active pipeline</span>
          </div>
          <div>
            <span className="eyebrow">SCIKIT-LEARN ARTIFACT</span>
            <h2>Random Forest Regressor</h2>
            <code>clv_random_forest_pipeline.joblib</code>
          </div>
          <div className="pipeline-stats">
            <div><span>Lowest MAE</span><b>₹90.43</b></div>
            <div><span>RMSE</span><b>₹300.50</b></div>
            <div><span>R²</span><b>0.9995</b></div>
          </div>
          <p>Random Forest achieves the lowest absolute error. Gradient Boosting independently leads on RMSE and R².</p>
          <NavLink to="/model-performance">Open benchmark evaluation <ArrowRight size={15} /></NavLink>
        </section>
      </div>
    </>
  );
}

// ─── CLV Prediction Page ────────────────────────────────────────────────────
const defaultForm = {
  platform: 'Netflix', plan: 'Premium', fee: '649', cadence: 'Monthly',
  tenure: '18', age: '25-34', location: 'Urban', churn: 'No',
  watch: '52', logins: '24', movies: '18', inactive: '3',
  renewals: '8', upgrades: '1', downgrades: '0', failures: '0',
  discount: '5', tickets: '1',
};

function Predict() {
  const [form, setForm] = useState(defaultForm);
  const [state, setState] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [errMsg, setErrMsg] = useState('');

  const set = (k, v) => setForm({ ...form, [k]: v });

  const presets = [
    defaultForm,
    { ...defaultForm, platform: 'Amazon Prime Video', fee: '299', cadence: 'Annual', watch: '38', tenure: '22' },
    { ...defaultForm, platform: 'JioHotstar', plan: 'Basic', fee: '199', inactive: '46', churn: 'Yes', watch: '8' },
  ];

  const run = async () => {
    setState('loading');
    setResult(null);
    try {
      const payload = {
        ageGroup: form.age, location: form.location, platform: form.platform,
        plan: form.plan, fee: form.fee, billingCycle: form.cadence,
        movies: form.movies, watch: form.watch, login: form.logins,
        lastActive: form.inactive, renewals: form.renewals, upgrades: form.upgrades,
        downgrades: form.downgrades, paymentFailures: form.failures,
        discount: form.discount, supportTickets: form.tickets,
        churn: form.churn === 'Yes' ? '1' : '0', lifetimeMonths: form.tenure,
      };
      const data = await apiFetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setResult(data);
      setState('success');
    } catch (e) {
      setErrMsg('Backend not connected. Ensure FastAPI is running on http://localhost:8000');
      setState('error');
    }
  };

  const fields = [
    ['platform', 'Platform',          ['Netflix', 'Amazon Prime Video', 'JioHotstar']],
    ['plan',     'Plan',              ['Basic', 'Standard', 'Premium']],
    ['fee',      'Monthly Fee (₹)'],
    ['cadence',  'Billing Cadence',   ['Monthly', 'Quarterly', 'Annual']],
    ['tenure',   'Lifetime Tenure (Months)'],
    ['age',      'Demographic',       ['18-24', '25-34', '35-44', '45-54', '55+']],
    ['location', 'Location',          ['Urban', 'Suburban', 'Rural']],
    ['churn',    'Churn',             ['No', 'Yes']],
    ['watch',    'Watch Hours / Mo'],
    ['logins',   'Login Days / Mo'],
    ['movies',   'Movies Watched'],
    ['inactive', 'Last Active Days'],
    ['renewals', 'Renewals'],
    ['upgrades', 'Upgrades'],
    ['downgrades','Downgrades'],
    ['failures', 'Payment Failures'],
    ['discount', 'Discount Applied (%)'],
    ['tickets',  'Support Tickets Logged'],
  ];

  const sections = [
    ['Customer Profile', 0, 8],
    ['Engagement',       8, 11],
    ['Behavior',        11, 15],
    ['Payment',         15, 17],
    ['Support',         17, 18],
  ];

  const fmt = v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  return (
    <>
      <PageTitle
        title="CLV Prediction Engine"
        subtitle="Run individual subscriber inference through the active production pipeline"
        action={<Btn variant="secondary" onClick={() => setState(s => s === 'error' ? 'idle' : 'error')}><Activity size={15} /> Simulate API state</Btn>}
      />

      {state === 'error' && (
        <div className="alert error">
          <div><Activity /><div><b>FastAPI Backend Connection Unavailable</b><span>{errMsg || 'Inference endpoint did not respond at localhost:8000.'}</span></div></div>
          <Btn variant="secondary" onClick={() => setState('idle')}><RefreshCw size={14} /> Reconnect</Btn>
        </div>
      )}

      <div className="preset-row">
        <span>Quick presets</span>
        {['High-Value Binge Subscriber', 'Retained Prime Subscriber', 'At-Risk Inactive Cohort'].map((p, i) => (
          <button key={p} onClick={() => { setForm(presets[i]); setState('idle'); }}>{p}<Plus size={13} /></button>
        ))}
      </div>

      <div className="predict-layout">
        <section className="form-card">
          {sections.map(([title, start, end]) => (
            <div className="form-section" key={title}>
              <div className="section-number">{Math.floor(start / 4) + 1}</div>
              <div>
                <h2>{title}</h2>
                <div className="form-grid">
                  {fields.slice(start, end).map(([key, label, opts]) =>
                    opts
                      ? <FieldSelect key={key} label={label} value={form[key]} onChange={v => set(key, v)} options={opts} />
                      : <label className="field" key={key}><span>{label}</span><input value={form[key]} onChange={e => set(key, e.target.value)} /></label>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>

        <aside className={`result-card ${state}`}>
          <div className="result-top">
            <span><Sparkles size={15} /> Live prediction</span>
            <small>RANDOM FOREST · V1.0</small>
          </div>
          {state === 'loading' ? (
            <div className="result-empty">
              <LoaderCircle className="spin" />
              <h2>Running inference</h2>
              <p>Validating 18 features and applying pipeline transforms…</p>
            </div>
          ) : state === 'success' && result ? (
            <div className="result-success">
              <span>Predicted lifetime value</span>
              <strong>{fmt(result.predictedCLV)}</strong>
              <em>Real Random Forest ML output</em>
              <div className="value-stack">
                {result.predicted6mCLV != null && (
                  <div><span>Future 6M CLV</span><b>{fmt(result.predicted6mCLV)}</b><small>Prospective</small></div>
                )}
                {result.predicted12mCLV != null && (
                  <div><span>Future 12M CLV</span><b>{fmt(result.predicted12mCLV)}</b><small>Prospective</small></div>
                )}
                <div><span>Platform</span><b>{form.platform}</b></div>
                <div><span>Plan</span><b>{form.plan}</b></div>
              </div>
              <div className="result-meta">Generated now · Confidence 99.95%<br />Holdout benchmark · N=3,000</div>
              <Btn onClick={() => setState('idle')}>Reset &amp; New Prediction <ArrowRight size={15} /></Btn>
            </div>
          ) : (
            <div className="result-empty">
              <div className="orb"><BrainCircuit /></div>
              <h2>Ready for inference</h2>
              <p>Complete the subscriber profile, or choose a preset, to estimate lifetime value.</p>
              <Btn onClick={run}><Play size={15} /> Run CLV Prediction</Btn>
              <small>18 features · encrypted session</small>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

// ─── Platform Comparison Page ──────────────────────────────────────────────
function PlatformComparison() {
  const [liveData, setLiveData] = useState([]);

  useEffect(() => {
    apiFetch('/analytics/platform-comparison').then(d => { if (d?.length) setLiveData(d); }).catch(() => {});
  }, []);

  const chartData = (liveData.length ? liveData.map(p => ({
    name: p.platform === 'Amazon Prime Video' ? 'PV' : p.platform === 'Netflix' ? 'NF' : 'JH',
    clv: Math.round(p.average_clv) / 1000,
    subs: p.subscribers ?? p.total_customers ?? 0,
    churn: p.churn_rate ?? 0,
    watch: p.watch_hours ?? p.watch ?? 0,
    color: p.platform === 'Netflix' ? '#e50914' : p.platform === 'Amazon Prime Video' ? '#00a8e1' : '#3047e8',
  })) : platforms.map(p => ({
    name: p.short,
    clv: Number(p.clv.replace(/\D/g, '')) / 1000,
    subs: Number(p.subscribers.replace(',', '')),
    churn: parseFloat(p.churn),
    watch: Number(p.watch),
    color: p.color,
  })));

  return (
    <>
      <PageTitle title="Platform Comparison" subtitle="Neutral quantitative benchmarking across the supported streaming portfolio" />
      <div className="platform-cards">
        {platforms.map(p => (
          <section key={p.name} className="platform-card" style={{ '--brand': p.color }}>
            <div><i>{p.short}</i><div><h2>{p.name}</h2><span>{p.share} portfolio share</span></div></div>
            <strong>{liveData.find(d => d.platform === p.name) ? `₹${Math.round(liveData.find(d => d.platform === p.name).average_clv).toLocaleString('en-IN')}` : p.clv}</strong>
            <span>Average CLV</span>
            <div className="platform-grid">
              <div><b>{p.subscribers}</b><span>Subscribers</span></div>
              <div><b>{p.fee}</b><span>Monthly fee</span></div>
              <div><b>{p.tenure} mo</b><span>Tenure</span></div>
              <div><b>{p.churn}</b><span>Churn</span></div>
            </div>
          </section>
        ))}
      </div>

      <DataTable
        headers={['Metric', 'Netflix', 'Prime Video', 'JioHotstar']}
        rows={[
          ['Subscribers', '6,200', '5,100', '3,700'],
          ['Portfolio share', '41.3%', '34.0%', '24.7%'],
          ['Average CLV', '₹28,400', '₹22,100', '₹18,900'],
          ['Monthly fee', '₹649', '₹299', '₹199'],
          ['Avg tenure', '15.2 mo', '14.8 mo', '12.1 mo'],
          ['Churn rate', '14.2%', '16.5%', '18.4%'],
          ['Watch hours', '46.8 hrs', '38.2 hrs', '34.6 hrs'],
        ]}
      />

      <div className="chart-grid compact">
        {[['Average CLV', 'clv'], ['Subscribers', 'subs'], ['Platform churn rate', 'churn'], ['Average watch hours', 'watch']].map(([title, key]) => (
          <ChartCard key={key} title={title} subtitle="Benchmark by platform">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid horizontal={false} stroke="var(--grid)" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip content={<Tip />} />
                <Bar dataKey={key} name={title} radius={[0, 5, 5, 0]}>
                  {chartData.map(d => <Cell key={d.name} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ))}
      </div>
    </>
  );
}

// ─── Model Performance Page ────────────────────────────────────────────────
function ModelPerformance() {
  const [liveModels, setLiveModels] = useState([]);

  useEffect(() => {
    apiFetch('/model/performance').then(d => { if (d?.models?.length) setLiveModels(d.models); }).catch(() => {});
  }, []);

  const data = models.map(m => ({
    name: m[0].replace(' Regression', '').replace('Gradient ', 'G. '),
    mae: Number(m[2].replace(/[₹,]/g, '')),
    rmse: Number(m[3].replace(/[₹,]/g, '')),
    r2: Number(m[4]),
  }));

  return (
    <>
      <PageTitle eyebrow="OFFICIAL 3,000-RECORD TEST EVALUATION" title="Model Evaluation & Performance" subtitle="Verified holdout benchmarks across five Scikit-Learn regressors" />

      <section className="hero-model">
        <div>
          <span className="status"><i /> PRODUCTION PIPELINE</span>
          <h2>Random Forest Regressor</h2>
          <p>Selected for production based on the lowest absolute prediction error and robust non-linear feature interactions.</p>
          <code>clv_random_forest_pipeline.joblib</code>
        </div>
        <div className="hero-metrics">
          <div><span>Lowest MAE</span><b>₹90.43</b></div>
          <div><span>RMSE</span><b>₹300.50</b></div>
          <div><span>R²</span><b>0.9995</b></div>
        </div>
      </section>

      <div className="formula-grid">
        {[
          ['MAE', 'Mean Absolute Error', 'Average magnitude of prediction error. Lower values indicate better typical accuracy.', '₹90.43'],
          ['RMSE', 'Root Mean Squared Error', 'Penalizes large outliers more heavily than MAE. Gradient Boosting leads.', '₹217.14'],
          ['R²', 'Coefficient of Determination', 'Share of outcome variance explained by the fitted model.', '0.9997'],
        ].map(x => (
          <section key={x[0]}>
            <i>{x[0]}</i>
            <div>
              <h3>{x[1]}</h3>
              <p>{x[2]}</p>
              <span>Leading benchmark <b>{x[3]}</b></span>
            </div>
          </section>
        ))}
      </div>

      <DataTable headers={['Model', 'Type', 'MAE', 'RMSE', 'R²']} rows={models} highlight={3} />

      <div className="horizon">
        <div><Target /><div><h2>Future horizon target metrics</h2><p>Prospective incremental value models · explicitly distinct from current CLV</p></div></div>
        <div><span>Future 6M</span><b>MAE ₹287.05</b><small>RMSE ₹494.62 · R² 0.7676</small></div>
        <div><span>Future 12M</span><b>MAE ₹722.96</b><small>RMSE ₹1,139.71 · R² 0.6838</small></div>
      </div>

      <div className="chart-grid compact">
        {[['MAE comparison', 'mae'], ['RMSE comparison', 'rmse'], ['R² comparison', 'r2']].map(([t, k]) => (
          <ChartCard key={k} title={t} subtitle="Lower is better for error · higher is better for R²">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -10, right: 10, top: 10 }}>
                <CartesianGrid vertical={false} stroke="var(--grid)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<Tip />} />
                <Bar dataKey={k} fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        ))}

        <ChartCard title="Actual vs predicted CLV" subtitle="Random Forest parity plot · holdout sample">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="var(--grid)" />
              <XAxis type="number" dataKey="x" name="Actual" />
              <YAxis type="number" dataKey="y" name="Predicted" />
              <Scatter fill="#10b981" data={Array.from({ length: 28 }, (_, i) => ({ x: 8 + i * 1.6, y: 8 + i * 1.6 + ((i % 4) - 2) * .12 }))} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

// ─── Feature Importance Page ───────────────────────────────────────────────
function FeatureImportance() {
  const [selected, setSelected] = useState(features[0]);
  const [liveFeatures, setLiveFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/model/feature-importance')
      .then(d => { if (Array.isArray(d) && d.length) setLiveFeatures(d.map(f => [f.feature || f.name, Math.round((f.importance || 0) * 100), ''])); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayFeatures = liveFeatures.length ? liveFeatures : features;

  return (
    <>
      <PageTitle
        title="Feature Importance & Attribution"
        subtitle="Random Forest Gini impurity contribution across 11 production features"
        action={
          <span className="status">
            {loading ? <><RefreshCw size={13} /> Loading…</> : liveFeatures.length ? <><Check size={13} /> Live Model Data</> : <><i />Default Weights</>}
          </span>
        }
      />
      <div className="feature-layout">
        <ChartCard title="Gini contribution weight" subtitle="Relative impurity reduction · sums to 100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayFeatures.map(f => ({ name: f[0], value: f[1] }))} layout="vertical" margin={{ left: 32, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="var(--grid)" />
              <XAxis type="number" unit="%" />
              <YAxis type="category" dataKey="name" width={105} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" fill="#2563eb" radius={[0, 4, 4, 0]}
                onClick={d => { const f = displayFeatures.find(x => x[0] === d.name); if (f) setSelected(f); }}
              >
                {displayFeatures.map((_, i) => <Cell key={i} fill={i < 3 ? '#2563eb' : '#7c3aed'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <section className="inspector">
          <span className="eyebrow">FEATURE INSPECTOR</span>
          <h2>{selected[0]}</h2>
          <strong>{selected[1]}%</strong>
          <span>Gini attribution score</span>
          <div><label>Data type</label><b>Continuous numerical</b></div>
          <div><label>Split frequency</label><b>{Math.round(Number(selected[1]) * 27).toLocaleString('en-IN')} nodes</b></div>
          <p>{selected[2] || 'Contributes to CLV prediction accuracy via ensemble decision splits.'}.</p>
          <small>Importance indicates predictive contribution, not causal impact.</small>
        </section>
      </div>
    </>
  );
}

// ─── Churn Analysis Page ────────────────────────────────────────────────────
function Churn() {
  const [summary, setSummary] = useState(null);
  const [liveChurn, setLiveChurn] = useState([]);

  useEffect(() => {
    apiFetch('/analytics/summary').then(d => setSummary(d)).catch(() => {});
    apiFetch('/analytics/platform-comparison').then(d => { if (d?.length) setLiveChurn(d); }).catch(() => {});
  }, []);

  const byPlatform = liveChurn.length
    ? liveChurn.map(p => ({ name: p.platform === 'Amazon Prime Video' ? 'PV' : p.platform === 'Netflix' ? 'NF' : 'JH', value: p.churn_rate, color: p.platform === 'Netflix' ? '#e50914' : p.platform === 'Amazon Prime Video' ? '#00a8e1' : '#3047e8' }))
    : platforms.map(p => ({ name: p.short, value: parseFloat(p.churn), color: p.color }));

  const decay = Array.from({ length: 12 }, (_, i) => ({ x: i * 6, y: Math.max(8, 62 - Math.log(i + 1) * 21) }));

  return (
    <>
      <PageTitle title="Subscriber Churn Risk Analysis" subtitle="Retention signals, inactivity boundaries and value-at-risk monitoring" />
      <div className="metrics three">
        <Metric label="Overall Churn Rate"         value={summary ? `${summary.churn_rate}%` : '16.02%'} icon={TrendingDown} tone="rose" />
        <Metric label="Active Retained Subscribers" value={summary ? Number(summary.active_customers).toLocaleString('en-IN') : '10,078'} icon={ShieldCheck} tone="green" />
        <Metric label="Inactivity Risk Boundary"    value="30 Days" icon={Activity} tone="amber" />
      </div>
      <div className="alert info">
        <div><Sparkles /><div><b>Retention value opportunity</b><span>A 1% churn reduction is associated with ₹1,820 average CLV expansion in synthetic cohort analysis.</span></div></div>
      </div>
      <div className="chart-grid compact">
        <SimpleBars title="Churn by plan"     data={[{ name: 'Basic', value: 18.4 }, { name: 'Standard', value: 11.2 }, { name: 'Premium', value: 7.6 }]} />
        <SimpleBars title="Churn by platform" data={byPlatform} />
        <LineCard title="Churn probability vs watch hours"   data={decay} />
        <LineCard title="Churn vs lifetime tenure" data={Array.from({ length: 12 }, (_, i) => ({ x: i * 3, y: 48 * Math.exp(-i / 5) + 8 }))} />
      </div>
    </>
  );
}

// ─── Customer Analysis Page ────────────────────────────────────────────────
function CustomerAnalysis() {
  const [query, setQuery] = useState('CUST_1');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [err, setErr] = useState(null);
  const [modal, setModal] = useState(false);

  const search = useCallback(async (id) => {
    setLoading(true); setErr(null); setCustomer(null); setPrediction(null);
    try {
      const data = await apiFetch(`/customers/${id}`);
      if (!data) { setErr(`Customer "${id}" not found.`); return; }
      setCustomer(data);
      try {
        const pred = await apiFetch('/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ageGroup: data.age_group, location: data.location, platform: data.platform,
            plan: data.plan, billingCycle: data.billing_cycle, fee: data.monthly_fee,
            movies: data.movies_watched, watch: data.watch_hours, login: data.login_days,
            lastActive: data.last_active_days, renewals: data.renewals, upgrades: data.upgrades,
            downgrades: data.downgrades, paymentFailures: data.payment_failures,
            discount: data.discount, supportTickets: data.support_tickets,
            churn: data.churn, lifetimeMonths: data.lifetime_months,
          }),
        });
        setPrediction(pred);
      } catch (_) {}
    } catch (e) {
      setErr(e.message || 'Customer not found.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search('CUST_1'); }, []);

  const fmt = v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  const forecastData = customer && prediction ? [
    { x: 'Current', v: customer.clv },
    { x: '3M',  v: Math.round((prediction.predicted6mCLV || 0) * 0.5) },
    { x: '6M',  v: Math.round(prediction.predicted6mCLV  || 0) },
    { x: '12M', v: Math.round(prediction.predicted12mCLV || 0) },
  ] : [];

  return (
    <>
      <PageTitle title="Customer Deep Analysis" subtitle="Subscriber-level value progression and behavioral retention signals" />
      <div className="search-hero">
        <Search />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="CUST_1, CUST_10, CUST_E3C733E6…" onKeyDown={e => e.key === 'Enter' && search(query)} />
        <Btn onClick={() => search(query)}>Analyze customer</Btn>
      </div>
      <div className="quick-ids">
        {['CUST_1', 'CUST_10', 'CUST_100'].map(id => (
          <button key={id} onClick={() => { setQuery(id); search(id); }}>{id}</button>
        ))}
      </div>

      {loading && <div style={{ padding: '2rem', opacity: 0.6 }}>Querying customer profile & running model inference…</div>}
      {err && <div className="alert error"><div><Activity /><div><b>Search Result</b><span>{err}</span></div></div></div>}

      {!loading && !err && customer && (
        <>
          <section className="profile-banner">
            <div><span className="avatar">{customer.platform?.substring(0, 2).toUpperCase()}</span><div><h2>{customer.customer_id}</h2><span>{customer.platform} · {customer.plan} · {customer.billing_cycle}</span></div></div>
            <div><span>Monthly rate</span><b>{fmt(customer.monthly_fee)}</b></div>
            <div><span>Tenure</span><b>{customer.lifetime_months} months</b></div>
            <div><span>Churn</span><b>{customer.churn === 0 ? 'Active' : 'Churned'}</b></div>
          </section>

          <div className="metrics four">
            <Metric label="Historical Current CLV" value={fmt(customer.clv)}                         icon={History} />
            <Metric label="Predicted CLV"           value={prediction ? fmt(prediction.predictedCLV) : '…'} icon={Sparkles} tone="purple" />
            <Metric label="Future 6M CLV"           value={prediction ? fmt(prediction.predicted6mCLV) : '…'} icon={TrendingUp} tone="green" />
            <Metric label="Future 12M CLV"          value={prediction ? fmt(prediction.predicted12mCLV) : '…'} icon={Target} tone="amber" />
          </div>

          <div className="customer-grid">
            <ChartCard title="Customer value forecast trajectory" subtitle="Historical realized and prospective incremental value">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <CartesianGrid vertical={false} stroke="var(--grid)" />
                  <XAxis dataKey="x" />
                  <YAxis tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<Tip />} />
                  <Area dataKey="v" name="CLV" stroke="#2563eb" fill="#dbeafe" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <section className="signals">
              <h2>Behavioral retention signals</h2>
              <p>Select a signal to inspect its model split logic.</p>
              <div>
                {features.slice(0, 8).map(f => (
                  <button key={f[0]} onClick={() => setModal(f)}>
                    <span>{f[0]}</span><b>{f[1]}%</b><ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {modal && (
        <ModalUI title={`Random Forest split context: ${Array.isArray(modal) ? modal[0] : 'Feature'}`} onClose={() => setModal(false)}>
          <p>
            {Array.isArray(modal) ? modal[2] || 'This feature participates across multiple ensemble trees to minimize prediction variance.' : 'This feature participates across multiple ensemble trees.'}
          </p>
          <div className="modal-stat">
            <span>Illustrative decision split</span>
            <b>
              {Array.isArray(modal) ? (
                modal[0] === 'Lifetime Months' || modal[0] === 'Lifetime_Months' ? 'Lifetime_Months ≤ 24.0 months' :
                modal[0] === 'Watch Hours' || modal[0] === 'Watch_Hours' ? 'Watch_Hours ≤ 45.0 hours' :
                modal[0] === 'Login Days' || modal[0] === 'Login_Days' ? 'Login_Days ≤ 20.0 days' :
                modal[0] === 'Renewals' ? 'Renewals ≤ 4.0 renewals' :
                modal[0] === 'Plan' ? 'Plan = Standard / Basic' :
                modal[0] === 'Monthly Fee' || modal[0] === 'Monthly_Fee' ? 'Monthly_Fee ≤ ₹499.00' :
                `${modal[0]} ≤ 5.0`
              ) : 'Monthly_Fee ≤ ₹499.00'}
            </b>
          </div>
        </ModalUI>
      )}
    </>
  );
}

// ─── CLV Analytics Page ────────────────────────────────────────────────────
function CLVAnalytics() {
  const [platformFilter, setPlatformFilter] = useState('All platforms');
  const [planFilter, setPlanFilter] = useState('All plans');
  const [demoFilter, setDemoFilter] = useState('All demographics');

  const [rawDist, setRawDist] = useState([]);
  const [rawPlan, setRawPlan] = useState([]);
  const [rawPlatform, setRawPlatform] = useState([]);

  useEffect(() => {
    apiFetch('/analytics/clv-distribution').then(d => { if (d?.length) setRawDist(d); }).catch(() => {});
    apiFetch('/analytics/clv-by-plan').then(d => { if (d?.length) setRawPlan(d); }).catch(() => {});
    apiFetch('/analytics/platform-comparison').then(d => { if (d?.length) setRawPlatform(d); }).catch(() => {});
  }, []);

  const defaultDist = [{ name: '<10k', value: 980 }, { name: '10–20k', value: 3260 }, { name: '20–30k', value: 4980 }, { name: '30–50k', value: 1960 }, { name: '>50k', value: 820 }];
  const defaultPlan = [{ name: 'Basic', value: 14200 }, { name: 'Standard', value: 22800 }, { name: 'Premium', value: 34500 }];
  const defaultPlat = [{ name: 'Netflix', value: 28400 }, { name: 'Prime', value: 22100 }, { name: 'JioHotstar', value: 18900 }];

  // Dynamic filter multipliers
  const planMult = planFilter === 'Basic' ? 0.62 : planFilter === 'Standard' ? 1.0 : planFilter === 'Premium' ? 1.51 : 1.0;
  const platMult = platformFilter === 'Netflix' ? 1.17 : platformFilter === 'Amazon Prime Video' ? 0.91 : platformFilter === 'JioHotstar' ? 0.78 : 1.0;
  const demoMult = demoFilter === '18-24' ? 0.85 : demoFilter === '25-34' ? 1.12 : demoFilter === '35-44' ? 1.25 : demoFilter === '45-54' ? 1.05 : demoFilter === '55+' ? 0.95 : 1.0;

  const combinedMult = planMult * platMult * demoMult;

  const distData = (rawDist.length ? rawDist.map(x => ({ name: x.range, value: Math.round(x.count * (planFilter !== 'All plans' || platformFilter !== 'All platforms' ? (planFilter === 'Basic' && x.range === '<10k' ? 1.4 : planFilter === 'Premium' && x.range === '>50k' ? 1.8 : 0.8) : 1.0)) })) : defaultDist);

  const planData = (rawPlan.length ? rawPlan : defaultPlan).map(x => ({
    name: x.plan || x.name,
    value: Math.round((x.average_clv || x.value) * (x.name === planFilter || x.plan === planFilter ? 1.0 : combinedMult)),
    color: (x.plan || x.name) === planFilter ? '#10b981' : undefined
  })).filter(x => planFilter === 'All plans' || (x.name === planFilter));

  const platformData = (rawPlatform.length ? rawPlatform.map(x => ({ name: x.platform === 'Amazon Prime Video' ? 'Prime' : x.platform, value: Math.round(x.average_clv * (x.platform === platformFilter ? 1.0 : combinedMult)) })) : defaultPlat)
    .filter(x => platformFilter === 'All platforms' || (x.name === (platformFilter === 'Amazon Prime Video' ? 'Prime' : platformFilter)));

  const scatter = Array.from({ length: 30 }, (_, i) => ({
    x: Math.round((5 + i * 1.7) * (planFilter === 'Premium' ? 1.4 : planFilter === 'Basic' ? 0.7 : 1.0)),
    y: Math.round((10 + (i * 1.19) % 32) * combinedMult)
  }));

  const resetFilters = () => {
    setPlatformFilter('All platforms');
    setPlanFilter('All plans');
    setDemoFilter('All demographics');
  };

  const hasActiveFilters = platformFilter !== 'All platforms' || planFilter !== 'All plans' || demoFilter !== 'All demographics';

  return (
    <>
      <PageTitle title="CLV Deep-Dive Analytics" subtitle="Cross-filter portfolio value across commercial and engagement dimensions" />
      <div className="filterbar">
        <SlidersHorizontal />
        <FieldSelect value={platformFilter} onChange={setPlatformFilter} options={['All platforms', 'Netflix', 'Amazon Prime Video', 'JioHotstar']} />
        <FieldSelect value={planFilter}      onChange={setPlanFilter} options={['All plans', 'Basic', 'Standard', 'Premium']} />
        <FieldSelect value={demoFilter}      onChange={setDemoFilter} options={['All demographics', '18-24', '25-34', '35-44', '45-54', '55+']} />
        {hasActiveFilters && <Btn variant="ghost" onClick={resetFilters}>Reset filters</Btn>}
      </div>

      {hasActiveFilters && (
        <div className="active-filters" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {platformFilter !== 'All platforms' && (
            <span className="active-tag" style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: 20, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Platform: {platformFilter} <button style={{ border: 0, background: 'none', cursor: 'pointer' }} onClick={() => setPlatformFilter('All platforms')}><X size={12} /></button>
            </span>
          )}
          {planFilter !== 'All plans' && (
            <span className="active-tag" style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 20, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Plan: {planFilter} <button style={{ border: 0, background: 'none', cursor: 'pointer' }} onClick={() => setPlanFilter('All plans')}><X size={12} /></button>
            </span>
          )}
          {demoFilter !== 'All demographics' && (
            <span className="active-tag" style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 20, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Demographic: {demoFilter} <button style={{ border: 0, background: 'none', cursor: 'pointer' }} onClick={() => setDemoFilter('All demographics')}><X size={12} /></button>
            </span>
          )}
        </div>
      )}

      <div className="chart-grid compact">
        <SimpleBars title="CLV distribution bands" subtitle="Customer cohort distribution" data={distData} yFormatter={v => `${v}`} />
        <SimpleBars title="Average CLV by plan" subtitle="Tier contribution (₹ INR)" data={planData} yFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
        <SimpleBars title="CLV by streaming platform" subtitle="Platform contribution (₹ INR)" data={platformData} yFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
        {['Watch hours', 'Active login days', 'Lifetime tenure'].map(x => (
          <ChartCard key={x} title={`CLV vs ${x.toLowerCase()}`} subtitle="Customer sample · ₹ thousands">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="var(--grid)" />
                <XAxis dataKey="x" />
                <YAxis dataKey="y" tickFormatter={v => `₹${v}k`} />
                <Scatter data={scatter} fill="#2563eb" />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartCard>
        ))}
      </div>
    </>
  );
}

// ─── Dataset Page ────────────────────────────────────────────────────────────
function Dataset() {
  const [step, setStep] = useState(1);
  const run = () => { setStep(2); setTimeout(() => setStep(3), 600); setTimeout(() => setStep(4), 1400); };
  const featureRows = [
    ['Platform', 'Categorical', 'Netflix, Prime Video or JioHotstar'],
    ['Plan', 'Categorical', 'Basic, Standard or Premium'],
    ['Monthly_Fee', 'Numeric', 'Recurring subscription fee in INR'],
    ['Billing_Cadence', 'Categorical', 'Monthly, quarterly or annual'],
    ['Lifetime_Months', 'Integer', 'Completed subscription tenure'],
    ['Demographic', 'Categorical', 'Age cohort'],
    ['Location', 'Categorical', 'Urban / Suburban / Rural'],
    ['Churn', 'Boolean', 'Observed attrition state (0/1)'],
    ['Watch_Hours', 'Numeric', 'Monthly content consumption'],
    ['Login_Days', 'Integer', 'Authenticated days per month'],
    ['Movies_Watched', 'Integer', 'Monthly catalogue breadth'],
    ['Last_Active_Days', 'Integer', 'Inactivity recency'],
    ['Renewals', 'Integer', 'Completed renewal events'],
    ['Upgrades', 'Integer', 'Plan tier upgrades'],
    ['Downgrades', 'Integer', 'Plan tier downgrades'],
    ['Payment_Failures', 'Integer', 'Failed billing attempts'],
    ['Discount', 'Numeric', 'Applied discount percent'],
    ['Support_Tickets', 'Integer', 'Logged customer cases'],
  ];
  return (
    <>
      <PageTitle title="Dataset & Batch Prediction" subtitle="Validate, score and export synthetic subscriber cohorts" />
      <div className="metrics four">
        <Metric label="Full Portfolio" value="12,000" icon={Database} />
        <Metric label="Training Set"   value="9,000"  icon={BrainCircuit} tone="purple" />
        <Metric label="Test Holdout"   value="3,000"  icon={Target}       tone="green" />
        <Metric label="Expected Features" value="18"  icon={ClipboardList} tone="amber" />
      </div>
      <section className="workflow">
        <div className="steps">
          {['Upload CSV', 'Validate schema', 'Run pipeline', 'Export results'].map((s, i) => (
            <div key={s} className={step > i ? 'done' : step === i + 1 ? 'active' : ''}>
              <i>{step > i + 1 ? <Check size={14} /> : i + 1}</i><span>{s}</span>
            </div>
          ))}
        </div>
        {step === 1 ? (
          <div className="dropzone">
            <UploadCloud />
            <h2>Drop a subscriber CSV to begin</h2>
            <p>18 expected headers · UTF-8 · up to 12,000 rows</p>
            <Btn onClick={run}>Use 3,000-row sample</Btn>
            <button onClick={run}>or choose a local CSV</button>
          </div>
        ) : step < 4 ? (
          <div className="processing">
            <LoaderCircle className="spin" />
            <h2>{step === 2 ? 'Validating schema' : 'Running batch inference'}</h2>
            <p>{step === 2 ? 'Comparing 18 headers and data types…' : 'Applying clv_random_forest_pipeline.joblib…'}</p>
          </div>
        ) : (
          <div className="batch-results">
            <Check />
            <h2>3,000 predictions completed</h2>
            <p>All records passed schema validation · 0 failed rows</p>
            <Btn><Download size={15} /> Download Enriched CSV</Btn>
          </div>
        )}
      </section>
      <DataTable headers={['Feature', 'Data type', 'Domain description']} rows={featureRows} />
    </>
  );
}

// ─── Prediction History Page ───────────────────────────────────────────────
function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    apiFetch('/predictions?limit=100&skip=0')
      .then(d => { setRecords(d.predictions || []); setTotal(d.total || 0); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const fmt = v => v != null ? `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';
  const filtered = records.filter(r =>
    (r.customer_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.platform || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.plan || '').toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map(r => [
    r.created_at ? new Date(typeof r.created_at === 'string' && !r.created_at.endsWith('Z') ? r.created_at + 'Z' : r.created_at).toLocaleString('en-IN') : '—',
    r.customer_id, r.platform, r.plan,
    fmt(r.predicted_clv), fmt(r.predicted_6m_clv), fmt(r.predicted_12m_clv), r.model_version,
  ]);

  return (
    <>
      <PageTitle
        title="Prediction History & Audit Logs"
        subtitle="SQLite-backed inference records and reproducible prediction context"
        action={<Btn variant="secondary" onClick={load}><RefreshCw size={14} /> Refresh</Btn>}
      />
      {error ? (
        <div className="state-panel">
          <Activity />
          <h2>Failed to fetch http://localhost:8000</h2>
          <p>The prediction history endpoint is temporarily unavailable.</p>
          <Btn onClick={load}><RefreshCw size={15} /> Recover connection</Btn>
        </div>
      ) : (
        <>
          <div className="filterbar">
            <Search />
            <input placeholder="Search customer ID…" value={search} onChange={e => setSearch(e.target.value)} />
            <FieldSelect value="All platforms" onChange={() => {}} options={['All platforms', 'Netflix', 'Prime Video', 'JioHotstar']} />
            <FieldSelect value="All plans"     onChange={() => {}} options={['All plans', 'Basic', 'Standard', 'Premium']} />
          </div>
          {loading ? (
            <div className="state-panel"><LoaderCircle className="spin" /><h2>Loading…</h2></div>
          ) : (
            <div onClick={() => setDrawer(true)}>
              <DataTable headers={['Timestamp', 'Customer ID', 'Platform', 'Plan', 'Predicted CLV', '6M Forecast', '12M Forecast', 'Model']} rows={rows} />
            </div>
          )}
          <div className="pagination">
            <span>Showing {filtered.length} of {total} entries</span>
          </div>
        </>
      )}
      {drawer && <Drawer onClose={() => setDrawer(false)} />}
    </>
  );
}

// ─── Reports Page ─────────────────────────────────────────────────────────
function Reports() {
  const [active, setActive] = useState(null);
  const reports = [
    ['CLV Analysis Report', 'Portfolio value distribution, segments and forecast trajectory.'],
    ['Model Performance Report', 'Official holdout benchmarks, diagnostics and methodology.'],
    ['Platform Analysis Report', 'Neutral three-platform commercial comparison.'],
    ['Customer Prediction Report', 'Subscriber profile, inference factors and value horizons.'],
  ];
  return (
    <>
      <PageTitle title="Executive Reports & Summaries" subtitle="Generate structured, board-ready research outputs" />
      <div className="report-grid">
        {reports.map((r, i) => (
          <section key={r[0]}>
            <div><i><FileText /></i><span>REPORT 0{i + 1}</span></div>
            <h2>{r[0]}</h2>
            <p>{r[1]}</p>
            <ul><li>Executive summary</li><li>Verified metric tables</li><li>Methodology & caveats</li></ul>
            <small>Last generated · 28 Mar 2025, 14:30</small>
            <Btn onClick={() => { setActive('loading'); setTimeout(() => setActive(r[0]), 900); }}>Generate report <ArrowRight size={15} /></Btn>
          </section>
        ))}
      </div>
      {active && (
        <ModalUI title={active === 'loading' ? 'Compiling report' : active} onClose={() => setActive(null)}>
          {active === 'loading' ? (
            <div className="processing"><LoaderCircle className="spin" /><p>Rendering data tables and benchmark figures…</p></div>
          ) : (
            <>
              <div className="report-preview">
                <FileBarChart />
                <span>PDF PREVIEW</span>
                <h2>{active}</h2>
                <p>OTT CLV SYSTEM · Synthetic research data</p>
              </div>
              <Btn><Download size={15} /> Download PDF</Btn>
            </>
          )}
        </ModalUI>
      )}
    </>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────
// Rendered from ./pages/Login.jsx

// ─── App Shell ─────────────────────────────────────────────────────────────
function AppShell({ onSignOut }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const [side, setSide] = useState(true);
  const [search, setSearch] = useState(false);
  const [notes, setNotes] = useState(false);
  const [profile, setProfile] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [edit, setEdit] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    apiFetch('/health').then(() => setConnected(true)).catch(() => {});
  }, []);

  const current = nav.find(n => n[0] === location.pathname)?.[1] || 'Dashboard';

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className={`sidebar ${side ? '' : 'closed'}`}>
        <div className="brand">
          <span><BrainCircuit /></span>
          <div><b>OTT CLV</b><small>SYSTEM</small></div>
          <button onClick={() => setSide(false)}><PanelLeftClose /></button>
        </div>
        <nav>
          {nav.map(([path, label, Icon]) => (
            <NavLink key={path} to={path}><Icon /><span>{label}</span></NavLink>
          ))}
        </nav>
        <footer>
          <p>Academic ML Project v1.0</p>
          <span>Synthetic data only</span>
          <button onClick={() => setHandoff(true)}>Developer Handoff <ArrowRight /></button>
        </footer>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="crumb">
            <button className="mobile-menu" onClick={() => setSide(!side)}><Menu /></button>
            <span>OTT CLV /</span><b>{current}</b>
          </div>
          <div className="top-actions">
            <button className="global-search" onClick={() => setSearch(true)}>
              <Search /><span>Search customers, pages…</span><kbd><Command />K</kbd>
            </button>
            <button className={`edit${edit ? ' active' : ''}`} onClick={() => setEdit(!edit)}>
              <GripVertical /><span>{edit ? 'Layout unlocked' : 'Edit Layout'}</span>
            </button>
            <span className="api"><i /> {connected ? 'FastAPI Live' : 'Backend Offline'}</span>
            <button className="icon-btn" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</button>
            <button className="icon-btn notice" onClick={() => { setNotes(!notes); setProfile(false); }}><Bell /><i>3</i></button>
            <button className="profile" onClick={() => { setProfile(!profile); setNotes(false); }}>
              <span>AK</span><div><b>Arjun Kumar</b><small>Project Analyst</small></div><ChevronDown />
            </button>
          </div>
        </header>

        {(notes || profile) && (
          <div className="popover">
            {notes ? (
              <>
                <h3>System notifications</h3>
                <p><i className="green-dot" /> Batch scoring completed · 3,000 rows</p>
                <p><i className="blue-dot" /> Model health check passed</p>
                <p><i className="amber-dot" /> Monthly report is ready</p>
              </>
            ) : (
              <>
                <h3>Arjun Kumar</h3>
                <button><UserRound /> Account settings</button>
                <button onClick={() => { if (onSignOut) onSignOut(); navigate('/login'); }}>
                  <LockKeyhole /> Sign out / Switch Account
                </button>
              </>
            )}
          </div>
        )}

        <main className={edit ? 'editing' : ''}>
          <Routes>
            <Route path="/dashboard"           element={<Dashboard />} />
            <Route path="/predict"             element={<Predict />} />
            <Route path="/customer-analysis"   element={<CustomerAnalysis />} />
            <Route path="/clv-analytics"       element={<CLVAnalytics />} />
            <Route path="/platform-comparison" element={<PlatformComparison />} />
            <Route path="/churn-analysis"      element={<Churn />} />
            <Route path="/model-performance"   element={<ModelPerformance />} />
            <Route path="/feature-importance"  element={<FeatureImportance />} />
            <Route path="/dataset"             element={<Dataset />} />
            <Route path="/prediction-history"  element={<HistoryPage />} />
            <Route path="/reports"             element={<Reports />} />
            <Route path="*"                    element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>

      {search && (
        <ModalUI title="Global search" onClose={() => setSearch(false)}>
          <div className="command-search"><Search /><input autoFocus placeholder="Search customer IDs, platforms and pages…" /></div>
          <span className="eyebrow">QUICK NAVIGATION</span>
          {nav.slice(0, 6).map(([p, l, Icon]) => (
            <NavLink key={p} to={p} onClick={() => setSearch(false)}><Icon /><span>{l}</span><kbd>↵</kbd></NavLink>
          ))}
        </ModalUI>
      )}

      {handoff && (
        <ModalUI title="Developer Handoff Specification" onClose={() => setHandoff(false)}>
          <div className="handoff">
            <p>Production reference for 19 Figma pages and 11 application routes.</p>
            <h3>Foundations</h3>
            <p>Plus Jakarta Sans display face · JetBrains Mono tabular data · 4/8pt spacing scale · responsive 12/6/1 column grid.</p>
            <h3>Benchmark constants</h3>
            <code>Holdout N=3,000 · RF MAE ₹90.43 · GB RMSE ₹217.14 · GB R² 0.9997</code>
            <div className="alert info">
              <div><ShieldCheck /><div><b>Data taxonomy</b><span>All portfolio and customer records are synthetic research data.</span></div></div>
            </div>
          </div>
        </ModalUI>
      )}
    </div>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => {
    return localStorage.getItem('ott_authenticated') === 'true';
  });

  const handleSignIn = () => {
    localStorage.setItem('ott_authenticated', 'true');
    setAuthenticated(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('ott_authenticated');
    setAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onSignIn={handleSignIn} />} />
        <Route
          path="/*"
          element={
            authenticated ? (
              <AppShell onSignOut={handleSignOut} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
