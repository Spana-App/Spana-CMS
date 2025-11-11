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

const menuItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "users", label: "User Management", icon: Users },
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
    activeTab: string,
    onTabChange: (tabId: string) => void
}

export function DashboardSidebar({ activeTab, onTabChange }: Tabs) {
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

        <nav className="sidebar-nav">
          <div className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`sidebar-menu-item ${
                    activeTab === item.id ? "active" : ""
                  }`}
                >
                  <Icon className="sidebar-menu-icon" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <hr className="line"></hr>
        </nav>
      </aside>
    </>
  );
}

// export default function App() {
//   const [activeTab, setActiveTab] = useState("overview");

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
//       <main style={{ flex: 1, padding: "2rem", backgroundColor: "#ffffff" }}>
//         <h2 style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
//           {menuItems.find((item) => item.id === activeTab)?.label}
//         </h2>
//         <p style={{ color: "#6b7280" }}>
//           Content for {activeTab} section goes here.
//         </p>
//       </main>
//     </div>
//   );
// }