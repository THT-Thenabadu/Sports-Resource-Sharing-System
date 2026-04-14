'use client';

import { useEffect, useState } from 'react';
import { Booking } from '../types';
import { getBookings, cancelBooking, requestBookingChange } from '../services/bookingApi';
import Link from 'next/link';
import PaymentStep from '../components/PaymentStep';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now());
    const [settlingBookingId, setSettlingBookingId] = useState<string | null>(null);

    // State for request change modal
    const [changeRequestBookingId, setChangeRequestBookingId] = useState<string | null>(null);
    const [changeNote, setChangeNote] = useState('');
    const [isSubmittingChange, setIsSubmittingChange] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
            try {
                // Decode JWT to get user ID
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                setUserId(decoded.id);
            } catch (e) {
                setError('Could not parse token data.');
                setLoading(false);
            }
        } else {
            setError('You must be logged in to view your bookings.');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userId) {
            loadBookings();
        }
    }, [userId]);

    async function loadBookings() {
        if (!userId) return;
        try {
            setLoading(true);
            // Pass userId to getBookings to fetch only this user's bookings
            const data = await getBookings({ userId });
            // Show both confirmed and pending_payment bookings
            setBookings(data.filter(b => ['confirmed', 'pending_payment'].includes(b.status)));
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(bookingId: string) {
        if (!authToken) {
            alert('You are not authenticated. Please log in again.');
            return;
        }
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            setCancellingId(bookingId);
            await cancelBooking(bookingId, authToken);
            await loadBookings();
        } catch {
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setCancellingId(null);
        }
    }

    async function submitChangeRequest() {
        if (!authToken || !changeRequestBookingId || !changeNote.trim()) return;
        try {
            setIsSubmittingChange(true);
            await requestBookingChange(changeRequestBookingId, changeNote, authToken);
            alert('Change request sent to admin!');
            setChangeRequestBookingId(null);
            setChangeNote('');
            await loadBookings();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to request change');
        } finally {
            setIsSubmittingChange(false);
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

    function calculateTimeLeft(holdExpiresAt?: string) {
        if (!holdExpiresAt) return null;
        const diff = Math.floor((new Date(holdExpiresAt).getTime() - now) / 1000);
        if (diff <= 0) return 'Expired';
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // The search bar is removed as we are now filtering by the logged-in user
    const filtered = bookings;

    const confirmedBookings = filtered.filter((b) => b.status === 'confirmed');
    const inProgressBookings = filtered.filter((b) => b.status === 'pending_payment');

    if (settlingBookingId) {
        return (
            <div className="py-6">
                <PaymentStep
                    bookingId={settlingBookingId}
                    onPaid={() => {
                        setSettlingBookingId(null);
                        loadBookings();
                    }}
                    onBack={() => setSettlingBookingId(null)}
                    onExpired={() => {
                        setSettlingBookingId(null);
                        loadBookings();
                    }}
                />
            </div>
        );
    }

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

                    <div className="space-y-8">
                        {/* ─── IN-PROGRESS BOOKINGS ─── */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                ⏳ In-Progress Bookings
                            </h2>
                            {inProgressBookings.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No pending payments.</p>
                            ) : (
                                <div className="space-y-3">
                                    {inProgressBookings.map(booking => (
                                        <div key={booking._id} className="border border-yellow-200 bg-yellow-50/30 rounded-xl p-4 hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-800">{booking.facilityName}</h3>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-yellow-100 text-yellow-700">
                                                            Pending Payment
                                                        </span>
                                                        {booking.holdExpiresAt && (
                                                            <span className="text-xs font-mono font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 shadow-sm">
                                                                Time Left: {calculateTimeLeft(booking.holdExpiresAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{booking.institution}</p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                                        <span>📅 {formatDate(booking.date)}</span>
                                                        <span>🕐 {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 justify-center">
                                                    {calculateTimeLeft(booking.holdExpiresAt) !== 'Expired' ? (
                                                        <button
                                                            onClick={() => setSettlingBookingId(booking._id)}
                                                            className="px-6 py-2 text-sm bg-yellow-500 text-yellow-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors whitespace-nowrap shadow-sm border border-yellow-600 flex items-center justify-center gap-2"
                                                        >
                                                            <span>💳</span> Complete Payment
                                                        </button>
                                                    ) : (
                                                        <span className="px-6 py-2 text-sm bg-gray-200 text-gray-500 font-bold rounded-lg text-center">
                                                            Expired
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleCancel(booking._id)}
                                                        disabled={cancellingId === booking._id}
                                                        className="px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap text-center"
                                                    >
                                                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ─── CONFIRMED BOOKINGS ─── */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                                ✅ Confirmed Bookings
                            </h2>
                            {confirmedBookings.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">No confirmed bookings.</p>
                            ) : (
                                <div className="space-y-3">
                                    {confirmedBookings.map(booking => (
                                        <div key={booking._id} className="border border-gray-200 bg-white rounded-xl p-4 hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-gray-800">{booking.facilityName}</h3>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                                                            Confirmed
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-mono tracking-widest pl-2">ID: {booking._id.slice(-6)}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{booking.institution}</p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                                        <span>📅 {formatDate(booking.date)}</span>
                                                        <span>🕐 {formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 justify-center">
                                                    {booking.changeRequest !== 'pending' && (
                                                        <button
                                                            onClick={() => setChangeRequestBookingId(booking._id)}
                                                            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 font-medium border border-blue-200 rounded-lg hover:bg-blue-600 hover:text-white transition-colors whitespace-nowrap"
                                                        >
                                                            Request Change
                                                        </button>
                                                    )}
                                                    {booking.changeRequest === 'pending' && (
                                                        <span className="px-4 py-2 text-sm bg-orange-50 text-orange-600 font-medium border border-orange-200 rounded-lg text-center whitespace-nowrap">
                                                            Change Requested
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => handleCancel(booking._id)}
                                                        disabled={cancellingId === booking._id}
                                                        className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                                                    >
                                                        {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Change Request Modal */}
            {changeRequestBookingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Request Booking Change</h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Describe the requested date, time, or venue change. An admin will review your request.
                        </p>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#112240] outline-none"
                            placeholder="I would like to change my booking to tomorrow at 2:00 PM if possible..."
                            value={changeNote}
                            onChange={(e) => setChangeNote(e.target.value)}
                        />
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setChangeRequestBookingId(null);
                                    setChangeNote('');
                                }}
                                disabled={isSubmittingChange}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitChangeRequest}
                                disabled={isSubmittingChange || !changeNote.trim()}
                                className="px-5 py-2 bg-[#112240] text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                            >
                                {isSubmittingChange ? 'Submitting...' : 'Submit Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
