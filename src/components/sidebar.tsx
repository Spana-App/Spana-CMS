// import { useState } from "react";
import {
  Home,
  Users,
  Package,
  Calendar,
  FileText,
  Star,
  Layout,
  Bell,
  BarChart3,
  Settings,
  Shield,
  UserCog,
} from "lucide-react";
import "../Styles/sidebar.css"
import { NavLink } from 'react-router-dom';

const menuItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "usermanagement", label: "User Management", icon: Users },
  { id: "services", label: "Services", icon: Package },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "reviews", label: "Reviews & Disputes", icon: Star },
  { id: "content", label: "Content", icon: Layout },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "audit-logs", label: "Audit Logs", icon: Shield },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "profile", label: "Admin Profile", icon: UserCog },
];

interface Tabs {
  activeTab?: string,
  onTabChange?: (tabId: string) => void
}

export function DashboardSidebar(props: Tabs) {

  const handleTabChange = (id: string) => {
    if (props.onTabChange) props.onTabChange(id);
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <div className="sidebar-logo">
              <image className="sidebar-logo-text"></image>
            </div>
            <div>
              <h1 className="sidebar-title">Spana App</h1>
              <p className="sidebar-subtitle">Admin Portal</p>
            </div>
          </div>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const to = `/dashboard/${item.id}`;

          return (
            <NavLink
              key={item.id}
              to={to}
              onClick={() => handleTabChange(item.id)}
              className={(navData) =>
                `sidebar-menu-item ${navData.isActive ? 'active' : ''}`
              }
            >
              <Icon className="sidebar-menu-icon" />
              {item.label}
            </NavLink>
          );
        })}

      </aside>
    </>
  );
}

