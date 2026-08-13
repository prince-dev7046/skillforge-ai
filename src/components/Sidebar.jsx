import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = (e) => {
      setMobileOpen(e.detail);
    };

    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobile}></div>
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-section">
          <p className="sidebar-title">MENU</p>

          <NavLink to="/dashboard" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">🏠</span>
            Dashboard
          </NavLink>

          <NavLink to="/resume" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">📄</span>
            Resume Analyzer
          </NavLink>

          <NavLink to="/skill-gap" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">🎯</span>
            Skill Gap
          </NavLink>

          <NavLink to="/roadmap" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">🗺️</span>
            My Roadmap
          </NavLink>

          <NavLink to="/projects" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">💡</span>
            Projects
          </NavLink>

          <NavLink to="/interview" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">💼</span>
            Interview Prep
          </NavLink>

          <NavLink to="/progress" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">📊</span>
            Progress
          </NavLink>
        </div>

        <div className="sidebar-section">
          <p className="sidebar-title">ACCOUNT</p>

          <NavLink to="/profile" className="sidebar-link" onClick={closeMobile}>
            <span className="sidebar-link-icon">👤</span>
            Profile
          </NavLink>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;