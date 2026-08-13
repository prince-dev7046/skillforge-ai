import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;