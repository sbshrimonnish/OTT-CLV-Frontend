import { Icon } from "./UIComponents";

export function ChartCard({
  title,
  subtitle,
  children,
  badge,
  action,
  className = "",
  style = {},
  isEditMode = false,
}) {
  return (
    <section className={`card chart-card ${className}`} style={style}>
      <div className="card-head">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {isEditMode && (
            <div
              className="drag-handle"
              title="Drag to move card"
              style={{
                cursor: "grab",
                padding: "2px 4px",
                borderRadius: "4px",
                background: "rgba(79, 70, 229, 0.1)",
                color: "#4f46e5",
                display: "flex",
                alignItems: "center",
                marginRight: 4,
              }}
            >
              <Icon name="bars" size={14} />
            </div>
          )}
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {badge}
          {action}
        </div>
      </div>
      <div className="chart-body">{children}</div>
    </section>
  );
}
