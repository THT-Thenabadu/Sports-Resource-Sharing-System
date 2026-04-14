'use client';

import { useEffect, useState } from 'react';
import { TimeSlot, SlotResponse } from '../types';
import { getAvailableSlots } from '../services/bookingApi';

interface TimeSlotGridProps {
    facilityId: string;
    facilityName: string;
    date: string;
    onSlotSelect: (slot: TimeSlot) => void;
    selectedSlot?: TimeSlot | null;
}

export default function TimeSlotGrid({ facilityId, facilityName, date, onSlotSelect, selectedSlot }: TimeSlotGridProps) {
    const [slotData, setSlotData] = useState<SlotResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSlots();
    }, [facilityId, date]);

    async function loadSlots() {
        try {
            setLoading(true);
            setError('');
            const data = await getAvailableSlots(facilityId, date);
            setSlotData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load time slots');
        } finally {
            setLoading(false);
        }
    }

    // Convert "14:00" to "2:00 PM"
    function formatTime(time24: string): string {
        const [h, m] = time24.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-[#112240] mb-4"></div>
                <span className="text-gray-500 font-medium">Checking available slots...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 max-w-xl mx-auto text-center shadow-sm">
                <p className="font-semibold text-lg">Oops! Something went wrong</p>
                <p className="text-sm mt-1">{error}</p>
                <button onClick={loadSlots} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    if (!slotData || slotData.slots.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-amber-800 text-center shadow-sm">
                <span className="text-4xl mb-3 block">⚠️</span>
                <h3 className="font-bold text-lg mb-1">No Slots Available</h3>
                <p className="font-medium text-amber-700">All slots for this facility on the selected date are fully booked or unavailable.</p>
            </div>
        );
    }

    const availableCount = slotData.slots.filter(s => s.status === 'available').length;
    const totalCount = slotData.slots.length;
    const is4HourSlot = slotData.facility.slotDuration === 4;

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
                <h2 className="text-2xl font-bold text-[#112240] flex items-center gap-2">
                    <span className="text-3xl">⏰</span> Select a Time Slot
                </h2>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 shadow-inner">
                    <span className={`w-2 h-2 rounded-full mr-2 ${availableCount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {availableCount} of {totalCount} slots available
                </span>
            </div>

            {/* Slot info banner */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-100 rounded-2xl p-5 mb-8 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                    <span className="text-xl">ℹ️</span>
                </div>
                <p className="text-sm text-blue-900 font-medium">
                    <strong className="text-[#112240] text-base">{facilityName}</strong> operates using{' '}
                    <span className="px-2.5 py-1 rounded-md bg-blue-200/70 text-blue-900 font-extrabold mx-1 shadow-sm">{slotData.facility.slotDuration}-HOURS</span>{' '}
                    time slots.
                </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-5 mb-6 text-sm font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-white border-2 border-gray-200 shadow-sm"></div>
                    <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-yellow-100 border-2 border-yellow-200"></div>
                    <span className="text-yellow-700">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-gray-100 border-2 border-gray-200 opacity-60"></div>
                    <span className="text-gray-400">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-red-100 border-2 border-red-200 opacity-80"></div>
                    <span className="text-red-600">Blocked</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-[#112240] border-2 border-[#112240] shadow-sm ring-2 ring-[#64FFDA]/30"></div>
                    <span className="text-gray-900">Selected</span>
                </div>
            </div>

            {/* Time Slot Grid */}
            <div className={`grid gap-3 sm:gap-4 ${is4HourSlot ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
                {slotData.slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
                    const isAvailable = slot.status === 'available';

                    return (
                        <button
                            key={`${slot.startTime}-${slot.endTime}`}
                            onClick={() => isAvailable && onSlotSelect(slot)}
                            disabled={!isAvailable}
                            className={`
                                group relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 text-center overflow-hidden
                                ${isSelected
                                    ? 'border-[#112240] bg-[#112240] text-white shadow-xl shadow-gray-900/20 scale-[1.05] ring-4 ring-[#64FFDA]/30 ring-offset-1 z-10'
                                    : isAvailable
                                        ? 'border-transparent bg-white text-gray-800 hover:border-[#112240]/40 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                                        : slot.status === 'in_progress'
                                            ? 'border-yellow-200/50 bg-yellow-50/50 text-yellow-700/60 cursor-not-allowed'
                                            : slot.status === 'blocked'
                                                ? 'border-red-200/50 bg-red-50/50 text-red-700/60 cursor-not-allowed'
                                                : 'border-transparent bg-gray-50/50 text-gray-400 cursor-not-allowed'
                                }
                                ${is4HourSlot ? 'py-8' : ''}
                            `}
                        >
                            {/* Animated background gradient for selection */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-[#112240] to-gray-900 transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>

                            {/* Hover shimmer effect */}
                            {isAvailable && !isSelected && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-gray-50 to-transparent transition-opacity duration-300"></div>
                            )}

                            <div className={`relative z-10 font-black tracking-tight transition-colors duration-300 ${is4HourSlot ? 'text-2xl' : 'text-lg'} ${isSelected ? 'text-white' : isAvailable ? 'text-[#112240] group-hover:text-blue-900' : ''}`}>
                                {formatTime(slot.startTime)}
                            </div>
                            <div className={`relative z-10 transition-colors duration-300 uppercase tracking-widest mt-1.5 ${isSelected ? 'text-[#64FFDA] font-bold' : isAvailable ? 'text-gray-400 font-semibold group-hover:text-gray-500' : ''} ${is4HourSlot ? 'text-sm' : 'text-[10px]'}`}>
                                to {formatTime(slot.endTime)}
                            </div>

                            {slot.status !== 'available' && !isSelected && (
                                <div className={`absolute inset-0 flex items-center justify-center ${slot.status === 'in_progress' ? 'bg-amber-100/40' : slot.status === 'blocked' ? 'bg-red-100/60' : 'bg-gray-100/50'} backdrop-blur-[1px]`}>
                                    <div className={`px-3 py-1.5 ${slot.status === 'in_progress' ? 'bg-amber-300 text-amber-900' : slot.status === 'blocked' ? 'bg-red-300 text-red-900' : 'bg-gray-200 text-gray-500'} text-[10px] font-extrabold rounded bg-opacity-90 uppercase tracking-widest shadow-sm transform -rotate-12`}>
                                        {slot.status === 'in_progress' ? 'Holding' : slot.status === 'blocked' ? 'Blocked' : 'Booked'}
                                    </div>
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#64FFDA] shadow-[0_0_12px_rgba(100,255,218,1)]"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
