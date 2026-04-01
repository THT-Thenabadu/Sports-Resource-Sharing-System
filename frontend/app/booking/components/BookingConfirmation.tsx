'use client';

interface BookingConfirmationProps {
    bookingId: string;
    onNewBooking: () => void;
    onViewBookings: () => void;
}

export default function BookingConfirmation({ bookingId, onNewBooking, onViewBookings }: BookingConfirmationProps) {
    return (
        <div className="text-center py-10 max-w-lg mx-auto animate-in zoom-in-95 duration-500">
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 mb-8 shadow-sm">
                <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></div>
                <svg className="w-12 h-12 text-green-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>

            <h2 className="text-3xl font-extrabold text-[#112240] mb-3">Booking Confirmed! 🎉</h2>
            <p className="text-gray-600 mb-2 font-medium text-lg">Your slot has been successfully reserved.</p>

            <div className="inline-block bg-gray-50 border border-gray-200 rounded-xl px-6 py-3 mb-10 shadow-sm mt-2">
                <span className="text-sm text-gray-500 uppercase tracking-widest font-semibold block mb-1">Booking ID</span>
                <span className="font-mono text-gray-900 font-bold text-lg tracking-wider">{bookingId}</span>
            </div>

            <div className="bg-[#112240] text-left rounded-2xl p-6 mb-10 shadow-xl shadow-gray-900/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#64FFDA] opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
                <div className="flex items-start gap-4 relative z-10">
                    <div className="p-3 bg-white/10 rounded-xl text-2xl">🎟️</div>
                    <div>
                        <h3 className="font-bold text-[#64FFDA] mb-1.5 text-lg">What&apos;s Next?</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            A digital entry pass is generated for your booking. Please present it or your matching Booking ID at the security gate upon arrival. Use <strong className="text-white font-semibold">My Bookings</strong> to view details.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                    onClick={onNewBooking}
                    className="px-8 py-3.5 bg-[#112240] text-white rounded-xl hover:bg-gray-800 transition-all font-semibold shadow-md shadow-gray-900/10 hover:-translate-y-0.5"
                >
                    Book Another Slot
                </button>
                <button
                    onClick={onViewBookings}
                    className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 bg-white rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all font-semibold"
                >
                    View My Bookings
                </button>
            </div>
        </div>
    );
}
