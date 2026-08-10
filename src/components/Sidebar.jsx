import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-section">
        <p className="sidebar-title">MENU</p>

        <NavLink to="/dashboard" className="sidebar-link">
          <span>🏠</span>
          Dashboard
        </NavLink>

        <NavLink to="/resume" className="sidebar-link">
          <span>📄</span>
          Resume Analyzer
        </NavLink>

        <NavLink to="/skill-gap" className="sidebar-link">
          <span>🎯</span>
          Skill Gap
        </NavLink>

        <NavLink to="/roadmap" className="sidebar-link">
          <span>🗺️</span>
          My Roadmap
        </NavLink>

        <NavLink to="/projects" className="sidebar-link">
          <span>💡</span>
          Projects
        </NavLink>

        <NavLink to="/interview" className="sidebar-link">
          <span>💼</span>
          Interview Prep
        </NavLink>

        <NavLink to="/progress" className="sidebar-link">
          <span>📊</span>
          Progress
        </NavLink>
      </div>

    </aside>
  );
}

export default Sidebar;