'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../../components/Adminsidebar';
import AdminTopBar from '../../../components/Admintopbar';

export default function ManageBookingsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [authToken, setAuthToken] = useState(null);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    // Edit modal state
    const [editingBooking, setEditingBooking] = useState(null);
    const [editData, setEditData] = useState({ date: '', startTime: '', endTime: '', changeRequest: 'none' });

    // Block slot modal state
    const [isBlockingModalOpen, setIsBlockingModalOpen] = useState(false);
    const [facilities, setFacilities] = useState([]);
    const [blockData, setBlockData] = useState({ facilityId: '', date: '', startTime: '', endTime: '' });

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('token');
        if (user.role !== 'admin' && user.role !== 'owner') {
            router.push('/');
            return;
        }
        setAuthToken(token);
        fetchBookings(token);
    }, []);

    const fetchBookings = async (token) => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:8000/api/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch bookings');
            const data = await res.json();
            // Show new change requests at the top
            data.sort((a, b) => {
                if (a.changeRequest === 'pending' && b.changeRequest !== 'pending') return -1;
                if (a.changeRequest !== 'pending' && b.changeRequest === 'pending') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            setBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacilities = async (token) => {
        try {
            const res = await fetch('http://localhost:8000/api/facilities', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setFacilities(data);
            }
        } catch (err) {
            console.error('Failed to fetch facilities', err);
        }
    };

    const openBlockModal = () => {
        if (facilities.length === 0) fetchFacilities(authToken);
        setBlockData({ facilityId: '', date: '', startTime: '', endTime: '' });
        setIsBlockingModalOpen(true);
    };

    const submitBlockSlot = async () => {
        if (!blockData.facilityId || !blockData.date || !blockData.startTime || !blockData.endTime) {
            return alert('Please fill in all fields to block a slot.');
        }
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/block`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(blockData)
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to block slot');
            }
            alert('Slot securely blocked globally.');
            setIsBlockingModalOpen(false);
            fetchBookings(authToken);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleBlock = async (id) => {
        if (!confirm('Are you sure you want to block/cancel this booking?')) return;
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'cancelled' })
            });
            if (!res.ok) throw new Error('Failed to block booking');
            alert('Booking blocked successfully.');
            fetchBookings(authToken);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleRejectRequest = async (id) => {
        if (!confirm("Reject the customer's change request?")) return;
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ changeRequest: 'rejected', changeNote: '' })
            });
            if (!res.ok) throw new Error('Failed to reject change req');
            alert('Change request rejected.');
            fetchBookings(authToken);
        } catch (err) {
            alert(err.message);
        }
    };

    const openEditModal = (b) => {
        setEditingBooking(b);
        setEditData({
            date: new Date(b.date).toISOString().split('T')[0],
            startTime: b.startTime,
            endTime: b.endTime,
            changeRequest: b.changeRequest === 'pending' ? 'resolved' : 'none'
        });
    };

    const submitEdit = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/bookings/${editingBooking._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            });
            if (!res.ok) throw new Error('Failed to update booking');
            alert('Booking updated successfully!');
            setEditingBooking(null);
            fetchBookings(authToken);
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredBookings = bookings.filter((b) => {
        const matchesSearch =
            (b.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.facilityName || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        // Compare dates locally by their YYYY-MM-DD representation
        const matchDate = !dateFilter || new Date(b.date).toISOString().split('T')[0] === dateFilter;
        return matchesSearch && matchesStatus && matchDate;
    });

    return (
        <div style={{ display: 'flex' }}>
            <AdminSidebar />
            <main style={{ marginLeft: '256px', minHeight: '100vh', flex: 1, backgroundColor: '#f9fafb' }}>
                <AdminTopBar />
                <section style={{ padding: '32px 40px' }}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">Manage Bookings</h1>
                            <p className="text-gray-500 mt-1 text-sm">Review, modify, or block facility reservations.</p>
                        </div>
                        <button
                            onClick={openBlockModal}
                            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
                        >
                            <span>🚫</span> Block New Slot
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Search</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Customer or Facility..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="w-48">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="all">All Statuses</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="pending_payment">Pending Payment</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>

                        <div className="w-48">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        {(searchTerm || statusFilter !== 'all' || dateFilter) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setDateFilter('');
                                }}
                                className="px-4 py-2 text-sm text-gray-500 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {error && <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm mb-4 flex items-center gap-2">⚠️ {error}</div>}

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-500 font-medium">Loading bookings...</span>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-[#112240] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Facility</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Date & Time</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Requests / Notes</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                    <span className="text-3xl block mb-2">📭</span>
                                                    No bookings found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBookings.map(b => (
                                                <tr key={b._id} className={`hover:bg-gray-50 transition-colors ${b.changeRequest === 'pending' ? 'bg-orange-50/50' : ''}`}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                                                                {b.userName ? b.userName.charAt(0).toUpperCase() : '?'}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">{b.userName}</div>
                                                                <div className="text-xs text-gray-500 font-mono">ID: {b._id.slice(-6)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-semibold text-gray-800">{b.facilityName}</div>
                                                        <div className="text-xs text-gray-500">{b.institution}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 font-medium">📅 {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                                        <div className="text-xs text-gray-500 mt-1">🕐 {b.startTime} - {b.endTime}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border
                                                            ${b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' 
                                                            : b.status === 'expired' ? 'bg-gray-100 text-gray-700 border-gray-300'
                                                            : b.status === 'blocked' ? 'bg-gray-800 text-white border-gray-900'
                                                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                            {b.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                        <div className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{b.paymentMethod}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px]">
                                                        {b.changeRequest === 'pending' ? (
                                                            <div className="bg-orange-100 border border-orange-200 rounded-lg p-2 relative group">
                                                                <span className="absolute -top-2 -right-2 flex h-3 w-3">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                                                                </span>
                                                                <span className="text-xs font-bold text-orange-800 block mb-1">ACTION REQUIRED:</span>
                                                                <p className="text-xs text-orange-900 truncate" title={b.changeNote}>{b.changeNote}</p>
                                                            </div>
                                                        ) : b.changeRequest === 'rejected' ? (
                                                            <span className="text-xs text-red-500 font-medium italic">Change Rejected</span>
                                                        ) : b.changeRequest === 'resolved' ? (
                                                            <span className="text-xs text-green-500 font-medium italic">Changes Applied</span>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                        <button
                                                            onClick={() => openEditModal(b)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded shadow-sm transition-colors border border-blue-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        {b.changeRequest === 'pending' && (
                                                            <button
                                                                onClick={() => handleRejectRequest(b._id)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 hover:bg-orange-100 font-semibold rounded shadow-sm transition-colors border border-orange-200"
                                                            >
                                                                Reject Req
                                                            </button>
                                                        )}
                                                        {b.status !== 'cancelled' && b.status !== 'expired' && b.status !== 'blocked' && (
                                                            <button
                                                                onClick={() => handleBlock(b._id)}
                                                                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 font-semibold rounded shadow-sm transition-colors border border-red-200"
                                                            >
                                                                Cancel / Block
                                                            </button>
                                                        )}
                                                        {b.status === 'blocked' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm("Remove this block block?")) {
                                                                        fetch(`http://localhost:8000/api/bookings/${b._id}`, {
                                                                            method: 'DELETE',
                                                                            headers: { 'Authorization': `Bearer ${authToken}` }
                                                                        }).then(() => fetchBookings(authToken));
                                                                    }
                                                                }}
                                                                className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold rounded shadow-sm transition-colors border border-gray-300"
                                                            >
                                                                Unblock
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-between items-center text-sm text-gray-500">
                                <span>Total bookings showing: <strong>{filteredBookings.length}</strong></span>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {editingBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Booking Slot</h2>
                        {editingBooking.changeRequest === 'pending' && (
                            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                                <strong>Customer Request:</strong> {editingBooking.changeNote}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date</label>
                                <input type="date" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                    <input type="time" value={editData.startTime} onChange={e => setEditData({...editData, startTime: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                                    <input type="time" value={editData.endTime} onChange={e => setEditData({...editData, endTime: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={() => setEditingBooking(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={submitEdit} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Slot Modal */}
            {isBlockingModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">🚫</span>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Block a Time Slot</h2>
                                <p className="text-sm text-gray-500">Prevent users from booking this specific period.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Facility</label>
                                <select
                                    value={blockData.facilityId}
                                    onChange={e => setBlockData({...blockData, facilityId: e.target.value})}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                                >
                                    <option value="">-- Select a Facility --</option>
                                    {facilities.map(f => (
                                        <option key={f._id} value={f._id}>{f.name} ({f.institution})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
                                <input
                                    type="date"
                                    value={blockData.date}
                                    onChange={e => setBlockData({...blockData, date: e.target.value})}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Start Time</label>
                                    <input
                                        type="time"
                                        value={blockData.startTime}
                                        onChange={e => setBlockData({...blockData, startTime: e.target.value})}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">End Time</label>
                                    <input
                                        type="time"
                                        value={blockData.endTime}
                                        onChange={e => setBlockData({...blockData, endTime: e.target.value})}
                                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                            <button
                                onClick={() => setIsBlockingModalOpen(false)}
                                className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitBlockSlot}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-colors"
                            >
                                Block Slot
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
