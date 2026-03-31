'use client';

import { useEffect, useState } from 'react';
import { Booking } from '../types';
import { getBookings, cancelBooking } from '../services/bookingApi';
import Link from 'next/link';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [searchUserId, setSearchUserId] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            const data = await getBookings();
            // Show only confirmed (active) bookings
            setBookings(data.filter(b => b.status === 'confirmed'));
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
            await loadBookings();
        } catch {
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setCancellingId(null);
        }
    }

    function formatTime(time24: string): string {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    function formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
        });
    }

    const filtered = bookings.filter(b => {
        if (searchUserId && !b.userId.toLowerCase().includes(searchUserId.toLowerCase())) return false;
        return true;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                    <p className="text-sm text-gray-500">View and manage your current bookings</p>
                </div>
                <Link
                    href="/booking"
                    className="px-4 py-2 text-sm bg-[#1a2332] text-white rounded-lg hover:bg-[#2a3a4e] transition-colors font-medium"
                >
                    + New Booking
                </Link>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332]"></div>
                    <span className="ml-3 text-gray-600">Loading bookings...</span>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>
                    )}

                    <div className="flex flex-wrap gap-3 mb-4">
                        <input
                            type="text"
                            value={searchUserId}
                            onChange={e => setSearchUserId(e.target.value)}
                            placeholder="Search by User ID..."
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4a9ece] focus:border-[#4a9ece] flex-1 min-w-[200px]"
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                            <p className="text-lg text-gray-500 mb-2">No active bookings found</p>
                            <p className="text-sm text-gray-400">Make a new booking to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(booking => (
                                <div key={booking._id} className="border border-gray-200 bg-white rounded-xl p-4 hover:shadow-md transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-800">{booking.facilityName}</h3>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">{booking.institution}</p>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                                <span>📅 {formatDate(booking.date)}</span>
                                                <span>🕐 {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                                <span>👤 {booking.userName} ({booking.userId})</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleCancel(booking._id)}
                                            disabled={cancellingId === booking._id}
                                            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                                        >
                                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}



