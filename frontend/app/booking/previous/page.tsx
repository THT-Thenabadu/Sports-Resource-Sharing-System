'use client';

import { useEffect, useState } from 'react';
import { Booking } from '../types';
import { getBookings } from '../services/bookingApi';
import Link from 'next/link';

export default function PreviousBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchUserId, setSearchUserId] = useState('');

    useEffect(() => {
        loadBookings();
    }, []);

    async function loadBookings() {
        try {
            setLoading(true);
            const data = await getBookings();
            // Show only cancelled / past bookings
            setBookings(data.filter(b => b.status === 'cancelled'));
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
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
                    <h1 className="text-2xl font-bold text-gray-900">Previous Bookings</h1>
                    <p className="text-sm text-gray-500">View your past and cancelled bookings</p>
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
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#edf5fa] flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#4a9ece]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-500 mb-2">No previous bookings found</p>
                            <p className="text-sm text-gray-400">Your past and cancelled bookings will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(booking => (
                                <div key={booking._id} className="border border-gray-200 bg-gray-50 rounded-xl p-4 opacity-80">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-800">{booking.facilityName}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
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
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

