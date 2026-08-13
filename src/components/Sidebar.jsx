import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-section">
        <p className="sidebar-title">NAVIGATION MENU</p>

        <NavLink to="/dashboard" className="sidebar-link">
          <span className="sidebar-icon">🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/resume" className="sidebar-link">
          <span className="sidebar-icon">📄</span>
          <span>Resume Analyzer</span>
        </NavLink>

        <NavLink to="/skill-gap" className="sidebar-link">
          <span className="sidebar-icon">🎯</span>
          <span>Skill Gap</span>
        </NavLink>

        <NavLink to="/roadmap" className="sidebar-link">
          <span className="sidebar-icon">🗺️</span>
          <span>My Roadmap</span>
        </NavLink>

        <NavLink to="/projects" className="sidebar-link">
          <span className="sidebar-icon">💡</span>
          <span>Projects</span>
        </NavLink>

        <NavLink to="/interview" className="sidebar-link">
          <span className="sidebar-icon">💼</span>
          <span>Interview Prep</span>
        </NavLink>

        <NavLink to="/progress" className="sidebar-link">
          <span className="sidebar-icon">📊</span>
          <span>Progress</span>
        </NavLink>
      </div>

    </aside>
  );
}

export default Sidebar;