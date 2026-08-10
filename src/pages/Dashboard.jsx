function Dashboard() {
  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <div>
          <h1>Welcome back, Prince 👋</h1>
          <p>
            Here's your personalized career progress.
          </p>
        </div>

        <button className="primary-btn">
          Generate Roadmap
        </button>
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <p>Career Readiness</p>
          <h2>74%</h2>
          <span>+8% this month</span>
        </div>

        <div className="stat-card">
          <p>Skills</p>
          <h2>12</h2>
          <span>8 mastered</span>
        </div>

        <div className="stat-card">
          <p>Roadmap Progress</p>
          <h2>67%</h2>
          <span>8 of 12 modules</span>
        </div>

        <div className="stat-card">
          <p>Projects</p>
          <h2>4</h2>
          <span>2 completed</span>
        </div>

      </div>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h2>Skill Overview</h2>

          <div className="skill">
            <div>
              <span>JavaScript</span>
              <span>90%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "90%" }}
              ></div>
            </div>
          </div>

          <div className="skill">
            <div>
              <span>React</span>
              <span>80%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "80%" }}
              ></div>
            </div>
          </div>

          <div className="skill">
            <div>
              <span>Node.js</span>
              <span>35%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "35%" }}
              ></div>
            </div>
          </div>

          <div className="skill">
            <div>
              <span>MongoDB</span>
              <span>70%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "70%" }}
              ></div>
            </div>
          </div>

        </div>

        <div className="dashboard-card">

          <h2>Today's Goal</h2>

          <p className="goal-title">
            Complete Express.js REST API
          </p>

          <div className="goal-progress">
            <div
              className="goal-progress-fill"
              style={{ width: "65%" }}
            ></div>
          </div>

          <div className="goal-footer">
            <span>65% complete</span>
            <span>2 hours</span>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;