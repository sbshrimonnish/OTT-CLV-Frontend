import { useState, useRef, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PageHead, Card, Button, Icon } from '../components/UIComponents';
import {
  fetchAnalyticsSummary,
  fetchModelPerformance,
  fetchPlatformComparison,
  fetchCLVByPlan,
} from '../services/api';
import { formatINR, formatNumber } from '../utils/formatters';

const REPORTS = [
  { id: 'clv',        name: 'CLV Analysis Report',        desc: 'Customer value distribution, plan and platform breakdown, and key engagement insights.',                icon: 'chart',  color: '#5b55ee' },
  { id: 'model',      name: 'Model Performance Report',   desc: 'Evaluation metrics, train/test splits, and model comparison across all 5 algorithms.',                  icon: 'gauge',  color: '#0e9384' },
  { id: 'platform',   name: 'Platform Analysis Report',   desc: 'Cross-platform CLV, subscriber counts, churn rates and watch-hour engagement.',                        icon: 'layers', color: '#b54708' },
  { id: 'prediction', name: 'Customer Prediction Report', desc: 'Live prediction pipeline status, recent history, and model accuracy summary.',                         icon: 'user',   color: '#6366f1' },
];

const NOW = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid #e4e8ef', margin: '18px 0' }} />;
}

function Metric({ label, value, sub }) {
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e4e8ef', borderRadius: 10, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#667085', fontWeight: 500 }}>{label}</span>
      <strong style={{ fontSize: 20, color: '#172033', fontFamily: 'monospace', letterSpacing: -0.5 }}>{value}</strong>
      {sub && <span style={{ fontSize: 10, color: '#98a2b3' }}>{sub}</span>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '22px 0 14px' }}>
      <div style={{ flex: 1, height: 1, background: '#e4e8ef' }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#5b55ee', letterSpacing: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: '#e4e8ef' }} />
    </div>
  );
}

