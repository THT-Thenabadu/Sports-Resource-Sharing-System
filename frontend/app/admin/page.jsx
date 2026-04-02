'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// app/dashboard/admin/users/page.js
import AdminSidebar from '../components/Adminsidebar';
import AdminTopBar from '../components/Admintopbar';
import UserStatsCards from '../components/Userstatscard';
import UsersTable from '../components/Userstable';
import AdminTipCard from '../components/AdminTipCard';

export default function ManageUsersPage() {
    
    const router = useRouter();

    useEffect(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role !== 'admin') {
        router.push('/'); // ✅ kick non-admins back to homepage
      }
    }, []);
    
    return (
        <div style={{ display: 'flex', background: 'linear-gradient(180deg, #eef2f7 0%, #e9eef5 100%)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '256px', flex: 1 }}>
                <AdminTopBar />
                <section style={{ padding: '32px 40px' }}>
                    <UserStatsCards />
                    <UsersTable />
                    <div style={{ marginTop: '64px' }}>
                        <AdminTipCard />
                    </div>
                </section>
            </main>
        </div>
    );
}