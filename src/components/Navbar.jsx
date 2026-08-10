function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        SkillForge <span>AI</span>
      </div>

      <div className="navbar-right">
        <button className="notification-btn">🔔</button>

        <div className="profile">
          <div className="profile-avatar">P</div>

          <div className="profile-info">
            <span className="profile-name">Prince</span>
            <span className="profile-role">Student</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;