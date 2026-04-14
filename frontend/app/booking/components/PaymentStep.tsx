'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
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
    const [now, setNow] = useState(Date.now()); // State to trigger re-render every second

    // Card Details State
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);

    const cardNumberRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setAuthToken(token);
        } else {
            setError('Authentication token not found. Please log in.');
        }
    }, [bookingId]);

    // This effect runs a timer every second to update the 'now' state
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
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
        const diff = Math.floor((new Date(status.holdExpiresAt).getTime() - now) / 1000);
        return Math.max(diff, 0);
    }, [status?.holdExpiresAt, now]);

    const timerDisplay = useMemo(() => {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [secondsLeft]);

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

    const handleScanCard = () => {
        if (cardNumberRef.current) {
            cardNumberRef.current.focus();
            // Give a helpful hint if they're likely on a desktop where native scanning isn't always built-in
            if (typeof navigator !== 'undefined' && !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                alert("Camera card scanning is natively supported on mobile devices (iOS/Android). On desktop, your browser may offer to autofill saved cards instead.");
            }
        }
    };

    const handleCard = async () => {
        if (!authToken) return setError('You are not authenticated.');

        // Basic validation for the visual form
        if (cardNumber.replace(/\s/g, '').length < 15) return setError('Please enter a valid card number.');
        if (!cardName.trim()) return setError('Please enter the name on the card.');
        if (cardExpiry.length < 5) return setError('Please enter a valid expiry date.');
        if (cardCvc.length < 3) return setError('Please enter a valid CVC.');

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
                            <p className="font-bold text-2xl text-orange-400 font-mono tracking-tighter">{timerDisplay}</p>
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
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* CSS Credit Card Graphic */}
                        <div className="relative w-full max-w-[340px] h-[210px] mx-auto perspective-1000 transition-transform duration-700 ease-in-out cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                            <div className={`w-full h-full relative preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>

                                {/* Card Front */}
                                <div className="absolute w-full h-full backface-hidden rounded-2xl p-6 text-white overflow-hidden shadow-2xl flex flex-col justify-between"
                                     style={{ background: 'linear-gradient(135deg, #112240 0%, #1a365d 100%)' }}>
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#64FFDA] opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="bg-white/20 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
                                            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                                <path d="M2 10h20" />
                                            </svg>
                                        </div>
                                        <div className="flex gap-1">
                                            <div className="w-8 h-8 rounded-full bg-red-500/80 mix-blend-multiply"></div>
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/80 mix-blend-multiply -ml-4"></div>
                                        </div>
                                    </div>

                                    <div className="relative z-10 w-full mt-4">
                                        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1 font-bold">Card Number</p>
                                        <p className="text-2xl tracking-[0.2em] font-mono font-bold text-white whitespace-pre text-shadow-sm min-h-[32px]">
                                            {cardNumber || '**** **** **** ****'}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end relative z-10 mt-2">
                                        <div className="flex-1 overflow-hidden pr-4">
                                            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5 font-bold">Card Holder</p>
                                            <p className="font-semibold tracking-wider uppercase text-white truncate text-sm min-h-[20px]">
                                                {cardName || 'YOUR NAME'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5 font-bold">Expires</p>
                                            <p className="font-semibold tracking-wider font-mono text-white text-sm min-h-[20px]">
                                                {cardExpiry || 'MM/YY'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Back */}
                                <div className="absolute w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-2xl rotate-y-180"
                                     style={{ background: 'linear-gradient(135deg, #1a365d 0%, #112240 100%)' }}>
                                    <div className="w-full h-12 bg-black mt-6 opacity-80 shadow-inner"></div>
                                    <div className="px-6 mt-4">
                                        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1 text-right font-bold pr-2">CVC</p>
                                        <div className="w-full bg-white h-10 rounded text-right pr-4 flex items-center justify-end shadow-inner">
                                            <span className="font-mono text-black text-lg italic tracking-widest">{cardCvc || '***'}</span>
                                        </div>
                                        <p className="text-gray-500 text-[8px] mt-4 text-center">This card is for visual demonstration purposes only.</p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Interactive Card Form */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2 relative">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Card Number</label>
                                    <button
                                        type="button"
                                        onClick={handleScanCard}
                                        className="text-xs font-bold text-[#64FFDA] bg-[#112240] px-2 py-1 rounded shadow hover:bg-gray-800 transition-colors flex items-center gap-1"
                                    >
                                        <span>📷</span> Scan Card
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    name="cardnumber"
                                    autoComplete="cc-number"
                                    ref={cardNumberRef}
                                    maxLength={19}
                                    placeholder="0000 0000 0000 0000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-shadow font-mono text-lg outline-none"
                                    value={cardNumber}
                                    onFocus={() => setIsFlipped(false)}
                                    onChange={(e) => {
                                        let val = e.target.value.replace(/\D/g, '');
                                        val = val.replace(/(.{4})/g, '$1 ').trim();
                                        setCardNumber(val);
                                    }}
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Name on Card</label>
                                <input
                                    type="text"
                                    name="ccname"
                                    autoComplete="cc-name"
                                    placeholder="e.g. John Doe"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-shadow uppercase font-medium outline-none"
                                    value={cardName}
                                    onFocus={() => setIsFlipped(false)}
                                    onChange={(e) => setCardName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">Expiry</label>
                                    <input
                                        type="text"
                                        name="cc-exp"
                                        autoComplete="cc-exp"
                                        maxLength={5}
                                        placeholder="MM/YY"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-shadow font-mono text-center outline-none"
                                        value={cardExpiry}
                                        onFocus={() => setIsFlipped(false)}
                                        onChange={(e) => {
                                            let val = e.target.value.replace(/\D/g, '');
                                            if (val.length >= 2) val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                                            setCardExpiry(val);
                                        }}
                                    />
                                </div>
                                <div className="relative">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 ml-1">CVC</label>
                                    <input
                                        type="text"
                                        name="cvc"
                                        autoComplete="cc-csc"
                                        maxLength={4}
                                        placeholder="123"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#112240] focus:border-[#112240] transition-shadow font-mono text-center outline-none"
                                        value={cardCvc}
                                        onFocus={() => setIsFlipped(true)}
                                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <button
                                type="button"
                                onClick={handleCard}
                                disabled={loading}
                                className="w-full px-6 py-4 bg-[#112240] text-white font-bold text-lg rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:ring-4 focus:ring-[#112240]/30 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                                ) : (
                                    <>Pay {status?.paymentStatus === 'partial' ? 'Remaining' : 'Now'} <span className="text-[#64FFDA]">→</span></>
                                )}
                            </button>
                            <p className="text-xs text-center text-gray-400 font-medium mt-4 uppercase tracking-widest flex items-center justify-center gap-1.5">
                                <span className="text-base text-gray-500">🔒</span> Secured via highly encrypted endpoint
                            </p>
                        </div>
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
