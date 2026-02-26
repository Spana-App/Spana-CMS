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
  CreditCard,
  Wallet2,
  ClipboardList,
  MessageCircle,
  UserCog,
} from "lucide-react";
import "../Styles/sidebar.css"
import { NavLink } from 'react-router-dom';

const menuItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "usermanagement", label: "User Management", icon: Users },
  { id: "services", label: "Services", icon: Package },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "wallet", label: "Wallet", icon: Wallet2 },
  { id: "applications", label: "Applications", icon: ClipboardList },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "reviews", label: "Reviews & Disputes", icon: Star },
  { id: "content", label: "Content", icon: Layout },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "chats", label: "Chats", icon: MessageCircle },
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
            </div>
            <div>
              <h1 className="sidebar-title">Spana CMS</h1>
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

