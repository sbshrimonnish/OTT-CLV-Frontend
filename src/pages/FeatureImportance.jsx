import { useState, useEffect } from "react";
import { PageHead, Icon } from "../components/UIComponents";
import { ChartCard } from "../components/ChartCard";
import { FeatureImportanceBarChart } from "../components/AnalyticsCharts";
import { fetchFeatureImportance } from "../services/api";

export default function FeatureImportance() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureImportance()
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setFeatures(data.map((f) => ({ name: f.feature || f.name, score: f.importance ? Math.round(f.importance * 100) : f.score })));
        }
      })
      .catch((err) => {
        console.warn("Backend feature importance API notice:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHead
        title="ML Feature Importance"
        subtitle="Relative contribution of customer attributes to lifetime value prediction."
      />

      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <ChartCard
          title="Feature Contribution Scores (0–100)"
          subtitle="Extracted from Random Forest pipeline feature importance weights"
          badge={
            loading ? (
              <span className="status neutral">
                <Icon name="refresh" size={14} /> Loading...
              </span>
            ) : features.length ? (
              <span className="status green">
                <Icon name="check" size={14} /> Live Model Data
              </span>
            ) : (
              <span className="status amber">
                <Icon name="info" size={14} /> Default Weights
              </span>
            )
          }
          style={{ height: 480 }}
        >
          <FeatureImportanceBarChart data={features.length ? features : undefined} />
        </ChartCard>
      </div>
    </>
  );
}
