import React from "react";

/**
 * ProgressCard — Neo-Brutalist Progress & Mastery Card
 * 
 * Props:
 * - title: Title of the progress section
 * - percentage: Optional explicit percentage (0-100)
 * - current: Current completed step count
 * - total: Total step count
 * - subtitle: Secondary description text
 * - icon: Optional emoji or element
 * - variant: "default" | "violet" | "mint" | "yellow" | "orange"
 * - fillColor: Custom CSS color for progress bar fill
 * - showLabel: Whether to render percentage pill label (default: true)
 * - footerText: Optional custom footer note
 * - children: Optional inner elements
 * - className: Additional CSS classes
 */
function ProgressCard({
  title,
  percentage,
  current,
  total,
  subtitle,
  icon,
  variant = "default",
  fillColor,
  showLabel = true,
  footerText,
  children,
  className = "",
}) {
  const computedPercent =
    percentage !== undefined && percentage !== null
      ? Math.min(100, Math.max(0, percentage))
      : total > 0
      ? Math.min(100, Math.max(0, Math.round((current / total) * 100)))
      : 0;

  return (
    <div className={`progress-card progress-card--${variant} ${className}`}>
      <div className="progress-card-header">
        <div className="progress-card-title-box">
          {icon && <span className="progress-card-icon">{icon}</span>}
          {title && <h3 className="progress-card-title">{title}</h3>}
        </div>
        {showLabel && (
          <span className="progress-card-percent-label">{computedPercent}%</span>
        )}
      </div>

      {subtitle && <p className="progress-card-subtitle">{subtitle}</p>}

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${computedPercent}%`,
            backgroundColor: fillColor || undefined,
          }}
        ></div>
      </div>

      {(footerText || (current !== undefined && total !== undefined)) && (
        <div className="progress-card-footer">
          <span>
            {footerText || `${current || 0} of ${total || 0} completed`}
          </span>
        </div>
      )}

      {children}
    </div>
  );
}

export default ProgressCard;
