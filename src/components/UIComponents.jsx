import { useState } from 'react';

// --- Icon (inline SVG) ---
export function Icon({ name, size = 18 }) {
  const paths = {
    grid:     <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    spark:    <><path d="M13 2 5 14h7l-1 8 8-13h-7z"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.4 3.5-6.5 8-6.5s7.2 2.1 8 6.5"/></>,
    chart:    <><path d="M4 19V9m6 10V5m6 14v-7m5 7H2"/></>,
    layers:   <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    refresh:  <><path d="M20 7h-5V2"/><path d="M20 7a9 9 0 1 0 1 8"/></>,
    gauge:    <><path d="M4.2 19a9 9 0 1 1 15.6 0"/><path d="m12 13 4-4"/><path d="M8 19h8"/></>,
    bars:     <><path d="M4 7h9M4 12h16M4 17h12"/><circle cx="16" cy="7" r="1"/><circle cx="2" cy="12" r="1"/><circle cx="18" cy="17" r="1"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></>,
    clock:    <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
    file:     <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 13h6M9 17h6"/></>,
    search:   <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
    bell:     <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    chevron:  <><path d="m9 18 6-6-6-6"/></>,
    arrow:    <><path d="M5 12h14m-5-5 5 5-5 5"/></>,
    info:     <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
    upload:   <><path d="M12 16V3m-5 5 5-5 5 5M5 14H3v7h18v-7h-2"/></>,
    download: <><path d="M12 3v13m-5-5 5 5 5-5M4 21h16"/></>,
    check:    <><path d="m4 12 5 5L20 6"/></>,
    filter:   <><path d="M3 5h18l-7 8v6l-4 2v-8z"/></>,
    chat:     <><path d="M4 4h16v12H8l-4 4V4Z"/><path d="M8 9h8M8 12h5"/></>,
    lock:     <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    logout:   <><path d="M10 4H4v16h6M14 8l4 4-4 4M9 12h9"/></>,
    send:     <><path d="m3 3 18 9-18 9 4-9-4-9Z"/><path d="M7 12h14"/></>,
  };
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      {paths[name] || paths.info}
    </svg>
  );
}

// --- Button ---
export function Button({ children, variant = 'primary', icon, onClick, type = 'button', disabled }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick} type={type} disabled={disabled}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

// --- Card ---
export function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

// --- Demo badge ---
export function DemoBadge() {
  return <span className="demo-badge"><span />Demo data</span>;
}

// --- Page header ---
export function PageHead({ title, subtitle, action }) {
  return (
    <div className="section-head">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      {action}
    </div>
  );
}

// --- KPI card ---
export function Kpi({ label, value, meta, tone = 'neutral', icon }) {
  return (
    <Card className="kpi">
      <div className={`kpi-icon ${tone}`}><Icon name={icon} /></div>
      <div className="kpi-label">{label}</div>
      <strong>{value}</strong>
      <div className={`kpi-meta ${(meta || '').startsWith('+') ? 'up' : ''}`}>{meta}</div>
    </Card>
  );
}

// --- Chart card wrapper ---
export function ChartCard({ title, subtitle, children, wide = false, badge }) {
  return (
    <Card className={wide ? 'chart-card wide' : 'chart-card'}>
      <div className="card-head">
        <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
        {badge}
      </div>
      {children}
    </Card>
  );
}

// --- Form helpers ---
export const Field = ({ label, children, hint }) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);

export const FormInput = (props) => <input {...props} />;

export const FormSelect = ({ children, ...props }) => <select {...props}>{children}</select>;

