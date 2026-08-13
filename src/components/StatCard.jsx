import React from "react";

/**
 * StatCard — Premium Neo-Brutalist Metric Card
 * 
 * Props:
 * - title: Label for the stat
 * - value: Primary metric value (e.g. "85%", "12")
 * - subtitle: Secondary descriptor below value
 * - icon: Optional emoji or element
 * - variant: "default" | "yellow" | "mint" | "violet" | "pink" | "cyan" | "orange"
 * - trend: Optional text indicating change/status
 * - badgeText: Optional header status pill text
 * - badgeVariant: "default" | "mint" | "pink" | "yellow" | "orange"
 * - className: Additional CSS classes
 * - onClick: Optional click handler for interactive cards
 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = "default",
  trend,
  badgeText,
  badgeVariant = "default",
  className = "",
  onClick,
}) {
  return (
    <div
      className={`stat-card stat-card--${variant} ${onClick ? "stat-card--interactive" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>

      <div className="stat-card-body">
        <h2 className="stat-card-value">{value}</h2>
        {badgeText && (
          <span className={`stat-card-badge stat-card-badge--${badgeVariant}`}>
            {badgeText}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="stat-card-footer">
          {trend && <span className="stat-card-trend">{trend}</span>}
          {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export default StatCard;
