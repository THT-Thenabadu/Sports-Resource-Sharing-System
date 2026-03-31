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
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332]"></div>
                <span className="ml-3 text-gray-600">Loading available slots...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <button onClick={loadSlots} className="mt-2 text-sm underline hover:no-underline">
                    Try Again
                </button>
            </div>
        );
    }

    if (!slotData || slotData.slots.length === 0) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                <p>No time slots available for this facility on the selected date.</p>
            </div>
        );
    }

    const availableCount = slotData.slots.filter(s => s.available).length;
    const totalCount = slotData.slots.length;
    const is4HourSlot = slotData.facility.slotDuration === 4;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Select a Time Slot</h2>
                <span className="text-sm text-gray-500">
                    {availableCount} of {totalCount} slots available
                </span>
            </div>

            {/* Slot info banner */}
            <div className="bg-[#edf5fa] border border-[#b8d8ea] rounded-lg p-3 mb-4 text-sm text-[#1a2332]">
                <span className="font-medium">{facilityName}</span> uses{' '}
                <span className="font-bold">{slotData.facility.slotDuration}-hour</span> time slots
            </div>

            {/* Legend */}
            <div className="flex gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-400"></div>
                    <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                    <span className="text-gray-600">Booked</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded bg-[#1a2332] border-2 border-[#2a3a4e]"></div>
                    <span className="text-gray-600">Selected</span>
                </div>
            </div>

            {/* Time Slot Grid */}
            <div className={`grid gap-2 ${is4HourSlot ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
                {slotData.slots.map((slot) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;

                    return (
                        <button
                            key={`${slot.startTime}-${slot.endTime}`}
                            onClick={() => slot.available && onSlotSelect(slot)}
                            disabled={!slot.available}
                            className={`
                                relative p-3 rounded-lg border-2 transition-all duration-200 text-center
                                ${isSelected
                                    ? 'border-[#1a2332] bg-[#1a2332] text-white shadow-lg scale-105'
                                    : slot.available
                                        ? 'border-green-300 bg-green-50 text-green-800 hover:border-green-500 hover:shadow-md cursor-pointer'
                                        : 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60'
                                }
                                ${is4HourSlot ? 'py-5' : ''}
                            `}
                        >
                            <div className={`font-semibold ${is4HourSlot ? 'text-lg' : 'text-sm'}`}>
                                {formatTime(slot.startTime)}
                            </div>
                            <div className={`${isSelected ? 'text-gray-300' : slot.available ? 'text-green-600' : 'text-red-300'} ${is4HourSlot ? 'text-sm' : 'text-xs'}`}>
                                to {formatTime(slot.endTime)}
                            </div>
                            {!slot.available && (
                                <span className="absolute top-1 right-1 text-[10px] font-medium text-red-400">
                                    BOOKED
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

