function SkillCard({ name, percentage, color = "var(--neo-yellow)" }) {
  return (
    <div className="skill-item">
      <div className="skill-item-header">
        <span className="skill-item-name">{name}</span>
        <span className="skill-item-percentage text-mono">{percentage}%</span>
      </div>

      <div className="progress-container">
        <div
          className="progress-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        ></div>
      </div>
    </div>
  );
}

export default SkillCard;
