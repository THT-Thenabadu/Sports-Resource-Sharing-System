'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    getSharedStatus,
    payBookingByCard,
    payBookingOnsite,
    paySharedShare,
} from '../services/bookingApi';

interface PaymentStepProps {
    bookingId: string;
    onPaid: (bookingId: string) => void;
    onBack: () => void;
    onExpired?: () => void;
}

type SharedItem = {
    shareIndex: number;
    status: 'pending' | 'paid' | 'expired';
};

type SharedStatusResponse = {
    bookingStatus: 'pending_payment' | 'confirmed' | 'expired' | 'cancelled';
    paymentStatus: 'unpaid' | 'partial' | 'paid' | 'failed' | 'expired';
    paymentMethod?: 'card' | 'onsite' | 'shared';
    holdExpiresAt?: string;
    totalShares?: number;
    paidShares?: number;
    sharedPayments?: SharedItem[];
};

export default function PaymentStep({
                                        bookingId,
                                        onPaid,
                                        onBack,
                                        onExpired,
                                    }: PaymentStepProps) {
    const [status, setStatus] = useState<SharedStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authToken, setAuthToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
        } else {
            setError('Authentication token not found. Please log in.');
        }
    }, []);

    const refresh = async () => {
        try {
            const data = await getSharedStatus(bookingId);
            setStatus(data);

            if (data.bookingStatus === 'confirmed' && status?.bookingStatus !== 'confirmed') {
                onPaid(bookingId);
            }
            if (data.bookingStatus === 'expired') onExpired?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch payment status');
        }
    };

    useEffect(() => {
        refresh();
        const timer = setInterval(refresh, 5000);
        return () => clearInterval(timer);
    }, [bookingId]);

    const secondsLeft = useMemo(() => {
        if (!status?.holdExpiresAt) return 0;
        const diff = Math.floor((new Date(status.holdExpiresAt).getTime() - Date.now()) / 1000);
        return Math.max(diff, 0);
    }, [status?.holdExpiresAt]);

    const expiresAtLabel = useMemo(() => {
        if (!status?.holdExpiresAt) return 'N/A';
        const dt = new Date(status.holdExpiresAt);
        if (Number.isNaN(dt.getTime())) return status.holdExpiresAt;
        return dt.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }, [status?.holdExpiresAt]);

    useEffect(() => {
        if (secondsLeft === 0 && status?.bookingStatus === 'pending_payment') {
            onExpired?.();
        }
    }, [secondsLeft, status?.bookingStatus, onExpired]);

    const handleCard = async () => {
        if (!authToken) return setError('You are not authenticated.');
        setLoading(true);
        setError('');
        try {
            await payBookingByCard(bookingId, authToken);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Card payment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOnsite = async () => {
        if (!authToken) return setError('You are not authenticated.');
        setLoading(true);
        setError('');
        try {
            await payBookingOnsite(bookingId, authToken);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'On-site selection failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePayShare = async (shareIndex: number) => {
        if (!authToken) return setError('You are not authenticated.');
        setLoading(true);
        setError('');
        try {
            await paySharedShare(bookingId, shareIndex, {}, authToken);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : `Share ${shareIndex} payment failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#112240] mb-6 flex items-center gap-2">
                <span className="text-3xl">💳</span> Complete Payment
            </h2>

            <div className="bg-[#112240] rounded-2xl p-6 mb-6 text-white shadow-xl shadow-gray-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#64FFDA] opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                <h3 className="text-xs font-bold text-[#64FFDA] uppercase tracking-widest mb-4">Transaction Details</h3>

                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-300 text-sm">Booking ID</span>
                        <span className="font-mono text-white text-sm bg-black/20 px-2 py-1 rounded">{bookingId}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-300 text-sm">Booking Status</span>
                        <span className="font-semibold text-white uppercase text-xs tracking-wider">{(status?.bookingStatus || 'loading...').replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                        <span className="text-gray-300 text-sm">Payment Status</span>
                        <span className="font-semibold text-[#64FFDA] uppercase text-xs tracking-wider">{status?.paymentStatus || 'loading...'}</span>
                    </div>

                    <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-orange-200 text-xs font-semibold uppercase tracking-wider mb-1">Pay Before</p>
                            <p className="font-medium text-orange-400">{expiresAtLabel}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-orange-200 text-xs font-semibold uppercase tracking-wider mb-1">Time Left</p>
                            <p className="font-bold text-2xl text-orange-400 font-mono tracking-tighter">{secondsLeft}s</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-6 flex items-start gap-2 shadow-sm">
                    <span className="text-red-500">⚠️</span> {error}
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
                {status?.paymentMethod === 'card' && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">💳</div>
                        <button
                            type="button"
                            onClick={handleCard}
                            disabled={loading}
                            className="w-full px-6 py-3.5 bg-[#112240] text-white font-semibold rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-[#112240]/30 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                            ) : 'Confirm & Pay via Card'}
                        </button>
                        <p className="text-sm text-gray-500 font-medium">Clicking this will simulate a successful card payment.</p>
                    </div>
                )}

                {status?.paymentMethod === 'onsite' && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-2">💵</div>
                        <button
                            type="button"
                            onClick={handleOnsite}
                            disabled={loading}
                            className="w-full px-6 py-3.5 bg-[#112240] text-white font-semibold rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-[#112240]/30 disabled:opacity-70 transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                            ) : 'Confirm Booking (Pay On-site)'}
                        </button>
                        <p className="text-sm text-gray-500 font-medium">Your booking will be confirmed immediately. Please pay at the facility.</p>
                    </div>
                )}

                {status?.paymentMethod === 'shared' && (status?.totalShares || 0) > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-2">
                            <h4 className="font-bold text-gray-800">Shared Payment Allocation</h4>
                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold">
                                {status?.paidShares || 0} / {status?.totalShares || 0} Paid
                            </span>
                        </div>
                        <div className="flex flex-col gap-3">
                            {status?.sharedPayments?.map((s) => (
                                <div key={s.shareIndex} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-xl transition-colors hover:border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${s.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-white border-2 border-gray-200 text-gray-500'}`}>
                                            {s.shareIndex}
                                        </div>
                                        <span className="font-semibold text-gray-700">Share #{s.shareIndex}</span>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={loading || s.status === 'paid'}
                                        onClick={() => handlePayShare(s.shareIndex)}
                                        className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                                            s.status === 'paid' 
                                                ? 'bg-green-500 text-white shadow-green-500/20' 
                                                : 'bg-[#112240] text-white hover:bg-gray-800 hover:shadow-gray-900/20 border border-transparent disabled:opacity-50'
                                        }`}
                                    >
                                        {s.status === 'paid' ? 'Paid ✓' : 'Pay This Share'}
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium text-center mt-2 flex justify-center items-center gap-2">
                            <span className="text-xl">ℹ️</span> Booking will be confirmed once all shares are paid.
                        </div>
                    </div>
                )}

                {/* Fallback if paymentMethod is unknown or loading */}
                {!status?.paymentMethod && !loading && status && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={handleCard}
                            disabled={loading}
                            className="px-6 py-3.5 bg-[#112240] text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md"
                        >
                            {loading ? 'Processing...' : 'Card Payment'}
                        </button>

                        <button
                            type="button"
                            onClick={handleOnsite}
                            disabled={loading}
                            className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 bg-white font-semibold rounded-xl hover:bg-gray-50 transition-all"
                        >
                            On-site Payment
                        </button>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={onBack}
                className="w-full px-6 py-3.5 border-2 border-gray-200 text-gray-700 bg-white font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all flex justify-center items-center gap-2"
            >
                <span>←</span> Go Back
            </button>
        </div>
    );
}
