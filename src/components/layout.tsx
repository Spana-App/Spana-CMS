import React from 'react';
import '../Styles/layout.css';
import { DashboardSidebar } from './sidebar';
import { DashboardHeader } from './dashboardheader';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="layout">
            <nav className="header-navbar">
                <DashboardHeader />
            </nav>

            <div className="layout-container">
                <aside className="aside-bar">
                    <DashboardSidebar activeTab="overview" onTabChange={() => {}} />
                </aside>

                <main className="main-content">
                    {children}
                </main>
            </div>

        </div>
    );
};