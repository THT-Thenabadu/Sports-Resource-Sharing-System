'use client';

import { useState } from 'react';
import { Facility, TimeSlot, BookingStep, CreateBookingResponse } from './types';
import FacilitySelector from './components/FacilitySelector';
import BookingCalendar from './components/BookingCalendar';
import TimeSlotGrid from './components/TimeSlotGrid';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import BookingList from './components/BookingList';
import PaymentStep from './components/PaymentStep';

/**
 * Smart Slot-Booking Engine — Main Page
 *
 * This page manages the booking flow as a multi-step wizard:
 * 1. Select Facility → 2. Pick Date → 3. Choose Time Slot → 4. Confirm → 5. Success
 *
 * Think of this like a Spring MVC controller — it manages the state and
 * decides which "view" (component) to render based on the current step.
 */
export default function BookingPage() {
    // ─── Booking Flow State ───
    const [currentStep, setCurrentStep] = useState<BookingStep>('select-facility');
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [bookingId, setBookingId] = useState<string>('');
    const [showBookingList, setShowBookingList] = useState(false);
    // const [paymentMeta, setPaymentMeta] = useState<{
    //     intentId: string;
    //     amountLkr: number;
    //     currency: string;
    //     expiresAt: string;
    // } | null>(null);

    // ─── Step Navigation Handlers ───
    function handleFacilitySelect(facility: Facility) {
        setSelectedFacility(facility);
        setSelectedDate('');
        setSelectedSlot(null);
        setCurrentStep('select-date');
    }

    function handleDateSelect(date: string) {
        setSelectedDate(date);
        setSelectedSlot(null);
        setCurrentStep('select-slot');
    }

    function handleSlotSelect(slot: TimeSlot) {
        setSelectedSlot(slot);
        setCurrentStep('confirm');
    }

    function handleBookingSuccess(payload: CreateBookingResponse) {
        setBookingId(payload._id);
        setCurrentStep('payment');
    }


    function handlePaymentSuccess(id: string) {
        setBookingId(id);
        setCurrentStep('success');
    }

    function resetBooking() {
        setCurrentStep('select-facility');
        setSelectedFacility(null);
        setSelectedDate('');
        setSelectedSlot(null);
        setBookingId('');
        setShowBookingList(false);

    }

    // ─── Step indicator data ───
    const steps = [
        { key: 'select-facility', label: 'Facility', number: 1 },
        { key: 'select-date', label: 'Date', number: 2 },
        { key: 'select-slot', label: 'Time Slot', number: 3 },
        { key: 'confirm', label: 'Confirm', number: 4 },
        { key: 'payment', label: 'Payment', number: 5 },
    ];

    const currentStepIndex = steps.findIndex(s => s.key === currentStep);

    // ─── Show Booking List View ───
    if (showBookingList) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <BookingList onBack={() => setShowBookingList(false)} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-[#112240]">Smart Slot-Booking Engine</h1>
                        <p className="text-sm text-gray-500 mt-1">Sports Resource Sharing System</p>
                    </div>
                    <button
                        onClick={() => setShowBookingList(true)}
                        className="px-5 py-2.5 text-sm bg-white border border-gray-200 text-[#112240] rounded-xl hover:bg-gray-50 hover:border-[#112240] transition-all font-medium shadow-sm flex items-center gap-2"
                    >
                        📋 <span>My Bookings</span>
                    </button>
                </div>

                <div>
                    {/* Step Progress Indicator */}
                    {currentStep !== 'success' && (
                        <div className="mb-10">
                            <div className="flex items-center justify-between max-w-2xl mx-auto">
                                {steps.map((step, i) => (
                                    <div key={step.key} className="flex items-center w-full first:w-auto">
                                        <div className="flex flex-col items-center relative z-10">
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm
                                                ${i < currentStepIndex
                                                    ? 'bg-[#112240] text-white'
                                                    : i === currentStepIndex
                                                        ? 'bg-[#64FFDA] text-[#112240] ring-4 ring-[#64FFDA]/20'
                                                        : 'bg-white text-gray-400 border border-gray-200'
                                                }
                                            `}>
                                                {i < currentStepIndex ? '✓' : step.number}
                                            </div>
                                            <span className={`text-xs mt-3 absolute top-10 whitespace-nowrap ${
                                                i <= currentStepIndex ? 'text-[#112240] font-semibold' : 'text-gray-400 font-medium'
                                            }`}>
                                                {step.label}
                                            </span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-300 ${
                                                i < currentStepIndex ? 'bg-[#112240]' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Selected Info Bar — shows what's been selected so far */}
                    {selectedFacility && currentStep !== 'select-facility' && currentStep !== 'success' && (
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-8 flex flex-wrap items-center gap-3 text-sm shadow-sm mt-8">
                            <button
                                onClick={resetBooking}
                                className="text-[#112240] hover:text-gray-600 font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                ← Start Over
                            </button>
                            <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                            <span className="text-gray-600 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-50 rounded-md">🏢</span>
                                <span className="font-semibold text-gray-900">{selectedFacility.name}</span>
                                <span className="text-gray-400 hidden sm:inline"> @ {selectedFacility.institution}</span>
                            </span>
                            {selectedDate && (
                                <>
                                    <span className="text-gray-300">›</span>
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <span className="p-1.5 bg-green-50 rounded-md">📅</span>
                                        <span className="font-semibold text-gray-900">
                                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                                month: 'short', day: 'numeric'
                                            })}
                                        </span>
                                    </span>
                                </>
                            )}
                            {selectedSlot && (
                                <>
                                    <span className="text-gray-300">›</span>
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <span className="p-1.5 bg-purple-50 rounded-md">🕐</span>
                                        <span className="font-semibold text-gray-900">{selectedSlot.startTime} – {selectedSlot.endTime}</span>
                                    </span>
                                </>
                            )}
                        </div>
                    )}

                    {/* Main Content Area — render current step */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6 sm:p-10">
                        {currentStep === 'select-facility' && (
                            <FacilitySelector
                                onSelect={handleFacilitySelect}
                                selectedFacilityId={selectedFacility?._id}
                            />
                        )}

                        {currentStep === 'select-date' && (
                            <BookingCalendar
                                selectedDate={selectedDate}
                                onDateSelect={handleDateSelect}
                            />
                        )}

                        {currentStep === 'select-slot' && selectedFacility && selectedDate && (
                            <div className="space-y-8">
                                <TimeSlotGrid
                                    facilityId={selectedFacility._id}
                                    facilityName={selectedFacility.name}
                                    date={selectedDate}
                                    onSlotSelect={handleSlotSelect}
                                    selectedSlot={selectedSlot}
                                />
                                {selectedSlot && (
                                    <div className="flex justify-end pt-6 border-t border-gray-100">
                                        <button
                                            onClick={() => setCurrentStep('confirm')}
                                            className="px-8 py-3.5 bg-[#112240] text-white rounded-xl hover:bg-gray-800 transition-all font-semibold shadow-md shadow-gray-900/10 flex items-center gap-2"
                                        >
                                            Continue to Confirm <span>→</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {currentStep === 'confirm' && selectedFacility && selectedSlot && (
                            <BookingForm
                                facility={selectedFacility}
                                date={selectedDate}
                                slot={selectedSlot}
                                onSuccess={handleBookingSuccess}
                                onCancel={() => setCurrentStep('select-slot')}
                            />
                        )}

                        {currentStep === 'payment' && bookingId && (
                            <PaymentStep
                                bookingId={bookingId}
                                onPaid={handlePaymentSuccess}
                                onBack={() => setCurrentStep('confirm')}
                                onExpired={() => setCurrentStep('select-slot')}
                            />
                        )}


                        {currentStep === 'success' && (
                            <BookingConfirmation
                                bookingId={bookingId}
                                onNewBooking={resetBooking}
                                onViewBookings={() => {
                                    resetBooking();
                                    setShowBookingList(true);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
