import React from "react";

/**
 * SkillCard — Neo-Brutalist Skill Tag / Card Component
 * 
 * Props:
 * - skill: Skill name (string or object)
 * - status: "default" | "matched" | "missing" | "verified" | "in-progress" | "completed"
 * - category: Optional skill domain category
 * - proficiency: Optional proficiency percentage (0-100)
 * - priority: Optional priority label ("High" | "Medium" | "Low")
 * - variant: "pill" (compact badge) | "card" (full metric card)
 * - onRemove: Optional callback for removable tags
 * - onClick: Optional click handler
 * - className: Additional CSS classes
 */
function SkillCard({
  skill,
  status = "default",
  category,
  proficiency,
  priority,
  variant = "pill",
  onRemove,
  onClick,
  className = "",
}) {
  const skillName = typeof skill === "string" ? skill : skill?.name || skill?.skill || "";
  const skillStatus = status || skill?.status || "default";

  if (variant === "pill") {
    return (
      <span
        className={`skill-tag skill-tag--${skillStatus} ${onClick ? "skill-tag--clickable" : ""} ${className}`}
        onClick={onClick}
      >
        {skillName}
        {onRemove && (
          <button
            type="button"
            className="skill-tag-remove"
            aria-label={`Remove ${skillName}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(skillName);
            }}
          >
            ×
          </button>
        )}
      </span>
    );
  }

  return (
    <div
      className={`skill-card skill-card--${skillStatus} ${onClick ? "skill-card--interactive" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="skill-card-header">
        <div className="skill-card-title-group">
          <h4 className="skill-card-name">{skillName}</h4>
          {category && <span className="skill-card-category">{category}</span>}
        </div>
        {priority && (
          <span className={`priority priority--${priority.toLowerCase()}`}>
            {priority} Priority
          </span>
        )}
      </div>

      {proficiency !== undefined && proficiency !== null && (
        <div className="skill-card-proficiency">
          <div className="skill-card-proficiency-info">
            <span>Proficiency</span>
            <strong>{proficiency}%</strong>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, proficiency))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SkillCard;
