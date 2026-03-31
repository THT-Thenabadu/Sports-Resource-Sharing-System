// app/dashboard/admin/users/page.js
import AdminSidebar from '../components/Adminsidebar';
import AdminTopBar from '../components/Admintopbar';
import UserStatsCards from '../components/Userstatscard';
import UsersTable from '../components/Userstable';
import AdminTipCard from '../components/AdminTipCard';

export default function ManageUsersPage() {
    return (
        <div style={{ display: 'flex' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '256px', minHeight: '100vh', flex: 1 }}>
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