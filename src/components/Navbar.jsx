import { useContext, useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { api } from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const { user, skillData, logout, refreshData } = useContext(UserContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  const notifications = skillData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      await refreshData();
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await refreshData();
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  const formatNotificationDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="navbar">
      <Link to="/dashboard" className="navbar-logo">
        SkillForge <span>AI</span>
      </Link>

      {user && (
        <div className="navbar-right">
          {/* Notification Button and Dropdown */}
          <div className="notification-wrapper" ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className="notification-btn"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ position: "relative" }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    backgroundColor: "var(--neo-pink)",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: "800",
                    borderRadius: "50%",
                    minWidth: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--border-color)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="notification-dropdown"
                style={{
                  position: "absolute",
                  top: "115%",
                  right: "0",
                  width: "320px",
                  maxHeight: "400px",
                  overflowY: "auto",
                  backgroundColor: "var(--bg-card)",
                  border: "var(--border-md)",
                  boxShadow: "var(--shadow-md)",
                  borderRadius: "var(--radius-sm)",
                  zIndex: "1000",
                  padding: "var(--space-sm)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "var(--space-sm)",
                    borderBottom: "var(--border-sm)",
                    paddingBottom: "var(--space-xs)",
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800" }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        padding: "4px 8px",
                        fontSize: "11px",
                        background: "var(--neo-yellow)",
                        border: "var(--border-sm)",
                        boxShadow: "1px 1px 0px var(--border-color)",
                        borderRadius: "var(--radius-xs)",
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p style={{ textAlign: "center", padding: "var(--space-md)", color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>
                    No notifications yet.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
                    {notifications.map((item) => (
                      <div
                        key={item._id}
                        style={{
                          padding: "var(--space-xs) var(--space-sm)",
                          border: "var(--border-sm)",
                          borderRadius: "var(--radius-xs)",
                          backgroundColor: item.read ? "var(--bg-app)" : "var(--surface-yellow)",
                          fontSize: "12px",
                          position: "relative",
                        }}
                      >
                        <p style={{ margin: "0 0 4px", fontWeight: item.read ? "500" : "700" }}>
                          {item.text}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                            {formatNotificationDate(item.date)}
                          </span>
                          {!item.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(item._id, e)}
                              style={{
                                border: "none",
                                background: "none",
                                color: "var(--neo-pink)",
                                textDecoration: "underline",
                                fontSize: "10px",
                                fontWeight: "700",
                                cursor: "pointer",
                                padding: 0,
                              }}
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Link to="/profile" className="profile" style={{ cursor: "pointer", textDecoration: "none" }}>
            <div className="profile-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : "P"}
            </div>

            <div className="profile-info">
              <span className="profile-name">
                {user ? user.name : "Loading..."}
              </span>

              <span className="profile-role-badge">
                {user?.targetRole || "Student"}
              </span>
            </div>
          </Link>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;