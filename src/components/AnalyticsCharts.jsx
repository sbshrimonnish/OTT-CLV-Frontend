import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { formatINR, formatNumber } from "../utils/formatters";

// Common Recharts Theme Colors
const COLORS = {
  primary: "#5b55ee",
  secondary: "#8b5cf6",
  teal: "#0e9384",
  amber: "#b54708",
  green: "#16815d",
  grid: "#e4e8ef",
  text: "#667085",
  palette: ["#4f46e5", "#4338ca", "#3b82f6", "#60a5fa", "#38bdf8", "#2dd4bf", "#5eead4", "#99f6e4"],
};

/**
 * Custom Tooltip Container
 */
function CustomTooltip({ active, payload, label, formatter, titlePrefix = "" }) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e4e8ef",
          borderRadius: 10,
          padding: "10px 14px",
          boxShadow: "0 8px 24px rgba(16, 24, 40, 0.12)",
          fontSize: 12,
          color: "#172033",
        }}
      >
        <b style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 700 }}>
          {titlePrefix}{label}
        </b>
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              marginTop: 4,
              color: "#667085",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: entry.color || entry.fill || COLORS.primary,
                }}
              />
              {entry.name}:
            </span>
            <strong style={{ color: entry.color || COLORS.primary, fontWeight: 700 }}>
              {formatter ? formatter(entry.value, entry) : entry.value}
            </strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Tailwind CSS Dark/Slate Themed Custom Tooltip for Scatter Charts
 */
