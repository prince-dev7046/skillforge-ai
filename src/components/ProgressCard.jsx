function ProgressCard({ title = "Today's Goal", goalTitle, percentage, timeInfo }) {
  return (
    <div className="progress-goal-card card-interactive">
      <div className="goal-header">
        <h2>{title}</h2>
        <span className="badge badge-yellow">In Progress</span>
      </div>

      <div className="goal-body">
        <p className="goal-title-text">{goalTitle}</p>

        <div className="progress-container goal-bar-container">
          <div
            className="progress-fill goal-bar-fill"
            style={{
              width: `${percentage}%`,
              backgroundColor: "var(--neo-green)",
            }}
          ></div>
        </div>

        <div className="goal-footer">
          <span className="badge badge-cyan">{percentage}% Complete</span>
          <span className="goal-time text-mono">⏱️ {timeInfo}</span>
        </div>
      </div>
    </div>
  );
}

export default ProgressCard;
