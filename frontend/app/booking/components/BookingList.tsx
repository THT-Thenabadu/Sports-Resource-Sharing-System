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
        if (searchUserId && !b.userId.toLowerCase().includes(searchUserId.toLowerCase())) return false;
        if (filterStatus && b.status !== filterStatus) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332]"></div>
                <span className="ml-3 text-gray-600">Loading bookings...</span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">My Bookings</h2>
                <button
                    onClick={onBack}
                    className="text-sm text-[#4a9ece] hover:text-[#1a2332] font-medium"
                >
                    ← Back to Booking
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex flex-wrap gap-3 mb-4">
                <input
                    type="text"
                    value={searchUserId}
                    onChange={e => setSearchUserId(e.target.value)}
                    placeholder="Search by User ID..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4a9ece] focus:border-[#4a9ece] flex-1 min-w-[200px]"
                />
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4a9ece] focus:border-[#4a9ece] bg-white"
                >
                    <option value="">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No bookings found</p>
                    <p className="text-sm">
                        {bookings.length > 0 ? 'Try adjusting your filters.' : 'Start by making a booking!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(booking => (
                        <div
                            key={booking._id}
                            className={`border rounded-xl p-4 transition-all ${
                                booking.status === 'cancelled'
                                    ? 'border-gray-200 bg-gray-50 opacity-70'
                                    : 'border-gray-200 bg-white hover:shadow-md'
                            }`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-800">{booking.facilityName}</h3>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            booking.status === 'confirmed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">{booking.institution}</p>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                        <span>📅 {formatDate(booking.date)}</span>
                                        <span>🕐 {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                        <span>👤 {booking.userName} ({booking.userId})</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">
                                        ID: <span className="font-mono">{booking._id}</span>
                                    </p>
                                </div>

                                {booking.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleCancel(booking._id)}
                                        disabled={cancellingId === booking._id}
                                        className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                                    >
                                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 text-sm text-gray-400 text-center">
                Showing {filtered.length} of {bookings.length} bookings
            </div>
        </div>
    );
}
