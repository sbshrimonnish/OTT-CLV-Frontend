import { useState, useEffect } from "react";
import RGL from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { Button, Icon } from "./UIComponents";

const Responsive = RGL.Responsive || RGL;
const WidthProvider = RGL.WidthProvider || RGL.WidthProvider;

const ResponsiveReactGridLayout = WidthProvider ? WidthProvider(Responsive) : Responsive;

export function DashboardGrid({
  storageKey = "ott-clv-dashboard-layout",
  defaultLayouts = {},
  children,
  headerAction,
}) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Verify saved layout has all items from defaultLayouts.lg
        if (parsed && parsed.lg && defaultLayouts.lg) {
          const savedKeys = new Set(parsed.lg.map(item => item.i));
          const hasAllKeys = defaultLayouts.lg.every(item => savedKeys.has(item.i));
          if (hasAllKeys) return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load layout from localStorage:", e);
    }
    return defaultLayouts;
  });

  const handleLayoutChange = (currentLayout, allLayouts) => {
    if (isEditMode) {
      setLayouts(allLayouts);
      try {
        localStorage.setItem(storageKey, JSON.stringify(allLayouts));
      } catch (e) {
        console.error("Failed to save layout to localStorage:", e);
      }
    }
  };

  const handleResetLayout = () => {
    setLayouts(defaultLayouts);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error("Failed to reset layout:", e);
    }
  };

  return (
    <div className="dashboard-grid-wrapper">
      <div
        className="layout-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          padding: "10px 16px",
          background: "#ffffff",
          border: "1px solid #e4e8ef",
          borderRadius: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#172033" }}>
            Dashboard Layout
          </span>
          {isEditMode ? (
            <span
              className="status amber"
              style={{ fontSize: 11, padding: "3px 8px" }}
            >
              <Icon name="bars" size={12} /> Edit Mode Enabled — Drag & Resize Cards
            </span>
          ) : (
            <span
              className="status neutral"
              style={{ fontSize: 11, padding: "3px 8px" }}
            >
              <Icon name="check" size={12} /> Locked Grid
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {headerAction}
          <Button
            variant={isEditMode ? "primary" : "secondary"}
            onClick={() => setIsEditMode(!isEditMode)}
            icon="layers"
          >
            {isEditMode ? "Done Editing" : "Edit Layout"}
          </Button>
          {isEditMode && (
            <Button
              variant="ghost"
              onClick={handleResetLayout}
              icon="refresh"
            >
              Reset Layout
            </Button>
          )}
        </div>
      </div>

      <ResponsiveReactGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 1, xxs: 1 }}
        rowHeight={110}
        margin={[20, 20]}
        containerPadding={[0, 0]}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableHandle=".drag-handle"
        onLayoutChange={handleLayoutChange}
      >
        {children}
      </ResponsiveReactGridLayout>
    </div>
  );
}
