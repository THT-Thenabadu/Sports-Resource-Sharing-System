'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Facility, TimeSlot, CreateBookingResponse, PaymentMethod } from '../types';
import { createBookingWithHold } from '../services/bookingApi';

interface BookingFormProps {
    facility: Facility;
    date: string;
    slot: TimeSlot;
    onSuccess: (payload: CreateBookingResponse) => void;
    onCancel: () => void;
}

export default function BookingForm({ facility, date, slot, onSuccess, onCancel }: BookingFormProps)
{
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [totalShares, setTotalShares] = useState(4);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [authToken, setAuthToken] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // In a real app, you'd get this from a global state/context or secure cookie
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to make a booking. Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } else {
            setAuthToken(token);
        }
    }, [router]);

    // Convert "14:00" to "2:00 PM"
    function formatTime(time24: string): string {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    const price = facility.rates?.perHour ?? 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!authToken) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const bookingData = {
                facilityId: facility._id,
                date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                totalAmount: price,
                paymentMethod,
                shareEnabled: paymentMethod === 'shared',
                totalShares: paymentMethod === 'shared' ? totalShares : 0,
            };

            const result = await createBookingWithHold(bookingData, authToken);
            onSuccess(result);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Booking failed. The slot may have been taken. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#112240] mb-6 flex items-center gap-2">
                <span className="text-3xl">📋</span> Confirm Your Booking
            </h2>

            {/* Booking Summary */}
            <div className="bg-[#112240] rounded-2xl p-6 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#64FFDA] opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                <h3 className="text-xs font-bold text-[#64FFDA] uppercase tracking-widest mb-5">Booking Summary</h3>
                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <span className="text-gray-300 text-sm">Facility</span>
                        <span className="font-semibold text-white">{facility.name}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <span className="text-gray-300 text-sm">Institution</span>
                        <span className="font-semibold text-white">{facility.institution}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl">
                        <span className="text-gray-300 text-sm">Date & Time</span>
                        <div className="text-right">
                            <div className="font-medium text-white">{formattedDate}</div>
                            <div className="text-[#64FFDA] text-sm font-semibold">
                                {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/20 mt-4">
                        <span className="text-gray-300 font-medium">Total Amount</span>
                        <span className="font-bold text-2xl text-[#64FFDA]">
                            LKR {price.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-6">
                {/* Payment Method Selection */}
                <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['card', 'onsite', 'shared'].map((method) => (
                            <label
                                key={method}
                                className={`flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                    paymentMethod === method 
                                        ? 'border-[#112240] bg-[#112240]/5 text-[#112240] ring-1 ring-[#112240]' 
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                            >
                                <input
                                    type="radio"
                                    value={method}
                                    checked={paymentMethod === method}
                                    onChange={() => setPaymentMethod(method as PaymentMethod)}
                                    className="sr-only"
                                />
                                <span className="font-medium capitalize">{method.replace('onsite', 'On-site')}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {paymentMethod === 'shared' && (
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-2">
                        <label htmlFor="totalShares" className="block text-sm font-semibold text-orange-900 mb-2">
                            Number of Shares (2-10)
                        </label>
                        <input
                            type="number"
                            id="totalShares"
                            value={totalShares}
                            onChange={(e) => setTotalShares(parseInt(e.target.value, 10))}
                            className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            min="2"
                            max="10"
                        />
                        <p className="text-xs text-orange-700 mt-2 font-medium">✨ Cost per share: LKR {(price / totalShares).toFixed(2)}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                        <span className="text-red-500">⚠️</span>
                        {error}
                    </div>
                )}

                <div className="pt-6 flex gap-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !authToken}
                        className="flex-1 px-6 py-3.5 bg-[#112240] text-white font-semibold rounded-xl hover:bg-gray-900 focus:ring-4 focus:ring-[#112240]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-gray-900/10 flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Processing...</span>
                            </>
                        ) : (
                            'Proceed to Payment'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