export function ScatterCustomTooltip({ active, payload, xLabel = "Actual CLV", yLabel = "Predicted CLV" }) {
  if (active && payload && payload.length) {
    const item = payload[0]?.payload || {};
    
    const actualVal = item.actual ?? item.actual_clv ?? item.mrr ?? item.watch_hours ?? item.login_days ?? payload[0]?.value;
    const predictedVal = item.predicted ?? item.predicted_clv ?? item.clv ?? payload[1]?.value;
    const titleName = item.name || item.customer_id || item.platform || "Customer Point";

    const isHours = xLabel.toLowerCase().includes("hour");
    const isDays = xLabel.toLowerCase().includes("day");
    const diff = (typeof actualVal === "number" && typeof predictedVal === "number" && !isHours && !isDays) 
      ? predictedVal - actualVal 
      : null;

    return (
      <div 
        className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-slate-100 text-xs min-w-[220px] z-50 pointer-events-none transition-all duration-150"
        style={{ pointerEvents: "none" }}
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
          <span className="font-semibold text-slate-200 text-sm tracking-wide">{titleName}</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Scatter Data
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm" />
              <span>{xLabel}:</span>
            </div>
            <strong className="font-mono font-bold text-emerald-400">
              {typeof actualVal === "number" 
                ? (isHours ? `${actualVal} hrs` : isDays ? `${actualVal} days` : formatINR(actualVal, { compact: false }))
                : actualVal}
            </strong>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block shadow-sm" />
              <span>{yLabel}:</span>
            </div>
            <strong className="font-mono font-bold text-indigo-400">
              {typeof predictedVal === "number" ? formatINR(predictedVal, { compact: false }) : predictedVal}
            </strong>
          </div>

          {diff !== null && (
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-800 text-[11px]">
              <span className="text-slate-400">Variance / Difference:</span>
              <strong className={`font-mono font-semibold ${diff >= 0 ? "text-slate-300" : "text-amber-400"}`}>
                {diff > 0 ? `+${formatINR(diff, { compact: true })}` : formatINR(diff, { compact: true })}
              </strong>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * 1. CLV Trend Line / Area Chart (Image 1 style)
 */
export function CLVTrendChart({ data }) {
  const defaultData = [
    { month: "Apr '24", clv: 42000000 },
    { month: "May '24", clv: 45000000 },
    { month: "Jun '24", clv: 47000000 },
    { month: "Jul '24", clv: 50000000 },
    { month: "Aug '24", clv: 52000000 },
    { month: "Sep '24", clv: 53500000 },
    { month: "Oct '24", clv: 57000000 },
    { month: "Nov '24", clv: 60000000 },
    { month: "Dec '24", clv: 63000000 },
    { month: "Jan '25", clv: 66000000 },
    { month: "Feb '25", clv: 69000000 },
    { month: "Mar '25", clv: 72000000 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 20, right: 25, left: 10, bottom: 25 }}>
        <defs>
          <linearGradient id="clvTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.18} />
            <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: COLORS.text, fontSize: 11 }} dy={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickFormatter={(val) => formatINR(val, { compact: true })}
          dx={-5}
        />
        <Tooltip content={<CustomTooltip formatter={(val) => formatINR(val, { compact: true })} />} />
        <Area
          type="monotone"
          dataKey="clv"
          name="Predicted CLV"
          stroke={COLORS.primary}
          strokeWidth={3}
          fill="url(#clvTrendGrad)"
          dot={{ r: 4, fill: COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: COLORS.primary, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * 2. MRR Bar Chart (Image 2 style)
 */
export function MRRBarChart({ data }) {
  const defaultData = [
    { month: "Apr", mrr: 1800000 },
    { month: "May", mrr: 1900000 },
    { month: "Jun", mrr: 2000000 },
    { month: "Jul", mrr: 2100000 },
    { month: "Aug", mrr: 2150000 },
    { month: "Sep", mrr: 2200000 },
    { month: "Oct", mrr: 2300000 },
    { month: "Nov", mrr: 2400000 },
    { month: "Dec", mrr: 2500000 },
    { month: "Jan", mrr: 2600000 },
    { month: "Feb", mrr: 2700000 },
    { month: "Mar", mrr: 2800000 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 25, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: COLORS.text, fontSize: 11 }} dy={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickFormatter={(val) => formatINR(val, { compact: true })}
          dx={-5}
        />
        <Tooltip content={<CustomTooltip formatter={(val) => formatINR(val, { compact: true })} />} />
        <Bar dataKey="mrr" name="MRR" fill={COLORS.secondary} radius={[6, 6, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * 3. MRR vs Predicted CLV Scatter Chart (Image 3 Left style)
 */
export function MRRScatterChart({ data }) {
  const defaultData = [
    { name: "Apex", mrr: 421000, clv: 1120000, actual: 421000, predicted: 1120000 },
    { name: "Stellar", mrr: 189000, clv: 562000, actual: 189000, predicted: 562000 },
    { name: "Prime", mrr: 198000, clv: 910000, actual: 198000, predicted: 910000 },
    { name: "Core", mrr: 98000, clv: 800000, actual: 98000, predicted: 800000 },
    { name: "Pulse", mrr: 43000, clv: 640000, actual: 43000, predicted: 640000 },
    { name: "Basic", mrr: 28000, clv: 150000, actual: 28000, predicted: 150000 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <div style={{ width: "100%", height: "100%", pointerEvents: "auto", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 25, left: 10, bottom: 25 }} style={{ pointerEvents: "auto" }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            type="number"
            dataKey="mrr"
            name="MRR"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickFormatter={(val) => formatINR(val, { compact: true })}
            dy={10}
          />
          <YAxis
            type="number"
            dataKey="clv"
            name="Predicted CLV"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickFormatter={(val) => formatINR(val, { compact: true })}
            dx={-5}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8", strokeWidth: 1 }}
            content={<ScatterCustomTooltip xLabel="Monthly Revenue" yLabel="Predicted CLV" />}
            wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
            isAnimationActive={false}
          />
          <Scatter
            data={chartData}
            fill={COLORS.primary}
            stroke="#ffffff"
            strokeWidth={2}
            cursor="pointer"
            dot={{ r: 7, fill: COLORS.primary, stroke: "#ffffff", strokeWidth: 2, cursor: "pointer" }}
            activeShape={{ r: 10, fill: COLORS.secondary, stroke: "#ffffff", strokeWidth: 3 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}


/**
 * 4. Horizontal CLV Distribution Bar Chart (Image 3 Right style)
 */
export function CLVDistributionHorizontal({ data }) {
  const defaultData = [
    { range: "₹0–5L", count: 310 },
    { range: "₹5–15L", count: 480 },
    { range: "₹15–30L", count: 390 },
    { range: "₹30–60L", count: 290 },
    { range: "₹60L–1Cr", count: 230 },
    { range: "₹1–3Cr", count: 180 },
    { range: "₹3–6Cr", count: 100 },
    { range: "₹6Cr+", count: 90 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={chartData} margin={{ top: 15, right: 25, left: 25, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
        <XAxis
          type="number"
          ticks={[0, 150, 300, 450]}
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          dy={10}
        />
        <YAxis
          type="category"
          dataKey="range"
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          width={75}
        />
        <Tooltip content={<CustomTooltip formatter={(val) => `${formatNumber(val)} customers`} />} />
        <Bar dataKey="count" name="Customers" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS.palette[index % COLORS.palette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * 5. Centered Donut Chart for Customer Segments
 */
export function CustomerValueSegmentsDonut({ data }) {
  const defaultData = [
    { name: "High Value", value: 7230, share: "48.2%" },
    { name: "Medium Value", value: 4120, share: "27.4%" },
    { name: "Low Value", value: 2100, share: "14.0%" },
    { name: "At Risk", value: 1100, share: "7.3%" },
    { name: "Churned", value: 450, share: "3.1%" },
  ];

  const chartData = data && data.length ? data : defaultData;
  const pieColors = ["#5b55ee", "#3b82f6", "#0e9384", "#f97316", "#e11d48"];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
        <Pie
          data={chartData}
          cx="50%"
          cy="42%"
          innerRadius={52}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={(val) => `${formatNumber(val)} customers`} />} />
        <Legend
          verticalAlign="bottom"
          height={40}
          iconType="circle"
          formatter={(value, entry) => {
            const item = chartData.find(d => d.name === value);
            return (
              <span style={{ color: "#475467", fontSize: 12, fontWeight: 500, marginRight: 12 }}>
                {value} <b style={{ color: "#172033", marginLeft: 8 }}>{item?.share || ""}</b>
              </span>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * 6. Platform Comparison Bar Chart
 */
export function PlatformComparisonChart({ data, dataKey = "clv", name = "Average CLV" }) {
  const defaultData = [
    { platform: "Netflix", clv: 28400, customers: 6200, churn: 9.8 },
    { platform: "Prime Video", clv: 22100, customers: 5100, churn: 13.5 },
    { platform: "JioHotstar", clv: 18900, customers: 3700, churn: 16.2 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 25, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="platform" tickLine={false} axisLine={false} tick={{ fill: COLORS.text, fontSize: 11 }} dy={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickFormatter={(val) => (dataKey === "clv" ? formatINR(val, { compact: true }) : formatNumber(val))}
          dx={-5}
        />
        <Tooltip
          content={
            <CustomTooltip
              formatter={(val) => (dataKey === "clv" ? formatINR(val) : formatNumber(val))}
            />
          }
        />
        <Bar dataKey={dataKey} name={name} fill={COLORS.primary} radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * 7. Feature Importance Horizontal Bar Chart
 */
export function FeatureImportanceBarChart({ data }) {
  const defaultData = [
    { name: "Subscription Plan Level", score: 94 },
    { name: "Monthly Watch Hours", score: 88 },
    { name: "Account Age (Months)", score: 81 },
    { name: "Active Login Days", score: 72 },
    { name: "Concurrent Streams", score: 65 },
    { name: "Payment Method Type", score: 54 },
    { name: "Content Diversity", score: 48 },
    { name: "Support Tickets", score: 36 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={chartData} margin={{ top: 15, right: 30, left: 120, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={COLORS.grid} />
        <XAxis type="number" domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: COLORS.text, fontSize: 11 }} dy={10} />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          width={115}
        />
        <Tooltip content={<CustomTooltip formatter={(val) => `${val} / 100`} />} />
        <Bar dataKey="score" name="Relative Score" fill={COLORS.primary} radius={[0, 6, 6, 0]} maxBarSize={22}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index < 3 ? COLORS.primary : COLORS.secondary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * 8. Customer Value Forecast Line Chart
 */
export function CustomerForecastLineChart({ data }) {
  const defaultData = [
    { period: "Current", value: 18400, forecast: 18400 },
    { period: "3M", value: null, forecast: 21200 },
    { period: "6M", value: null, forecast: 24500 },
    { period: "12M", value: null, forecast: 28900 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 25, left: 15, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fill: COLORS.text, fontSize: 11 }} dy={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: COLORS.text, fontSize: 11 }}
          tickFormatter={(val) => formatINR(val, { compact: true })}
          dx={-5}
        />
        <Tooltip content={<CustomTooltip formatter={(val) => formatINR(val)} />} />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecasted CLV"
          stroke={COLORS.primary}
          strokeWidth={3}
          strokeDasharray="6 6"
          dot={{ r: 5, fill: "#fff", stroke: COLORS.primary, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * 9. Watch Hours vs CLV Scatter Chart
 */
export function WatchHoursScatterChart({ data }) {
  const defaultData = [
    { watch_hours: 15, clv: 14000, name: "C1001" },
    { watch_hours: 32, clv: 21500, name: "C1002" },
    { watch_hours: 48, clv: 27800, name: "C1003" },
    { watch_hours: 65, clv: 33200, name: "C1004" },
    { watch_hours: 80, clv: 38900, name: "C1005" },
    { watch_hours: 95, clv: 44100, name: "C1006" },
    { watch_hours: 112, clv: 51200, name: "C1007" },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <div style={{ width: "100%", height: "100%", pointerEvents: "auto", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 25, left: 10, bottom: 35 }} style={{ pointerEvents: "auto" }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            type="number"
            dataKey="watch_hours"
            name="Watch Hours"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            label={{ value: "Watch Hours / Month", position: "insideBottom", offset: -20, fill: COLORS.text, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="clv"
            name="Predicted CLV"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickFormatter={(val) => formatINR(val, { compact: true })}
            dx={-5}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8", strokeWidth: 1 }}
            content={<ScatterCustomTooltip xLabel="Watch Hours" yLabel="Predicted CLV" />}
            wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
            isAnimationActive={false}
          />
          <Scatter
            data={chartData}
            fill={COLORS.teal}
            stroke="#ffffff"
            strokeWidth={2}
            fillOpacity={0.85}
            cursor="pointer"
            dot={{ r: 7, fill: COLORS.teal, stroke: "#ffffff", strokeWidth: 2, cursor: "pointer" }}
            activeShape={{ r: 10, fill: "#0d9488", stroke: "#ffffff", strokeWidth: 3 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * 10. Login Days vs CLV Scatter Chart
 */
export function LoginDaysScatterChart({ data }) {
  const defaultData = [
    { login_days: 3, clv: 9200, name: "C2001" },
    { login_days: 8, clv: 14500, name: "C2002" },
    { login_days: 12, clv: 19800, name: "C2003" },
    { login_days: 17, clv: 25300, name: "C2004" },
    { login_days: 22, clv: 31100, name: "C2005" },
    { login_days: 26, clv: 37400, name: "C2006" },
    { login_days: 30, clv: 43800, name: "C2007" },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <div style={{ width: "100%", height: "100%", pointerEvents: "auto", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 25, left: 10, bottom: 35 }} style={{ pointerEvents: "auto" }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            type="number"
            dataKey="login_days"
            name="Login Days"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            label={{ value: "Active Login Days / Month", position: "insideBottom", offset: -20, fill: COLORS.text, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="clv"
            name="Predicted CLV"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickFormatter={(val) => formatINR(val, { compact: true })}
            dx={-5}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8", strokeWidth: 1 }}
            content={<ScatterCustomTooltip xLabel="Login Days" yLabel="Predicted CLV" />}
            wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
            isAnimationActive={false}
          />
          <Scatter
            data={chartData}
            fill={COLORS.amber}
            stroke="#ffffff"
            strokeWidth={2}
            fillOpacity={0.85}
            cursor="pointer"
            dot={{ r: 7, fill: COLORS.amber, stroke: "#ffffff", strokeWidth: 2, cursor: "pointer" }}
            activeShape={{ r: 10, fill: "#d97706", stroke: "#ffffff", strokeWidth: 3 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * 11. Actual vs Predicted CLV Scatter Chart
 */
export function ActualVsPredictedScatterChart({ data }) {
  const defaultData = [
    { name: "Customer #101", actual: 14200, predicted: 14280 },
    { name: "Customer #102", actual: 21800, predicted: 21650 },
    { name: "Customer #103", actual: 28400, predicted: 28510 },
    { name: "Customer #104", actual: 34500, predicted: 34390 },
    { name: "Customer #105", actual: 42100, predicted: 42250 },
    { name: "Customer #106", actual: 49800, predicted: 49600 },
    { name: "Customer #107", actual: 56200, predicted: 56410 },
    { name: "Customer #108", actual: 63000, predicted: 62880 },
    { name: "Customer #109", actual: 71500, predicted: 71720 },
    { name: "Customer #110", actual: 79000, predicted: 78850 },
  ];

  const chartData = data && data.length ? data : defaultData;

  return (
    <div style={{ width: "100%", height: "100%", pointerEvents: "auto", position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 25, left: 15, bottom: 35 }} style={{ pointerEvents: "auto" }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            type="number"
            dataKey="actual"
            name="Actual CLV"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickFormatter={(val) => formatINR(val, { compact: true })}
            dy={10}
            label={{ value: "Actual CLV (INR)", position: "insideBottom", offset: -20, fill: COLORS.text, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="predicted"
            name="Predicted CLV"
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickFormatter={(val) => formatINR(val, { compact: true })}
            dx={-5}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8", strokeWidth: 1 }}
            content={<ScatterCustomTooltip xLabel="Actual CLV" yLabel="Predicted CLV" />}
            wrapperStyle={{ zIndex: 1000, pointerEvents: "none" }}
            isAnimationActive={false}
          />
          <Scatter
            name="Actual vs Predicted"
            data={chartData}
            fill={COLORS.primary}
            stroke="#ffffff"
            strokeWidth={2}
            fillOpacity={0.85}
            cursor="pointer"
            dot={{ r: 7, fill: COLORS.primary, stroke: "#ffffff", strokeWidth: 2, cursor: "pointer" }}
            activeShape={{ r: 10, fill: COLORS.secondary, stroke: "#ffffff", strokeWidth: 3 }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

