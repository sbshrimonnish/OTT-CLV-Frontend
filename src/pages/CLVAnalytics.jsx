import { useState, useEffect } from "react";
import { PageHead, Icon, Field, FormSelect } from "../components/UIComponents";
import { ChartCard } from "../components/ChartCard";
import { DashboardGrid } from "../components/DashboardGrid";
import {
  CLVDistributionHorizontal,
  PlatformComparisonChart,
  WatchHoursScatterChart,
  LoginDaysScatterChart,
} from "../components/AnalyticsCharts";
import {
  fetchCLVDistribution,
  fetchCLVByPlan,
  fetchPlatformComparison,
} from "../services/api";
import { API_BASE } from "../services/api";

const defaultAnalyticsLayouts = {
  lg: [
    { i: "dist", x: 0, y: 0, w: 6, h: 3.5 },
    { i: "plan", x: 6, y: 0, w: 6, h: 3.5 },
    { i: "platform", x: 0, y: 3.5, w: 4, h: 3.2 },
    { i: "watch", x: 4, y: 3.5, w: 4, h: 3.2 },
    { i: "login", x: 8, y: 3.5, w: 4, h: 3.2 },
  ],
  md: [
    { i: "dist", x: 0, y: 0, w: 5, h: 3.5 },
    { i: "plan", x: 5, y: 0, w: 5, h: 3.5 },
    { i: "platform", x: 0, y: 3.5, w: 5, h: 3.2 },
    { i: "watch", x: 5, y: 3.5, w: 5, h: 3.2 },
    { i: "login", x: 0, y: 6.7, w: 10, h: 3.2 },
  ],
  sm: [
    { i: "dist", x: 0, y: 0, w: 6, h: 3.5 },
    { i: "plan", x: 0, y: 3.5, w: 6, h: 3.5 },
    { i: "platform", x: 0, y: 7, w: 6, h: 3.2 },
    { i: "watch", x: 0, y: 10.2, w: 6, h: 3.2 },
    { i: "login", x: 0, y: 13.4, w: 6, h: 3.2 },
  ],
};

export default function CLVAnalytics() {
  const [platformFilter, setPlatformFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [distData, setDistData] = useState([]);
  const [planData, setPlanData] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [watchScatterData, setWatchScatterData] = useState([]);
  const [loginScatterData, setLoginScatterData] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchCLVDistribution().catch(() => []),
      fetchCLVByPlan().catch(() => []),
      fetchPlatformComparison().catch(() => []),
      fetch(`${API_BASE}/api/analytics/watch-hours-scatter`).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/api/analytics/login-days-scatter`).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([dist, plan, plat, watchScatter, loginScatter]) => {
      if (dist && dist.length) setDistData(dist);
      if (plan && plan.length) setPlanData(plan);
      if (plat && plat.length) setPlatformData(plat);
      if (watchScatter && watchScatter.length) setWatchScatterData(watchScatter);
      if (loginScatter && loginScatter.length) setLoginScatterData(loginScatter);
    });
  }, []);

  const formattedPlanData = planData.length
    ? planData.map(p => ({ platform: p.plan, clv: Math.round(p.average_clv) }))
    : [
        { platform: "Basic", clv: 14200 },
        { platform: "Standard", clv: 22800 },
        { platform: "Premium", clv: 34500 },
      ];

  const formattedPlatformData = platformData.length
    ? platformData.map(p => ({ platform: p.platform === "Amazon Prime Video" ? "Prime Video" : p.platform, clv: Math.round(p.average_clv) }))
    : [
        { platform: "Netflix", clv: 28400 },
        { platform: "Prime Video", clv: 22100 },
        { platform: "JioHotstar", clv: 18900 },
      ];

  return (
    <>
      <PageHead
        title="CLV Deep-Dive Analytics"
        subtitle="Explore lifetime value segmentation, subscription tier distribution, and engagement drivers."
      />

      <div className="card filters">
        <div className="filter-title">
          <Icon name="filter" size={18} />
          <div>
            <strong>Analytics Filters</strong>
            <span>Segment portfolio data</span>
          </div>
        </div>
        <Field label="Platform">
          <FormSelect value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="All">All Platforms</option>
            <option value="Netflix">Netflix</option>
            <option value="Amazon Prime Video">Prime Video</option>
            <option value="JioHotstar">JioHotstar</option>
          </FormSelect>
        </Field>
        <Field label="Subscription Plan">
          <FormSelect value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </FormSelect>
        </Field>
      </div>

      <DashboardGrid storageKey="ott-clv-analytics-layout" defaultLayouts={defaultAnalyticsLayouts}>
        <div key="dist">
          <ChartCard
            title="CLV Distribution Bands"
            subtitle="Customer volume categorized by lifetime value band"
            style={{ height: "100%" }}
          >
            <CLVDistributionHorizontal data={distData.length ? distData : undefined} />
          </ChartCard>
        </div>

        <div key="plan">
          <ChartCard
            title="Average CLV by Subscription Plan"
            subtitle="Tier comparison (INR per customer)"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={formattedPlanData} dataKey="clv" name="Average CLV" />
          </ChartCard>
        </div>

        <div key="platform">
          <ChartCard
            title="CLV by Streaming Platform"
            subtitle="Average revenue contribution per user"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={formattedPlatformData} dataKey="clv" name="Average CLV" />
          </ChartCard>
        </div>

        <div key="watch">
          <ChartCard
            title="CLV vs Watch Hours"
            subtitle="Engagement hours → customer lifetime value correlation"
            style={{ height: "100%" }}
          >
            <WatchHoursScatterChart data={watchScatterData.length ? watchScatterData : undefined} />
          </ChartCard>
        </div>

        <div key="login">
          <ChartCard
            title="CLV vs Active Login Days"
            subtitle="Login frequency → lifetime value correlation"
            style={{ height: "100%" }}
          >
            <LoginDaysScatterChart data={loginScatterData.length ? loginScatterData : undefined} />
          </ChartCard>
        </div>
      </DashboardGrid>
    </>
  );
}
