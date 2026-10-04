import { useState, useEffect } from "react";
import { Kpi, Button, Icon, Card } from "../components/UIComponents";
import { ChartCard } from "../components/ChartCard";
import { DashboardGrid } from "../components/DashboardGrid";
import {
  CLVTrendChart,
  MRRBarChart,
  MRRScatterChart,
  CLVDistributionHorizontal,
  CustomerValueSegmentsDonut,
} from "../components/AnalyticsCharts";
import { useNavigate } from "react-router-dom";
import {
  fetchHealth,
  fetchModelPerformance,
  fetchAnalyticsSummary,
  fetchCLVDistribution,
} from "../services/api";
import { formatINR, formatNumber } from "../utils/formatters";

const defaultDashboardLayouts = {
  lg: [
    { i: "trend", x: 0, y: 0, w: 7, h: 3, minW: 4, minH: 2 },
    { i: "mrr", x: 7, y: 0, w: 5, h: 3, minW: 3, minH: 2 },
    { i: "donut", x: 0, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
    { i: "scatter", x: 4, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
    { i: "dist", x: 8, y: 3, w: 4, h: 3, minW: 3, minH: 2 },
    { i: "model", x: 0, y: 6, w: 12, h: 2, minW: 6, minH: 2 },
  ],
  md: [
    { i: "trend", x: 0, y: 0, w: 6, h: 3 },
    { i: "mrr", x: 6, y: 0, w: 4, h: 3 },
    { i: "donut", x: 0, y: 3, w: 5, h: 3 },
    { i: "scatter", x: 5, y: 3, w: 5, h: 3 },
    { i: "dist", x: 0, y: 6, w: 10, h: 3 },
    { i: "model", x: 0, y: 9, w: 10, h: 2 },
  ],
  sm: [
    { i: "trend", x: 0, y: 0, w: 6, h: 3 },
    { i: "mrr", x: 0, y: 3, w: 6, h: 3 },
    { i: "donut", x: 0, y: 6, w: 6, h: 3 },
    { i: "scatter", x: 0, y: 9, w: 6, h: 3 },
    { i: "dist", x: 0, y: 12, w: 6, h: 3 },
    { i: "model", x: 0, y: 15, w: 6, h: 2 },
  ],
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [modelPerf, setModelPerf] = useState(null);
  const [summary, setSummary] = useState(null);
  const [distData, setDistData] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchHealth().catch(() => null),
      fetchModelPerformance().catch(() => null),
      fetchAnalyticsSummary().catch(() => null),
      fetchCLVDistribution().catch(() => []),
    ])
      .then(([h, p, s, dist]) => {
        if (h && h.status === "ok") setConnected(true);
        if (p) setModelPerf(p);
        if (s) setSummary(s);
        if (dist && dist.length) {
          setDistData(dist.map(d => ({ range: d.range, count: d.count })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const rfModel = modelPerf?.models?.find(
    (m) => m.model_name === "Random Forest Regressor"
  );

  return (
    <>
      <div className="welcome-row">
        <div>
          <h1>Customer value overview</h1>
          <p>Monitor CLV performance across your OTT streaming subscriber portfolio.</p>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {connected ? (
            <span className="status green">
              <Icon name="check" size={14} /> FastAPI Connected
            </span>
          ) : (
            <span className="status amber">
              <Icon name="info" size={14} /> Backend Offline
            </span>
          )}
          <Button onClick={() => navigate("/predict")} icon="spark">
            Predict customer CLV
          </Button>
        </div>
      </div>

      <div className="kpi-grid six">
        <Kpi
          label="Total Customers"
          value={summary ? formatNumber(summary.total_customers) : (loading ? "..." : "12,000")}
          meta="Training portfolio"
          icon="user"
          tone="blue"
        />
        <Kpi
          label="Average CLV"
          value={summary ? formatINR(summary.average_clv) : (loading ? "..." : "₹15,929")}
          meta="Portfolio average"
          icon="spark"
          tone="indigo"
        />
        <Kpi
          label="Total CLV Revenue"
          value={summary ? formatINR(summary.total_revenue) : (loading ? "..." : "₹19.11Cr")}
          meta="Total cumulative"
          icon="chart"
          tone="teal"
        />
        <Kpi label="Average Lifetime" value="24.8 mo" meta="Subscribers" icon="clock" tone="violet" />
        <Kpi
          label="Churn Rate"
          value={summary ? `${summary.churn_rate}%` : (loading ? "..." : "16.02%")}
          meta="Dataset rate"
          icon="refresh"
          tone="amber"
        />
        <Kpi
          label="Model R² Score"
          value={rfModel ? rfModel.r2_score.toFixed(4) : (loading ? "..." : "0.9995")}
          meta="Random Forest Test R²"
          icon="gauge"
          tone="green"
        />
      </div>

      <DashboardGrid storageKey="ott-clv-dashboard-layout-v3" defaultLayouts={defaultDashboardLayouts}>
        {/* ROW 1 LEFT: CLV Trend Over Time */}
        <div key="trend">
          <ChartCard
            title="CLV Trend Over Time"
            subtitle="Total portfolio CLV — trailing 12 months"
            badge={<span className="pill-badge purple">+18.4% YoY</span>}
            style={{ height: "100%" }}
          >
            <CLVTrendChart />
          </ChartCard>
        </div>

        {/* ROW 1 RIGHT: Monthly Recurring Revenue */}
        <div key="mrr">
          <ChartCard
            title="Monthly Recurring Revenue"
            subtitle="Actual MRR — 12 months"
            badge={<span className="pill-badge green">+8.7%</span>}
            style={{ height: "100%" }}
          >
            <MRRBarChart />
          </ChartCard>
        </div>

        {/* ROW 2 LEFT: CLV by Segment */}
        <div key="donut">
          <ChartCard
            title="CLV by Segment"
            subtitle="Revenue contribution %"
            style={{ height: "100%" }}
          >
            <CustomerValueSegmentsDonut />
          </ChartCard>
        </div>

        {/* ROW 2 MIDDLE: MRR vs Predicted CLV */}
        <div key="scatter">
          <ChartCard
            title="MRR vs Predicted CLV"
            subtitle="Current revenue → future value (₹L)"
            style={{ height: "100%" }}
          >
            <MRRScatterChart />
          </ChartCard>
        </div>

        {/* ROW 2 RIGHT: CLV Distribution */}
        <div key="dist">
          <ChartCard
            title="CLV Distribution"
            subtitle={`Customers by CLV band (${distData.length ? "Live Data" : "Standard"})`}
            style={{ height: "100%" }}
          >
            <CLVDistributionHorizontal data={distData.length ? distData : undefined} />
          </ChartCard>
        </div>

        {/* ROW 3: Primary Model Pipeline Card */}
        <div key="model">
          <Card className="model-card" style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="card-head">
              <div>
                <span className="eyebrow">PRIMARY MODEL PIPELINE</span>
                <h3>Random Forest Regressor</h3>
              </div>
              {connected ? (
                <span className="status green">Connected to FastAPI</span>
              ) : (
                <span className="status amber">Offline</span>
              )}
            </div>
            <div className="model-metrics">
              <div>
                <span>Test MAE <i title="Mean Absolute Error">i</i></span>
                <strong>{formatINR(90.43)}</strong>
              </div>
              <div>
                <span>Test RMSE <i title="Root Mean Square Error">i</i></span>
                <strong>{formatINR(300.5)}</strong>
              </div>
              <div>
                <span>Test R² <i title="Coefficient of determination">i</i></span>
                <strong>{rfModel ? rfModel.r2_score.toFixed(4) : "0.9995"}</strong>
              </div>
            </div>
            <div className="notice" style={{ margin: "8px 0" }}>
              <Icon name="info" size={17} />
              <p>Official 3,000-row test dataset metrics. Powered by FastAPI + Scikit-Learn joblib pipeline.</p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/model-performance")}>
              View model performance <Icon name="arrow" size={15} />
            </Button>
          </Card>
        </div>
      </DashboardGrid>
    </>
  );
}
