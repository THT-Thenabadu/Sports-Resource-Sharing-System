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
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 shadow-sm flex items-center gap-3">
                <span className="text-xl">ℹ️</span>
                <p className="text-sm text-blue-900 font-medium">
                    <span className="font-bold text-[#112240]">{facilityName}</span> uses{' '}
                    <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-bold mx-1">{slotData.facility.slotDuration}-hour</span> time slots.
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
                    <div className="w-5 h-5 rounded-md bg-[#112240] border-2 border-[#112240] shadow-sm ring-2 ring-[#64FFDA]/30"></div>
                    <span className="text-gray-900">Selected</span>
                </div>
            </div>

            {/* Time Slot Grid */}
            <div className={`grid gap-3 ${is4HourSlot ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'}`}>
                {slotData.slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
                    const isAvailable = slot.status === 'available';

                    return (
                        <button
                            key={`${slot.startTime}-${slot.endTime}`}
                            onClick={() => isAvailable && onSlotSelect(slot)}
                            disabled={!isAvailable}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all duration-300 text-center overflow-hidden
                                ${isSelected
                                    ? 'border-[#112240] bg-[#112240] text-white shadow-lg shadow-gray-900/20 scale-[1.02] ring-2 ring-offset-2 ring-[#112240]'
                                    : isAvailable
                                        ? 'border-gray-200 bg-white text-gray-800 hover:border-[#112240]/50 hover:shadow-md cursor-pointer hover:-translate-y-0.5'
                                        : slot.status === 'in_progress'
                                            ? 'border-yellow-200 bg-yellow-50 text-yellow-700 cursor-not-allowed opacity-80'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed opacity-70'
                                }
                                ${is4HourSlot ? 'py-6' : ''}
                            `}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 to-white/10 opacity-50"></div>
                            )}
                            <div className={`font-bold tracking-tight ${is4HourSlot ? 'text-xl' : 'text-base'}`}>
                                {formatTime(slot.startTime)}
                            </div>
                            <div className={`${isSelected ? 'text-[#64FFDA] font-semibold' : isAvailable ? 'text-gray-500 font-medium' : 'text-inherit'} ${is4HourSlot ? 'text-base' : 'text-xs'} mt-1`}>
                                to {formatTime(slot.endTime)}
                            </div>
                            {slot.status !== 'available' && !isSelected && (
                                <div className={`absolute inset-0 flex items-center justify-center ${slot.status === 'in_progress' ? 'bg-yellow-50/80' : 'bg-gray-50/80'} backdrop-blur-[1px]`}>
                                    <span className={`px-2 py-1 ${slot.status === 'in_progress' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-600'} text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm`}>
                                        {slot.status === 'in_progress' ? 'In Progress' : 'Booked'}
                                    </span>
                                </div>
                            )}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#64FFDA] shadow-[0_0_8px_rgba(100,255,218,0.8)]"></div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
