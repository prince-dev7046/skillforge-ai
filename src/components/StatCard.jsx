function StatCard({ title, value, subtitle, variant = "default", icon }) {
  const variantClasses = {
    yellow: "card-yellow",
    cyan: "card-cyan",
    pink: "card-pink",
    green: "card-green",
    default: "",
  };

  const badgeVariants = {
    yellow: "badge-yellow",
    cyan: "badge-cyan",
    pink: "badge-pink",
    green: "badge-green",
    default: "",
  };

  return (
    <div className={`stat-card card-interactive ${variantClasses[variant] || ""}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>

      <div className="stat-card-body">
        <h2 className="stat-card-value">{value}</h2>
      </div>

      {subtitle && (
        <div className="stat-card-footer">
          <span className={`badge ${badgeVariants[variant] || ""}`}>
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
