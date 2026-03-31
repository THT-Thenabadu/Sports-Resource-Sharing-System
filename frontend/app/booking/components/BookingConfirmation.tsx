'use client';

interface BookingConfirmationProps {
    bookingId: string;
    onNewBooking: () => void;
    onViewBookings: () => void;
}

export default function BookingConfirmation({ bookingId, onNewBooking, onViewBookings }: BookingConfirmationProps) {
    return (
        <div className="text-center py-8">
            {/* Success Animation */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-gray-600 mb-1">Your slot has been successfully reserved.</p>
            <p className="text-sm text-gray-400 mb-8">
                Booking ID: <span className="font-mono text-gray-600">{bookingId}</span>
            </p>

            <div className="bg-[#edf5fa] border border-[#b8d8ea] rounded-lg p-4 mb-8 text-sm text-[#1a2332]">
                <p className="font-medium mb-1">📋 What&apos;s Next?</p>
                <p>A digital entry pass will be generated for your booking. Please present it at the security gate upon arrival.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onNewBooking}
                    className="px-6 py-2.5 bg-[#1a2332] text-white rounded-lg hover:bg-[#2a3a4e] transition-colors font-medium"
                >
                    Make Another Booking
                </button>
                <button
                    onClick={onViewBookings}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    View My Bookings
                </button>
            </div>
        </div>
    );
}
