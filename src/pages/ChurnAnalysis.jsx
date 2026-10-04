import { useState, useEffect } from "react";
import { PageHead, Kpi } from "../components/UIComponents";
import { ChartCard } from "../components/ChartCard";
import { DashboardGrid } from "../components/DashboardGrid";
import { PlatformComparisonChart, MRRScatterChart } from "../components/AnalyticsCharts";
import { fetchPlatformComparison, fetchAnalyticsSummary } from "../services/api";
import { formatNumber } from "../utils/formatters";

const defaultChurnLayouts = {
  lg: [
    { i: "churn_plan", x: 0, y: 0, w: 6, h: 3.5 },
    { i: "churn_platform", x: 6, y: 0, w: 6, h: 3.5 },
    { i: "churn_watch", x: 0, y: 3.5, w: 12, h: 3.2 },
  ],
  md: [
    { i: "churn_plan", x: 0, y: 0, w: 5, h: 3.5 },
    { i: "churn_platform", x: 5, y: 0, w: 5, h: 3.5 },
    { i: "churn_watch", x: 0, y: 3.5, w: 10, h: 3.2 },
  ],
  sm: [
    { i: "churn_plan", x: 0, y: 0, w: 6, h: 3.5 },
    { i: "churn_platform", x: 0, y: 3.5, w: 6, h: 3.5 },
    { i: "churn_watch", x: 0, y: 7, w: 6, h: 3.2 },
  ],
};

export default function ChurnAnalysis() {
  const [summary, setSummary] = useState(null);
  const [platformData, setPlatformData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchAnalyticsSummary().catch(() => null),
      fetchPlatformComparison().catch(() => []),
    ]).then(([s, plat]) => {
      if (s) setSummary(s);
      if (plat && plat.length) setPlatformData(plat);
    });
  }, []);

  const churnByPlanData = [
    { platform: "Basic", churn: 18.4 },
    { platform: "Standard", churn: 11.2 },
    { platform: "Premium", churn: 7.6 },
  ];

  const churnByPlatformData = platformData.length
    ? platformData.map((p) => ({
        platform: p.platform === "Amazon Prime Video" ? "Prime Video" : p.platform,
        churn: p.churn_rate,
      }))
    : [
        { platform: "Netflix", churn: 9.8 },
        { platform: "Prime Video", churn: 13.5 },
        { platform: "JioHotstar", churn: 16.2 },
      ];

  return (
    <>
      <PageHead
        title="Subscriber Churn Risk Analysis"
        subtitle="Analyze attrition rates across subscription plans, platforms, and activity levels."
      />

      <div className="kpi-grid six" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <Kpi
          label="Overall Churn Rate"
          value={summary ? `${summary.churn_rate}%` : "16.02%"}
          meta="Dataset average"
          icon="refresh"
          tone="amber"
        />
        <Kpi
          label="Active Subscribers"
          value={summary ? formatNumber(summary.active_customers) : "10,078"}
          meta="Retained user portfolio"
          icon="user"
          tone="teal"
        />
        <Kpi
          label="Churn Risk Threshold"
          value="30 Days"
          meta="Inactivity boundary"
          icon="clock"
          tone="blue"
        />
      </div>

      <DashboardGrid storageKey="ott-clv-churn-layout" defaultLayouts={defaultChurnLayouts}>
        <div key="churn_plan">
          <ChartCard
            title="Churn Rate by Subscription Plan (%)"
            subtitle="Tier attrition vulnerability"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={churnByPlanData} dataKey="churn" name="Churn Rate (%)" />
          </ChartCard>
        </div>

        <div key="churn_platform">
          <ChartCard
            title="Churn Rate by Platform (%)"
            subtitle="Streaming provider risk comparison"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={churnByPlatformData} dataKey="churn" name="Churn Rate (%)" />
          </ChartCard>
        </div>

        <div key="churn_watch">
          <ChartCard
            title="Churn Probability vs Monthly Watch Hours"
            subtitle="Engagement activity impact on retention"
            style={{ height: "100%" }}
          >
            <MRRScatterChart />
          </ChartCard>
        </div>
      </DashboardGrid>
    </>
  );
}
