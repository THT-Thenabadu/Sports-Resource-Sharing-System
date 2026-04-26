'use client';

import React, { useEffect, useState } from 'react';
import { Booking } from '../types';
import { getBookings, cancelBooking, requestBookingChange } from '../services/bookingApi';
import PaymentStep from './PaymentStep';

interface BookingListProps {
    onBack: () => void;
}

export default function BookingList({ onBack }: BookingListProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
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
            const data = await getBookings({ userId });
            setBookings(data);
        } catch {
            setError('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    }

    async function handleCancel(bookingId: string) {
        if (!authToken) {
            alert('Authentication token not found. Please log in again.');
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

    function calculateTimeLeft(holdExpiresAt?: string) {
        if (!holdExpiresAt) return null;
        const diff = Math.floor((new Date(holdExpiresAt).getTime() - now) / 1000);
        if (diff <= 0) return 'Expired';
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // Filter bookings by status
    const filtered = bookings.filter(b => {
        if (filterStatus && b.status !== filterStatus) return false;
        return true;
    });

    const confirmedBookings = filtered.filter((b) => b.status === 'confirmed');
    const inProgressBookings = filtered.filter((b) => b.status === 'pending_payment');
    const otherBookings = filtered.filter((b) => b.status !== 'confirmed' && b.status !== 'pending_payment');

    if (settlingBookingId) {
        return (
            <div className="py-6 max-w-4xl mx-auto">
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
                {/* User ID search is removed */}
                <div className="w-full">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-all shadow-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="confirmed">✅ Confirmed</option>
                        <option value="pending_payment">⏳ Pending Payment</option>
                        <option value="cancelled">❌ Cancelled</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>

            <div className="space-y-10">
                {/* ─── IN-PROGRESS BOOKINGS ─── */}
                {(inProgressBookings.length > 0 || filterStatus === 'pending_payment') && (
                    <div className="animate-in fade-in duration-500">
                        <h3 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                            ⏳ In-Progress Bookings
                        </h3>
                        {inProgressBookings.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No pending payments.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {inProgressBookings.map(booking => (
                                    <div
                                        key={booking._id}
                                        className="border-2 border-yellow-200 bg-yellow-50/30 rounded-2xl p-5 sm:p-6 transition-all hover:shadow-lg hover:border-yellow-300"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-bold text-[#112240]">{booking.facilityName}</h3>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                        Pending Payment
                                                    </span>
                                                    {booking.holdExpiresAt && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200 shadow-sm animate-pulse">
                                                            ⏳ {calculateTimeLeft(booking.holdExpiresAt)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
                                                    <span className="text-lg">🏛️</span> {booking.institution}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 bg-white rounded-xl p-4 border border-yellow-100 shadow-sm">
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <span className="p-1.5 bg-yellow-50 rounded-md">📅</span>
                                                        <span className="font-semibold">{formatDate(booking.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <span className="p-1.5 bg-yellow-50 rounded-md">🕐</span>
                                                        <span className="font-semibold">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-center items-end gap-3 min-w-[200px]">
                                                {calculateTimeLeft(booking.holdExpiresAt) !== 'Expired' ? (
                                                    <button
                                                        onClick={() => setSettlingBookingId(booking._id)}
                                                        className="w-full px-5 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border border-yellow-500 flex items-center justify-center gap-2"
                                                    >
                                                        <span>💳</span> Complete Payment
                                                    </button>
                                                ) : (
                                                    <span className="w-full px-5 py-3.5 bg-gray-200 text-gray-500 font-bold rounded-xl text-center shadow-inner">
                                                        Expired
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={cancellingId === booking._id}
                                                    className="w-full px-5 py-2.5 text-red-600 bg-white border border-red-200 font-bold rounded-xl hover:bg-red-50 hover:text-red-700 disabled:opacity-50 transition-all shadow-sm"
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
                )}

                {/* ─── CONFIRMED BOOKINGS ─── */}
                {(confirmedBookings.length > 0 || filterStatus === 'confirmed') && (
                    <div className="animate-in fade-in duration-500">
                        <h3 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                            ✅ Confirmed Bookings
                        </h3>
                        {confirmedBookings.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No confirmed bookings.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {confirmedBookings.map(booking => (
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
                                                </div>

                                                <p className="text-xs text-gray-400 mt-2 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                                                    ID: {booking._id}
                                                </p>
                                            </div>

                                            <div className="flex flex-col justify-center items-end gap-3 min-w-[200px]">
                                                {(booking as Booking & { changeRequest?: string }).changeRequest !== 'pending' && (
                                                    <button
                                                        onClick={() => setChangeRequestBookingId(booking._id)}
                                                        className="w-full px-5 py-2.5 bg-blue-50 text-blue-600 font-semibold border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        Request Change
                                                    </button>
                                                )}
                                                {(booking as Booking & { changeRequest?: string }).changeRequest === 'pending' && (
                                                    <span className="w-full px-5 py-2.5 bg-orange-50 text-orange-600 font-semibold border border-orange-200 rounded-xl text-center shadow-sm">
                                                        Change Requested
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleCancel(booking._id)}
                                                    disabled={cancellingId === booking._id}
                                                    className="w-full px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 font-semibold rounded-xl hover:bg-red-600 hover:text-white disabled:opacity-50 transition-all shadow-sm"
                                                >
                                                    {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── OTHER BOOKINGS (CANCELLED / EXPIRED) ─── */}
                {(otherBookings.length > 0 || ['cancelled', 'expired'].includes(filterStatus)) && (
                    <div className="animate-in fade-in duration-500 opacity-75">
                        <h3 className="text-xl font-extrabold text-gray-400 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
                            📁 Past Bookings
                        </h3>
                        {otherBookings.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No past bookings.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {otherBookings.map(booking => (
                                    <div
                                        key={booking._id}
                                        className="border border-gray-200 bg-gray-50/50 rounded-2xl p-5 sm:p-6 grayscale-[0.5]"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-5">
                                            <div className="flex-1 space-y-3">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-bold text-gray-500">{booking.facilityName}</h3>
                                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-600 border border-gray-300">
                                                        {(booking.status ?? 'unknown').replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-400 flex items-center gap-1.5">
                                                    <span className="text-lg opacity-50">🏛️</span> {booking.institution}
                                                </p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 bg-gray-100 rounded-xl p-4 border border-gray-200">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="p-1.5 bg-gray-200 rounded-md">📅</span>
                                                        <span className="font-semibold">{formatDate(booking.date)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <span className="p-1.5 bg-gray-200 rounded-md">🕐</span>
                                                        <span className="font-semibold">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-8 text-sm font-semibold text-gray-400 text-center bg-gray-50 py-2 rounded-xl">
                Showing {filtered.length} of {bookings.length} bookings
            </div>

            {/* Change Request Modal */}
            {changeRequestBookingId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
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
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitChangeRequest}
                                disabled={isSubmittingChange || !changeNote.trim()}
                                className="px-5 py-2 bg-[#112240] text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
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
