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

    const refresh = async () => {
        try {
            const data = await getSharedStatus(bookingId);
            setStatus(data);

            if (data.bookingStatus === 'confirmed') onPaid(bookingId);
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
        setLoading(true);
        setError('');
        try {
            await payBookingByCard(bookingId);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Card payment failed');
        } finally {
            setLoading(false);
        }
    };

    const handleOnsite = async () => {
        setLoading(true);
        setError('');
        try {
            await payBookingOnsite(bookingId);
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'On-site selection failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePayShare = async (shareIndex: number) => {
        setLoading(true);
        setError('');
        try {
            await paySharedShare(bookingId, shareIndex, {});
            await refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : `Share ${shareIndex} payment failed`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Complete Payment</h2>

            <div className="bg-[#f8f9fb] rounded-xl p-5 mb-6 border border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-mono text-gray-800">{bookingId}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Booking Status</span>
                    <span className="font-medium text-gray-800">{status?.bookingStatus || 'loading...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-medium text-gray-800">{status?.paymentStatus || 'loading...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pay Before</span>
                    <span className="font-medium text-orange-700">{expiresAtLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time Left</span>
                    <span className="font-semibold text-[#1a2332]">{secondsLeft}s</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-4">
                    {error}
                </div>
            )}

            {status?.paymentMethod === 'card' && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={handleCard}
                        disabled={loading}
                        className="w-full px-4 py-2.5 bg-[#1a2332] text-white rounded-lg hover:bg-[#2a3a4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Processing...' : 'Confirm & Pay via Card'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Clicking this will simulate a successful card payment.</p>
                </div>
            )}

            {status?.paymentMethod === 'onsite' && (
                <div className="mb-4">
                    <button
                        type="button"
                        onClick={handleOnsite}
                        disabled={loading}
                        className="w-full px-4 py-2.5 bg-[#1a2332] text-white rounded-lg hover:bg-[#2a3a4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Processing...' : 'Confirm Booking (Pay On-site)'}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">Your booking will be confirmed immediately. Please pay at the facility.</p>
                </div>
            )}

            {status?.paymentMethod === 'shared' && (status?.totalShares || 0) > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                    <p className="text-sm border-b pb-2 font-medium text-gray-700 mb-3">
                        Shared Payment Allocation ({status?.paidShares || 0}/{status?.totalShares || 0} paid)
                    </p>
                    <div className="flex flex-col gap-2">
                        {status?.sharedPayments?.map((s) => (
                            <div key={s.shareIndex} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Share #{s.shareIndex}</span>
                                <button
                                    type="button"
                                    disabled={loading || s.status === 'paid'}
                                    onClick={() => handlePayShare(s.shareIndex)}
                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                        s.status === 'paid' 
                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                            : 'bg-[#1a2332] text-white hover:bg-[#2a3a4e] disabled:opacity-50 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {s.status === 'paid' ? 'Paid ✓' : 'Pay This Share'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3 text-center">Booking will be confirmed once all shares are paid.</p>
                </div>
            )}

            {/* Fallback if paymentMethod is unknown or loading */}
            {!status?.paymentMethod && !loading && status && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <button
                        type="button"
                        onClick={handleCard}
                        disabled={loading}
                        className="px-4 py-2.5 bg-[#1a2332] text-white rounded-lg hover:bg-[#2a3a4e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Processing...' : 'Card Payment'}
                    </button>

                    <button
                        type="button"
                        onClick={handleOnsite}
                        disabled={loading}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        On-site Payment
                    </button>
                </div>
            )}

            <button
                type="button"
                onClick={onBack}
                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
                Back
            </button>
        </div>
    );
}

