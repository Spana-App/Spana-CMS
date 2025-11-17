import React from 'react';
import '../Styles/layout.css';
import { DashboardSidebar } from './sidebar';
import { DashboardHeader } from './dashboardheader';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
    return (
        <div className="layout">
            <nav className="header-navbar">
                <DashboardHeader />
            </nav>

            <div className="layout-container">
                <aside className="aside-bar">
                    <DashboardSidebar />
                </aside>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>

        </div>
    );
};