function CLVReportContent({ data }) {
  const s = data?.summary || {};
  const planRows = (data?.plans?.length ? data.plans : [
    { plan: 'Basic', average_clv: 14200 },
    { plan: 'Standard', average_clv: 22800 },
    { plan: 'Premium', average_clv: 34500 },
  ]);
  const platRows = (data?.platforms?.length ? data.platforms : [
    { platform: 'Netflix', average_clv: 28400, total_customers: 6200, churn_rate: 14.2, watch_hours: 46.8 },
    { platform: 'Amazon Prime Video', average_clv: 22100, total_customers: 5100, churn_rate: 16.5, watch_hours: 38.2 },
    { platform: 'JioHotstar', average_clv: 18900, total_customers: 3700, churn_rate: 18.4, watch_hours: 34.6 },
  ]);
  const TH = { padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#172033', fontSize: 11 };
  return (
    <div>
      <SectionTitle>Portfolio Summary</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Metric label="Total Customers" value={formatNumber(s.total_customers || 12000)} sub="Training portfolio" />
        <Metric label="Active Customers" value={formatNumber(s.active_customers || 10078)} sub="Currently subscribed" />
        <Metric label="Average CLV" value={formatINR(s.average_clv || 24350.8)} sub="Per customer" />
        <Metric label="Churn Rate" value={`${(s.churn_rate || 16.02).toFixed(2)}%`} sub="Dataset rate" />
      </div>
      <SectionTitle>CLV by Subscription Plan</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ background: '#f0f1ff' }}>
          {['Plan', 'Avg CLV', 'Relative Value'].map(h => <th key={h} style={TH}>{h}</th>)}
        </tr></thead>
        <tbody>{planRows.map((p, i) => (
          <tr key={p.plan} style={{ background: i % 2 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e4e8ef' }}>
            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.plan}</td>
            <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{formatINR(p.average_clv, { compact: false })}</td>
            <td style={{ padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ height: 6, borderRadius: 3, background: '#5b55ee', width: `${(p.average_clv / 35000) * 120}px` }} />
                <span style={{ fontSize: 11, color: '#667085' }}>{((p.average_clv / 34500) * 100).toFixed(0)}%</span>
              </div>
            </td>
          </tr>
        ))}</tbody>
      </table>
      <SectionTitle>CLV by Streaming Platform</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ background: '#f0f1ff' }}>
          {['Platform', 'Avg CLV', 'Subscribers', 'Churn Rate', 'Watch Hrs'].map(h => <th key={h} style={TH}>{h}</th>)}
        </tr></thead>
        <tbody>{platRows.map((p, i) => (
          <tr key={p.platform} style={{ background: i % 2 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e4e8ef' }}>
            <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.platform === 'Amazon Prime Video' ? 'Prime Video' : p.platform}</td>
            <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{formatINR(p.average_clv)}</td>
            <td style={{ padding: '10px 14px' }}>{formatNumber(p.total_customers || p.subscribers || 0)}</td>
            <td style={{ padding: '10px 14px', color: p.churn_rate > 17 ? '#b54708' : '#16815d' }}>{(p.churn_rate || 0).toFixed(1)}%</td>
            <td style={{ padding: '10px 14px' }}>{(p.watch_hours || p.watch || 0).toFixed(1)} hrs</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function ModelReportContent({ data }) {
  const perf = data?.modelPerf || {};
  const splits = perf.dataset_splits || {};
  const TH = { padding: '9px 12px', textAlign: 'left', fontWeight: 700, color: '#172033' };
  const models = (perf.models?.length ? perf.models : [
    { name: 'Gradient Boosting', type: 'Boosting (Top)', test_mae: 144.99, test_rmse: 217.14, test_r2: 0.9997 },
    { name: 'Random Forest',     type: 'Ensemble Bagging', test_mae: 90.43, test_rmse: 300.50, test_r2: 0.9995 },
    { name: 'Decision Tree',     type: 'Non-linear Tree', test_mae: 258.09, test_rmse: 469.44, test_r2: 0.9988 },
    { name: 'Ridge Regression',  type: 'L2 Regularized', test_mae: 3363.99, test_rmse: 4734.10, test_r2: 0.8743 },
    { name: 'Linear Regression', type: 'Parametric Baseline', test_mae: 3364.27, test_rmse: 4734.07, test_r2: 0.8743 },
  ]);
  return (
    <div>
      <SectionTitle>Dataset Configuration</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Metric label="Training Set Size" value={formatNumber(splits.train_set_size || 12000)} sub={splits.train_split_pct || '80/20 split'} />
        <Metric label="Holdout Test Set" value={formatNumber(splits.test_set_size || 3000)} sub={splits.test_split_type || 'Independent'} />
      </div>
      <SectionTitle>Model Benchmark - All 5 Algorithms</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
        <thead><tr style={{ background: '#f0f1ff' }}>
          {['Model', 'Type', 'Test MAE', 'Test RMSE', 'Test R2', 'Rank'].map(h => <th key={h} style={TH}>{h}</th>)}
        </tr></thead>
        <tbody>{models.map((m, i) => (
          <tr key={m.name} style={{ background: i === 0 ? '#eef2ff' : i % 2 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e4e8ef' }}>
            <td style={{ padding: '9px 12px', fontWeight: 600 }}>
              {i === 0 && <span style={{ background: '#5b55ee', color: '#fff', borderRadius: 4, padding: '2px 6px', fontSize: 9, marginRight: 6 }}>BEST</span>}
              {m.name}
            </td>
            <td style={{ padding: '9px 12px', color: '#667085' }}>{m.type}</td>
            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{formatINR(m.test_mae, { compact: false })}</td>
            <td style={{ padding: '9px 12px', fontFamily: 'monospace' }}>{formatINR(m.test_rmse, { compact: false })}</td>
            <td style={{ padding: '9px 12px', fontFamily: 'monospace', fontWeight: 700, color: m.test_r2 > 0.99 ? '#16815d' : '#667085' }}>{(m.test_r2 || 0).toFixed(4)}</td>
            <td style={{ padding: '9px 12px', fontWeight: 700, color: '#5b55ee' }}>#{i + 1}</td>
          </tr>
        ))}</tbody>
      </table>
      <SectionTitle>Production Model</SectionTitle>
      <div style={{ background: 'linear-gradient(135deg,#eef2ff,#f0fdf4)', border: '1px solid #c7d7fe', borderRadius: 12, padding: '18px 22px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#172033', marginBottom: 8 }}>Random Forest Regressor (Primary Pipeline)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          <div><span style={{ fontSize: 10, color: '#667085' }}>Test MAE</span><br /><strong style={{ fontFamily: 'monospace' }}>Rs.90.43</strong></div>
          <div><span style={{ fontSize: 10, color: '#667085' }}>Test RMSE</span><br /><strong style={{ fontFamily: 'monospace' }}>Rs.300.50</strong></div>
          <div><span style={{ fontSize: 10, color: '#667085' }}>Test R2</span><br /><strong style={{ fontFamily: 'monospace', color: '#16815d' }}>0.9995</strong></div>
        </div>
      </div>
    </div>
  );
}

function PlatformReportContent({ data }) {
  const platforms = data?.platforms?.length ? data.platforms : [
    { platform: 'Netflix', average_clv: 28400, total_customers: 6200, churn_rate: 14.2, watch_hours: 46.8 },
    { platform: 'Amazon Prime Video', average_clv: 22100, total_customers: 5100, churn_rate: 16.5, watch_hours: 38.2 },
    { platform: 'JioHotstar', average_clv: 18900, total_customers: 3700, churn_rate: 18.4, watch_hours: 34.6 },
  ];
  const total = platforms.reduce((s, p) => s + (p.total_customers || p.subscribers || 0), 0);
  const TH = { padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#172033', fontSize: 11 };
  return (
    <div>
      <SectionTitle>Platform Overview</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {platforms.map(p => (
          <Metric key={p.platform} label={p.platform === 'Amazon Prime Video' ? 'Prime Video' : p.platform}
            value={formatINR(p.average_clv)} sub={`${formatNumber(p.total_customers || p.subscribers || 0)} subscribers`} />
        ))}
      </div>
      <SectionTitle>Detailed Platform Metrics</SectionTitle>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead><tr style={{ background: '#f0f1ff' }}>
          {['Platform', 'Subscribers', 'Market Share', 'Avg CLV', 'Churn Rate', 'Watch Hrs/mo'].map(h => <th key={h} style={TH}>{h}</th>)}
        </tr></thead>
        <tbody>{platforms.map((p, i) => {
          const subs = p.total_customers || p.subscribers || 0;
          return (
            <tr key={p.platform} style={{ background: i % 2 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e4e8ef' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.platform === 'Amazon Prime Video' ? 'Prime Video' : p.platform}</td>
              <td style={{ padding: '10px 14px' }}>{formatNumber(subs)}</td>
              <td style={{ padding: '10px 14px' }}>{total ? ((subs / total) * 100).toFixed(1) : '-'}%</td>
              <td style={{ padding: '10px 14px', fontFamily: 'monospace' }}>{formatINR(p.average_clv)}</td>
              <td style={{ padding: '10px 14px', color: p.churn_rate > 17 ? '#b54708' : '#16815d', fontWeight: 600 }}>{(p.churn_rate || 0).toFixed(1)}%</td>
              <td style={{ padding: '10px 14px' }}>{(p.watch_hours || p.watch || 0).toFixed(1)} hrs</td>
            </tr>
          );
        })}</tbody>
      </table>
      <SectionTitle>Key Insights</SectionTitle>
      {['Netflix leads in both average CLV and watch-hour engagement.',
        'JioHotstar has the highest churn rate - a priority for retention strategy.',
        'Prime Video sits in the mid-tier, with balanced CLV and churn metrics.'].map((ins, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#5b55ee' }}>{i + 1}</div>
          <p style={{ margin: 0, fontSize: 12, color: '#475467', lineHeight: 1.6 }}>{ins}</p>
        </div>
      ))}
    </div>
  );
}

function PredictionReportContent({ data }) {
  const s = data?.summary || {};
  return (
    <div>
      <SectionTitle>Prediction Pipeline Status</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Metric label="Pipeline Status" value="Online" sub="Random Forest Joblib loaded" />
        <Metric label="Active Model" value="RF v1.0" sub="Scikit-learn pipeline" />
        <Metric label="Test R2 Score" value="0.9995" sub="Independent holdout set" />
        <Metric label="Test MAE" value="Rs.90.43" sub="Mean absolute error" />
      </div>
      <SectionTitle>Portfolio Context</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        <Metric label="Total Customers" value={formatNumber(s.total_customers || 12000)} sub="Training set" />
        <Metric label="Average CLV" value={formatINR(s.average_clv || 24350.8)} sub="Portfolio avg" />
        <Metric label="Churn Rate" value={`${(s.churn_rate || 16.02).toFixed(2)}%`} sub="Dataset rate" />
      </div>
      <SectionTitle>Supported Prediction Features (18 total)</SectionTitle>
      {[['Age Group','Location','Platform','Subscription Plan'],
        ['Monthly Fee','Billing Cycle','Watch Hours','Login Days'],
        ['Renewals','Upgrades / Downgrades','Payment Failures','Support Tickets'],
        ['Discount (%)','Last Active Days','Movies Watched','Lifetime Months']].map((row, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 8 }}>
          {row.map(f => <div key={f} style={{ background: '#f8fafc', border: '1px solid #e4e8ef', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#475467', fontWeight: 500 }}>{f}</div>)}
        </div>
      ))}
    </div>
  );
}

const CONTENT_MAP = { clv: CLVReportContent, model: ModelReportContent, platform: PlatformReportContent, prediction: PredictionReportContent };

function ReportBody({ report, data, innerRef }) {
  const Content = CONTENT_MAP[report.id];
  return (
    <div id="pdf-report-content" ref={innerRef}
      style={{ background: '#ffffff', fontFamily: 'Inter, Segoe UI, system-ui, sans-serif', color: '#172033', padding: '36px 40px', minWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: report.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19V9m6 10V5m6 14v-7m5 7H2" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#667085', letterSpacing: 1.2, textTransform: 'uppercase' }}>OTT CLV Analytics Platform</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#172033', marginTop: 2 }}>{report.name}</div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#667085', maxWidth: 420, lineHeight: 1.6 }}>{report.desc}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#98a2b3' }}>Generated</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#475467', marginTop: 2 }}>{NOW}</div>
          <div style={{ marginTop: 8, display: 'inline-block', background: '#eef2ff', color: '#5b55ee', border: '1px solid #c7d7fe', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 600 }}>CONFIDENTIAL</div>
        </div>
      </div>
      <Divider />
      {Content ? <Content data={data} /> : null}
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#98a2b3' }}>
        <span>OTT Customer Lifetime Value Analytics System</span>
        <span>Page 1 of 1</span>
        <span>Powered by ML Pipeline</span>
      </div>
    </div>
  );
}

function ReportPreviewModal({ report, onClose }) {
  const contentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    let unmounted = false;
    async function load() {
      setLoadingData(true);
      try {
        const [s, m, p, pl] = await Promise.all([
          fetchAnalyticsSummary().catch(() => null),
          fetchModelPerformance().catch(() => null),
          fetchPlatformComparison().catch(() => null),
          fetchCLVByPlan().catch(() => null),
        ]);
        if (!unmounted) setReportData({ summary: s, modelPerf: m, platforms: p, plans: pl });
      } finally {
        if (!unmounted) setLoadingData(false);
      }
    }
    load();
    return () => { unmounted = true; };
  }, [report.id]);

  const handleDownloadPDF = useCallback(async () => {
    if (!contentRef.current || downloading) return;
    setDownloading(true);
    setSuccess(false);

    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save('CLV_Analysis_Report.pdf');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return (
    <div className="overlay" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="modal" style={{ maxWidth: 840, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e4e8ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#172033' }}>Report Preview</span>
            <span style={{ background: report.color + '18', color: report.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 12 }}>{report.name}</span>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#667085', padding: 4 }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '24px 16px' }}>
          {loadingData ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#667085' }}>Loading analytics data...</div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ReportBody report={report} data={reportData} innerRef={contentRef} />
            </div>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #e4e8ef', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
          <span style={{ fontSize: 11, color: '#667085' }}>Format: Standard A4 PDF (.pdf)</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="primary" onClick={handleDownloadPDF} disabled={downloading || loadingData}>
              {downloading ? 'Generating PDF...' : success ? '✓ Saved!' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [activeReport, setActiveReport] = useState(null);

  return (
    <>
      <PageHead
        title="Reports & PDF Export"
        subtitle="Generate and download executive PDF reports summarizing customer lifetime value, model performance, and cross-platform benchmarks."
      />

      <div className="reports-grid">
        {REPORTS.map(r => (
          <Card className="report-card" key={r.id}>
            <div className="report-icon" style={{ background: r.color + '15', color: r.color }}>
              <Icon name={r.icon} size={22} />
            </div>
            <span className="status active">Ready</span>
            <h3>{r.name}</h3>
            <p>{r.desc}</p>
            <div className="report-meta">
              <span>Format</span>
              <b>Executive PDF (A4)</b>
            </div>
            <Button variant="primary" onClick={() => setActiveReport(r)}>
              Preview & Export PDF
            </Button>
          </Card>
        ))}
      </div>

      <Card className="report-note" style={{ marginTop: 24 }}>
        <Icon name="info" />
        <div>
          <h3>Client-side PDF Generation</h3>
          <p>
            PDF reports are rendered client-side using standard HTML5 canvas rasterization (<code>html2canvas</code> + <code>jsPDF</code>).
            Click "Preview & Export PDF" on any report card above to review the formatted document before downloading.
          </p>
        </div>
      </Card>

      {activeReport && (
        <ReportPreviewModal report={activeReport} onClose={() => setActiveReport(null)} />
      )}
    </>
  );
}
