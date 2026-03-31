'use client';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <Sidebar />
            <TopBar />
            <main className="ml-64 pt-16 min-h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

