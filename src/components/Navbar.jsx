import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/user/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch profile");
        }

        setUser(data);
      } catch (error) {
        console.error("Navbar Profile Error:", error);
      }
    };

    fetchProfile();
  }, []);

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
          <div className="profile-avatar">
            {user ? user.name.charAt(0).toUpperCase() : "P"}
          </div>

          <div className="profile-info">
            <span className="profile-name">
              {user ? user.name : "Loading..."}
            </span>

            <span className="profile-role">
              Student
            </span>
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