// ============================================================================
// IMAGE 1: CLV Trend Over Time Line Chart
// ============================================================================
export function ModelTrendChart() {
  const [active, setActive] = useState(5); // Sep '24 default
  const data = [
    { label: "Apr '24", val: 4.2 },
    { label: "May '24", val: 4.5 },
    { label: "Jun '24", val: 4.7 },
    { label: "Jul '24", val: 5.0 },
    { label: "Aug '24", val: 5.2 },
    { label: "Sep '24", val: 5.35 },
    { label: "Oct '24", val: 5.7 },
    { label: "Nov '24", val: 6.0 },
    { label: "Dec '24", val: 6.3 },
    { label: "Jan '25", val: 6.6 },
    { label: "Feb '25", val: 6.9 },
    { label: "Mar '25", val: 7.2 },
  ];

  // Map 0..8Cr to 0..100% SVG
  // 0Cr -> y=180, 8Cr -> y=10
  const getX = (i) => i * (540 / 11) + 10;
  const getY = (v) => 180 - (v / 8) * 170;

  const points = data.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ');
  const activeX = getX(active);
  const activeY = getY(data[active].val);

  return (
    <div className="clv-trend-container">
      <div className="clv-trend-y">
        <span>₹8Cr</span>
        <span>₹6Cr</span>
        <span>₹4Cr</span>
        <span>₹2Cr</span>
        <span>₹0Cr</span>
      </div>

      <div className="clv-trend-plot">
        <svg viewBox="0 0 560 190" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b55ee" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#5b55ee" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={getY(8)} x2="560" y2={getY(8)} stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1={getY(6)} x2="560" y2={getY(6)} stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1={getY(4)} x2="560" y2={getY(4)} stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1={getY(2)} x2="560" y2={getY(2)} stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1={getY(0)} x2="560" y2={getY(0)} stroke="#e4e8ef" strokeDasharray="3 3" />

          {/* Area fill & line */}
          <path d={`M${points} L560,180 L10,180Z`} fill="url(#trendGrad)" />
          <polyline points={points} fill="none" stroke="#5b55ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Active indicator vertical line & dot */}
          <line x1={activeX} y1={getY(8)} x2={activeX} y2={180} stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx={activeX} cy={activeY} r="5" fill="#5b55ee" stroke="#ffffff" strokeWidth="2" />
        </svg>

        {/* Hover buttons */}
        {data.map((d, i) => (
          <button
            key={d.label}
            style={{
              position: 'absolute',
              left: `${(i / 11) * 96 + 2}%`,
              top: `${(getY(d.val) / 190) * 100}%`,
              width: '24px', height: '24px',
              transform: 'translate(-50%, -50%)',
              background: 'transparent', border: 0, cursor: 'pointer'
            }}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          />
        ))}

        {/* Floating Tooltip */}
        <div className="clv-tooltip" style={{ left: `${Math.min(75, Math.max(20, (activeX / 560) * 100))}%`, top: '45%' }}>
          <b>{data[active].label}</b>
          <div>
            <span>Predicted CLV</span>
            <strong className="purple">₹{data[active].val.toFixed(2)}Cr</strong>
          </div>
        </div>
      </div>

      <div className="clv-trend-x">
        <span>Apr '24</span>
        <span>Jun '24</span>
        <span>Aug '24</span>
        <span>Oct '24</span>
        <span>Dec '24</span>
        <span>Feb '25</span>
      </div>
    </div>
  );
}

