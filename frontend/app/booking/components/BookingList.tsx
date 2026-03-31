'use client';

import { useEffect, useState } from 'react';
import { Booking } from '../types';
import { getBookings, cancelBooking } from '../services/bookingApi';

interface BookingListProps {
    onBack: () => void;
}

export default function BookingList({ onBack }: BookingListProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [searchUserId, setSearchUserId] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            const data = await getBookings();
            setBookings(data);
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(bookingId: string) {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            setCancellingId(bookingId);
            await cancelBooking(bookingId);
            // Refresh the list after cancellation
            await loadBookings();
        } catch {
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setCancellingId(null);
        }
    }

    // Convert "14:00" to "2:00 PM"
    function formatTime(time24: string): string {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    // Filter bookings
    const filtered = bookings.filter(b => {
        const userId = (b.userId ?? '').toLowerCase();
        if (searchUserId && !userId.includes(searchUserId.toLowerCase())) return false;
        if (filterStatus && b.status !== filterStatus) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#112240]"></div>
                <span className="mt-4 text-gray-500 font-medium">Loading your bookings...</span>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#112240] flex items-center gap-3">
                    <span className="text-3xl">📋</span> My Bookings
                </h2>
                <button
                    onClick={onBack}
                    className="px-4 py-2 border-2 border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold shadow-sm text-sm flex items-center gap-2"
                >
                    <span>←</span> Back to Booking
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700 font-medium flex items-center gap-2 shadow-sm">
                    <span className="text-red-500">⚠️</span> {error}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex-1 min-w-[250px] relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400">🔍</span>
                    </div>
                    <input
                        type="text"
                        value={searchUserId}
                        onChange={e => setSearchUserId(e.target.value)}
                        placeholder="Search by User ID..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-all shadow-sm"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-all shadow-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="pending_payment">⏳ Pending Payment</option>
                        <option value="cancelled">❌ Cancelled</option>
                    </select>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <span className="text-5xl block mb-4">📭</span>
                    <p className="text-xl font-bold text-gray-700 mb-2">No bookings found</p>
                    <p className="text-gray-500">
                        {bookings.length > 0 ? 'Try adjusting your filters.' : 'You haven\'t made any bookings yet!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(booking => (
                        <div
                            key={booking._id}
                            className={`border-2 rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                                booking.status === 'cancelled'
                                    ? 'border-gray-100 bg-gray-50/50 opacity-75'
                                    : 'border-gray-100 bg-white hover:border-[#112240]/20 hover:shadow-lg'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row gap-5">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-bold text-[#112240]">{booking.facilityName}</h3>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                            booking.status === 'confirmed'
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : booking.status === 'pending_payment'
                                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                        }`}>
                                            {(booking.status ?? 'unknown').replace('_', ' ')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                                        <span className="text-lg">🏛️</span> {booking.institution}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="p-1.5 bg-white rounded-md shadow-sm">📅</span>
                                            <span className="font-semibold">{formatDate(booking.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="p-1.5 bg-white rounded-md shadow-sm">🕐</span>
                                            <span className="font-semibold">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <span className="p-1.5 bg-white rounded-md shadow-sm">👤</span>
                                            <span className="font-medium">{booking.userName} <span className="text-gray-400">({booking.userId})</span></span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                                        ID: {booking._id}
                                    </p>
                                </div>

                                <div className="flex flex-col justify-between items-end gap-4 min-w-[140px]">
                                    {booking.status === 'confirmed' || booking.status === 'pending_payment' ? (
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            disabled={cancellingId === booking._id}
                                            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all shadow-sm"
                                        >
                                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                                        </button>
                                    ) : (
                                        <div className="h-10"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 text-sm font-semibold text-gray-400 text-center bg-gray-50 py-2 rounded-xl">
                Showing {filtered.length} of {bookings.length} bookings
            </div>
        </div>
    );
}
