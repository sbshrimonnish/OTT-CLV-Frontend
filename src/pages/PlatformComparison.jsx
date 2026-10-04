import { useState, useEffect } from "react";
import { PageHead, Card } from "../components/UIComponents";
import { ChartCard } from "../components/ChartCard";
import { DashboardGrid } from "../components/DashboardGrid";
import { PlatformComparisonChart } from "../components/AnalyticsCharts";
import { fetchPlatformComparison } from "../services/api";
import { formatINR, formatNumber } from "../utils/formatters";

const defaultPlatformLayouts = {
  lg: [
    { i: "clv_chart", x: 0, y: 0, w: 6, h: 3.5 },
    { i: "cust_chart", x: 6, y: 0, w: 6, h: 3.5 },
    { i: "churn_chart", x: 0, y: 3.5, w: 12, h: 3.2 },
  ],
  md: [
    { i: "clv_chart", x: 0, y: 0, w: 5, h: 3.5 },
    { i: "cust_chart", x: 5, y: 0, w: 5, h: 3.5 },
    { i: "churn_chart", x: 0, y: 3.5, w: 10, h: 3.2 },
  ],
  sm: [
    { i: "clv_chart", x: 0, y: 0, w: 6, h: 3.5 },
    { i: "cust_chart", x: 0, y: 3.5, w: 6, h: 3.5 },
    { i: "churn_chart", x: 0, y: 7, w: 6, h: 3.2 },
  ],
};

export default function PlatformComparison() {
  const [platformData, setPlatformData] = useState([]);

  useEffect(() => {
    fetchPlatformComparison()
      .then((data) => {
        if (data && data.length) setPlatformData(data);
      })
      .catch(() => {});
  }, []);

  const formattedCLV = platformData.length
    ? platformData.map(p => ({ platform: p.platform === "Amazon Prime Video" ? "Prime Video" : p.platform, clv: Math.round(p.average_clv) }))
    : [
        { platform: "Netflix", clv: 28400 },
        { platform: "Prime Video", clv: 22100 },
        { platform: "JioHotstar", clv: 18900 },
      ];

  const formattedCustomers = platformData.length
    ? platformData.map(p => ({ platform: p.platform === "Amazon Prime Video" ? "Prime Video" : p.platform, customers: p.subscribers ?? p.total_customers ?? 0 }))
    : [
        { platform: "Netflix", customers: 6200 },
        { platform: "Prime Video", customers: 5100 },
        { platform: "JioHotstar", customers: 3700 },
      ];

  const formattedChurn = platformData.length
    ? platformData.map(p => ({ platform: p.platform === "Amazon Prime Video" ? "Prime Video" : p.platform, churn: p.churn_rate }))
    : [
        { platform: "Netflix", churn: 9.8 },
        { platform: "Prime Video", churn: 13.5 },
        { platform: "JioHotstar", churn: 16.2 },
      ];

  return (
    <>
      <PageHead
        title="Streaming Platform Comparison"
        subtitle="Benchmark metrics across Netflix, Amazon Prime Video, and JioHotstar."
      />

      <div className="platform-cards">
        <Card className="platform-card">
          <div className="platform-logo">N</div>
          <div>
            <span>Netflix</span>
            <h3>{platformData[0] ? formatINR(platformData[0].average_clv) : "₹28,400"}</h3>
          </div>
          <strong>{platformData[0] ? formatNumber(platformData[0].total_customers) : "6,200"} users</strong>
        </Card>

        <Card className="platform-card">
          <div className="platform-logo p1">P</div>
          <div>
            <span>Prime Video</span>
            <h3>{platformData[1] ? formatINR(platformData[1].average_clv) : "₹22,100"}</h3>
          </div>
          <strong>{platformData[1] ? formatNumber(platformData[1].total_customers) : "5,100"} users</strong>
        </Card>

        <Card className="platform-card">
          <div className="platform-logo p2">J</div>
          <div>
            <span>JioHotstar</span>
            <h3>{platformData[2] ? formatINR(platformData[2].average_clv) : "₹18,900"}</h3>
          </div>
          <strong>{platformData[2] ? formatNumber(platformData[2].total_customers) : "3,700"} users</strong>
        </Card>
      </div>

      <DashboardGrid storageKey="ott-clv-platform-layout" defaultLayouts={defaultPlatformLayouts}>
        <div key="clv_chart">
          <ChartCard
            title="Average CLV by Platform"
            subtitle="INR lifetime revenue contribution per user"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={formattedCLV} dataKey="clv" name="Average CLV" />
          </ChartCard>
        </div>

        <div key="cust_chart">
          <ChartCard
            title="Subscribers by Platform"
            subtitle="Active portfolio subscriber count"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={formattedCustomers} dataKey="customers" name="Subscribers" />
          </ChartCard>
        </div>

        <div key="churn_chart">
          <ChartCard
            title="Platform Churn Rate (%)"
            subtitle="Customer attrition percentage"
            style={{ height: "100%" }}
          >
            <PlatformComparisonChart data={formattedChurn} dataKey="churn" name="Churn Rate (%)" />
          </ChartCard>
        </div>
      </DashboardGrid>
    </>
  );
}
