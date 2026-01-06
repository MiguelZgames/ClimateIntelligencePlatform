import React from "react";
import './MapTooltip.css';

export type MapTooltipProps = {
  title?: string;
  subtitle?: string;
  leftBlock?: React.ReactNode;
  rightBlock?: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "light" | "blue" | "neutral";
  iconColor?: string; // New prop for custom icon color
  className?: string;
  onClose?: () => void;
};

const MAP_RADIUS = 14;
const MAP_SHADOW = "0 8px 24px rgba(33, 43, 54, 0.18)";
const BASE_PADDING = 16;

function useTooltipTheme(tone: MapTooltipProps["tone"]) {
  if (tone === "blue") {
    return {
      bg: "rgba(245, 250, 255, 0.92)",
      card: "#FFFFFF",
      border: "rgba(80, 120, 180, 0.18)",
      accent: "#2A6FE8",
      text: "#0F172A",
      subtext: "#475569"
    };
  }
  if (tone === "neutral") {
    return {
      bg: "rgba(249, 250, 251, 0.92)",
      card: "#FFFFFF",
      border: "rgba(100, 116, 139, 0.18)",
      accent: "#64748B",
      text: "#0F172A",
      subtext: "#475569"
    };
  }
  return {
    bg: "rgba(236, 246, 248, 0.92)",
    card: "#FFFFFF",
    border: "rgba(98, 151, 170, 0.18)",
    accent: "#2A6FE8",
    text: "#0F172A",
    subtext: "#475569"
  };
}

export const MapTooltip: React.FC<MapTooltipProps> = ({
  title,
  subtitle,
  leftBlock,
  rightBlock,
  footer,
  tone = "light",
  iconColor,
  className,
  onClose
}) => {
  const t = useTooltipTheme(tone);
  const padding = BASE_PADDING;

  return (
    <div
      className={`map-tooltip ${className ?? ""}`}
      style={{
        background: t.bg,
        borderRadius: MAP_RADIUS,
        boxShadow: MAP_SHADOW,
        border: `1px solid ${t.border}`,
        transition: "opacity 160ms ease, transform 180ms ease, box-shadow 180ms ease",
        willChange: "transform, opacity, box-shadow",
      }}
      role="dialog"
      aria-label={title ?? "Tooltip"}
      // Ensure it's visible by default when rendered inside Leaflet Popup
      data-open="true"
    >
      <div
        className="map-tooltip__card"
        style={{
          background: t.card,
          borderRadius: MAP_RADIUS,
          padding: `clamp(${padding * 0.75}px, 2vw, ${padding * 1.25}px)`,
        }}
      >
        <div className="map-tooltip__header">
          <div 
            className="map-tooltip__icon" 
            aria-hidden 
            style={iconColor ? { background: iconColor, boxShadow: `0 0 0 2px rgba(255,255,255,0.7) inset, 0 2px 4px ${iconColor}40` } : undefined}
          />
          <div className="map-tooltip__titles">
            {title && (
              <div className="map-tooltip__title" style={{ color: t.text }}>
                {title}
              </div>
            )}
            {subtitle && (
              <div className="map-tooltip__subtitle" style={{ color: t.subtext }}>
                {subtitle}
              </div>
            )}
          </div>
          {onClose && (
            <button
              className="map-tooltip__close"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          )}
        </div>

        <div className="map-tooltip__grid">
          <div className="map-tooltip__cell">{leftBlock}</div>
          <div className="map-tooltip__cell">{rightBlock}</div>
        </div>

        {footer && (
          <div className="map-tooltip__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
