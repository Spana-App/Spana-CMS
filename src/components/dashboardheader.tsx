import { Activity, useState } from "react";
import { Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authentication";


export function DashboardHeader() {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuthStore();

  const navigate = useNavigate();

  const handleProfile = () =>{
    navigate("/dashboard/profile");
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();

    setTimeout(()=>
    <Activity>Logging out...</Activity>
    ), 1000;
    
    navigate("/");
  };

  return (
    <>
      <style>{` 
        .header {
          height: 100%;
          width: 100%;  
          border-bottom: 1px solid #e5e7eb;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
        }

        .search-container {
          flex: 1;
          max-width: 36rem;
        }

        .search-wrapper {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1rem;
          height: 1rem;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem 0.5rem 2.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-button {
          position: relative;
          padding: 0.5rem;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-button:hover {
          background-color: #f3f4f6;
        }

        .notification-badge {
          position: absolute;
          top: 0.25rem;
          right: 0.25rem;
          width: 0.5rem;
          height: 0.5rem;
          background-color: #ef4444;
          border-radius: 9999px;
        }

        .profile-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .profile-button:hover {
          background-color: #f3f4f6;
        }

        .avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 9999px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e5e7eb;
          font-size: 0.875rem;
          font-weight: 600;
          color: #4b5563;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1f2937;
        }

        .dropdown-container {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 0.5rem);
          width: 14rem;
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          z-index: 50;
          overflow: hidden;
        }

        .dropdown-menu.hidden {
          display: none;
        }

        .dropdown-label {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .dropdown-separator {
          height: 1px;
          background-color: #e5e7eb;
          margin: 0.25rem 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #1f2937;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .dropdown-item:hover {
          background-color: #f3f4f6;
        }

        .dropdown-item.destructive {
          color: #ef4444;
        }

        .dropdown-item-icon {
          width: 1rem;
          height: 1rem;
          margin-right: 0.5rem;
        }
      `}</style>

      <header className="header">
        <div className="search-container">
          <div className="search-wrapper">
            {/* <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users, bookings, services..."
              className="search-input"
            /> */}
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-button">
            <Bell style={{ width: "1.25rem", height: "1.25rem" }} />
            <span className="notification-badge"></span>
          </button>

          <div className="dropdown-container">
            <button
              className="profile-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="avatar">
                <span>AD</span>
              </div>
              <span className="profile-name">Admin User</span>
            </button>

            <div className={`dropdown-menu ${!isDropdownOpen ? "hidden" : ""}`}>
              <div className="dropdown-label">My Account</div>
              <div className="dropdown-separator"></div>
              <button className="dropdown-item" onClick={() => handleProfile()}>
                <User className="dropdown-item-icon" />
                Profile Settings
              </button>
              <button className="dropdown-item destructive" onClick={() => handleLogout()}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