// ============================================================================
// IMAGE 2: Monthly Recurring Revenue (MRR) Bar Chart
// ============================================================================
export function ModelMRRBarChart() {
  const [active, setActive] = useState(2); // Jun default
  const data = [
    { month: 'Apr', val: 18 },
    { month: 'May', val: 19 },
    { month: 'Jun', val: 20 },
    { month: 'Jul', val: 21 },
    { month: 'Aug', val: 21.5 },
    { month: 'Sep', val: 22 },
    { month: 'Oct', val: 23 },
    { month: 'Nov', val: 24 },
    { month: 'Dec', val: 25 },
    { month: 'Jan', val: 26 },
    { month: 'Feb', val: 27 },
    { month: 'Mar', val: 28 },
  ];

  const maxVal = 28;

  return (
    <div className="mrr-chart-container">
      <div className="mrr-y-axis">
        <span>₹28L</span>
        <span>₹21L</span>
        <span>₹14L</span>
        <span>₹7L</span>
        <span>₹0L</span>
      </div>

      <div className="mrr-bars-wrap">
        {/* Horizontal gridlines overlay */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="0" y1="0%" x2="100%" y2="0%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
        </svg>

        {data.map((d, i) => (
          <div
            key={d.month}
            className={`mrr-col ${active === i ? 'active' : ''}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <div className="mrr-col-bg" />
            <div
              className="mrr-bar-inner"
              style={{ height: `${(d.val / maxVal) * 100}%` }}
            />
          </div>
        ))}

        {/* Active Tooltip */}
        {active !== null && (
          <div className="clv-tooltip" style={{ left: `${(active / 11) * 75 + 12}%`, top: '40%' }}>
            <b>{data[active].month}</b>
            <div>
              <span>MRR</span>
              <strong className="purple">₹{data[active].val}L</strong>
            </div>
          </div>
        )}
      </div>

      <div className="mrr-x-axis">
        {data.map(d => <span key={d.month}>{d.month}</span>)}
      </div>
    </div>
  );
}

// ============================================================================
// IMAGE 3 (Left): MRR vs Predicted CLV Scatter Plot
// ============================================================================
export function ModelScatterChart() {
  const [active, setActive] = useState(1); // Stellar default
  const points = [
    { name: 'Apex', xLabel: '₹421K', yLabel: '₹11L', xPct: 15, yPct: 15, mrr: '₹421K', clv: '₹11.2L' },
    { name: 'Stellar', xLabel: '₹189K', yLabel: '₹5.6L', xPct: 30, yPct: 52, mrr: '₹189K', clv: '₹5.62L' },
    { name: 'Prime', xLabel: '₹198K', yLabel: '₹9L', xPct: 45, yPct: 26, mrr: '₹198K', clv: '₹9.1L' },
    { name: 'Core', xLabel: '₹98K', yLabel: '₹8L', xPct: 58, yPct: 34, mrr: '₹98K', clv: '₹8.0L' },
    { name: 'Pulse', xLabel: '₹43K', yLabel: '₹6L', xPct: 72, yPct: 48, mrr: '₹43K', clv: '₹6.4L' },
    { name: 'Basic', xLabel: '₹28K', yLabel: '₹1.5L', xPct: 88, yPct: 85, mrr: '₹28K', clv: '₹1.5L' },
  ];

  return (
    <div className="scatter-mrr-container">
      <div className="scatter-y-axis">
        <span>₹12L</span>
        <span>₹9L</span>
        <span>₹6L</span>
        <span>₹3L</span>
        <span>₹0L</span>
      </div>

      <div className="scatter-plot-area">
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Dashed Gridlines */}
          <line x1="0" y1="0%" x2="100%" y2="0%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />

          <line x1="16%" y1="0" x2="16%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="32%" y1="0" x2="32%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="48%" y1="0" x2="48%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="64%" y1="0" x2="64%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />

          {/* Active Crosshairs */}
          {active !== null && (
            <>
              <line x1="0" y1={`${points[active].yPct}%`} x2="100%" y2={`${points[active].yPct}%`} stroke="#cbd5e1" strokeWidth="1" />
              <line x1={`${points[active].xPct}%`} y1="0" x2={`${points[active].xPct}%`} y2="100%" stroke="#cbd5e1" strokeWidth="1" />
            </>
          )}
        </svg>

        {points.map((p, i) => (
          <div
            key={p.name}
            className={`scatter-dot ${active === i ? 'active' : ''}`}
            style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          />
        ))}

        {/* Tooltip */}
        {active !== null && (
          <div className="clv-tooltip" style={{ left: `${Math.min(65, points[active].xPct + 5)}%`, top: `${Math.min(60, points[active].yPct + 5)}%` }}>
            <b>{points[active].name}</b>
            <div>
              <span>MRR:</span>
              <strong className="purple">{points[active].mrr}</strong>
            </div>
            <div style={{ marginTop: 2 }}>
              <span>CLV:</span>
              <strong className="teal">{points[active].clv}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="scatter-x-axis">
        <span>₹421K</span>
        <span>₹189K</span>
        <span>₹198K</span>
        <span>₹98K</span>
        <span>₹43K</span>
        <span>₹28K</span>
      </div>
    </div>
  );
}

// ============================================================================
// IMAGE 3 (Right): Horizontal CLV Distribution Chart
// ============================================================================
export function ModelHorizontalDistribution() {
  const bands = [
    { label: '₹0–5L', val: 310, color: '#4f46e5' },
    { label: '₹5–15L', val: 480, color: '#4338ca' },
    { label: '₹15–30L', val: 390, color: '#3b82f6' },
    { label: '₹30–60L', val: 290, color: '#60a5fa' },
    { label: '₹60L–1Cr', val: 230, color: '#38bdf8' },
    { label: '₹1–3Cr', val: 180, color: '#2dd4bf' },
    { label: '₹3–6Cr', val: 100, color: '#5eead4' },
    { label: '₹6Cr+', val: 90, color: '#99f6e4' },
  ];

  const maxVal = 480;

  return (
    <div className="horiz-dist-container">
      {/* Dashed vertical ticks background */}
      <svg style={{ position: 'absolute', inset: '0 0 25px 85px', width: 'calc(100% - 85px)', height: 'calc(100% - 25px)', pointerEvents: 'none' }}>
        <line x1="0%" y1="0" x2="0%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
        <line x1="33%" y1="0" x2="33%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
        <line x1="66%" y1="0" x2="66%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
        <line x1="100%" y1="0" x2="100%" y2="100%" stroke="#e4e8ef" strokeDasharray="3 3" />
      </svg>

      {bands.map((b) => (
        <div key={b.label} className="horiz-bar-row">
          <span className="horiz-label">{b.label}</span>
          <div className="horiz-bar-track">
            <div
              className="horiz-bar-fill"
              style={{
                width: `${(b.val / maxVal) * 100}%`,
                background: b.color
              }}
              title={`${b.label}: ${b.val} customers`}
            />
          </div>
        </div>
      ))}

      <div className="horiz-x-ticks">
        <span>0</span>
        <span>150</span>
        <span>300</span>
        <span>450</span>
      </div>
    </div>
  );
}

// Fallback legacy components for backward compatibility
export function Bars() {
  return <ModelMRRBarChart />;
}
export function Donut() {
  return <ModelHorizontalDistribution />;
}
export function TrendChart() {
  return <ModelTrendChart />;
}
export function Scatter() {
  return <ModelScatterChart />;
}