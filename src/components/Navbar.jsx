import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getProfile, getSkillForgeData, updateSkillForgeData } from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const profile = await getProfile();
        setUser(profile);

        const sfData = await getSkillForgeData();
        if (Array.isArray(sfData.notifications)) {
          setNotifications(sfData.notifications);
        }
      } catch (error) {
        console.error("Navbar fetch error:", error);
      }
    };

    fetchData();

    // Listen for custom events to refresh navbar
    const handleRefresh = () => fetchData();
    window.addEventListener("skillforge-refresh", handleRefresh);
    return () => window.removeEventListener("skillforge-refresh", handleRefresh);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      await updateSkillForgeData({ notifications: updated });
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="mobile-menu-btn"
          aria-label="Toggle Navigation Menu"
          onClick={() => {
            setShowMobileMenu(!showMobileMenu);
            window.dispatchEvent(new CustomEvent("toggle-sidebar", { detail: !showMobileMenu }));
          }}
        >
          ☰
        </button>

        <Link to="/dashboard" className="navbar-logo">
          <span className="navbar-logo-icon">⚡</span>
          SkillForge <span>AI</span>
        </Link>
      </div>

      <div className="navbar-right">
        <div className="notification-wrapper">
          <button
            className="notification-btn"
            aria-label="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications && unreadCount > 0) {
                markAllRead();
              }
            }}
          >
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && (
                  <button className="clear-notifications" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No notifications yet</p>
                ) : (
                  notifications.slice(0, 10).map((notif, idx) => (
                    <div
                      key={idx}
                      className={`notification-item ${!notif.read ? "unread" : ""}`}
                    >
                      <span className="notification-icon">{notif.icon || "📢"}</span>
                      <div>
                        <p className="notification-text">{notif.message}</p>
                        <span className="notification-time">{notif.time || ""}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="profile">
          <div className="profile-avatar">
            {user ? user.name.charAt(0).toUpperCase() : "?"}
          </div>

          <div className="profile-info">
            <span className="profile-name">
              {user ? user.name : "Loading..."}
            </span>
            <span className="profile-role">
              {user?.targetRole || "Student"}
            </span>
          </div>
        </Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;