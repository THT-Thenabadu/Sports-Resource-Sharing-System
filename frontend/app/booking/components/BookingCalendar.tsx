'use client';
import {useState} from "react";
import {useEffect} from "react";

interface BookingCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    facilityInstitution?: string;
}

export default function BookingCalendar({ selectedDate, onDateSelect, facilityInstitution }: BookingCalendarProps) {
    const getLocalDateString = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [maxDays, setMaxDays] = useState<number>(5);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr && facilityInstitution) {
                    const user = JSON.parse(userStr);
                    if (
                        user.institution && 
                        user.institution.trim().toLowerCase() === facilityInstitution.trim().toLowerCase()
                    ) {
                        setMaxDays(7);
                    }
                }
            } catch (e) {
                console.error("Could not parse user from local storage", e);
            }
        }
    }, [facilityInstitution]);

    // Get today's date in local YYYY-MM-DD format for the min attribute
    const today = getLocalDateString(new Date());

    // Max date based on institution
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDays);
    const maxDateStr = getLocalDateString(maxDate);

    // Generate the next `maxDays` days for quick selection
    const quickDates = Array.from({ length: maxDays }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            value: getLocalDateString(d),
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        };
    });

    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#112240] mb-6 flex items-center gap-2">
                <span className="text-3xl">📅</span> Select a Date
            </h2>

            {/* Quick date selection - next 7 days */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-8">
                {quickDates.map(d => {
                    const isSelected = selectedDate === d.value;
                    return (
                        <button
                            key={d.value}
                            onClick={() => onDateSelect(d.value)}
                            className={`group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                                isSelected
                                    ? 'border-[#112240] bg-[#112240] ring-4 ring-[#64FFDA]/30 ring-offset-1 text-white shadow-xl scale-[1.05] z-10'
                                    : 'border-transparent bg-white hover:border-[#112240]/40 shadow-sm hover:shadow-lg hover:-translate-y-1'
                            }`}
                        >
                            {/* Animated background gradient for selection */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-[#112240] to-gray-900 transition-opacity duration-500 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></div>

                            {/* Hover shimmer effect */}
                            {!isSelected && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-gray-50 to-transparent transition-opacity duration-300"></div>
                            )}

                            <span className={`relative z-10 text-xs font-extrabold uppercase tracking-widest mb-1 transition-colors duration-300 ${isSelected ? 'text-[#64FFDA]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                {d.dayName}
                            </span>
                            <span className={`relative z-10 text-3xl font-black leading-none my-1 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-[#112240] group-hover:text-blue-900'}`}>
                                {d.dayNum}
                            </span>
                            <span className={`relative z-10 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${isSelected ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                {d.monthName}
                            </span>

                            {d.label === 'Today' && !isSelected && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            )}
                            {d.label === 'Today' && isSelected && (
                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#64FFDA] shadow-[0_0_10px_rgba(100,255,218,1)]"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Full date picker for dates beyond quick selection */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#64FFDA] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-4 pl-2">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-xl">🔍</div>
                    <div>
                        <label htmlFor="custom-date" className="block text-sm font-bold text-[#112240]">Need a futuristic date?</label>
                        <p className="text-xs font-medium text-gray-500">Book up to {maxDays} days in advance based on your institution.</p>
                    </div>
                </div>
                <div className="flex-1 max-w-sm sm:w-auto mt-2 sm:mt-0 relative ml-auto">
                    <input
                        id="custom-date"
                        type="date"
                        value={selectedDate}
                        min={today}
                        max={maxDateStr}
                        onChange={e => onDateSelect(e.target.value)}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-bold text-[#112240] focus:ring-4 focus:ring-[#64FFDA]/20 focus:border-[#112240] shadow-inner transition-all outline-none"
                    />
                </div>
            </div>

            {selectedDate && (
                <div className="mt-8 flex items-center gap-4 p-5 bg-[#112240] rounded-2xl text-white animate-in slide-in-from-bottom-4 relative overflow-hidden shadow-lg shadow-gray-900/10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#64FFDA] opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 pointer-events-none"></div>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <span className="text-[#64FFDA] text-lg">✓</span>
                    </div>
                    <div>
                        <p className="text-xs text-[#64FFDA] font-bold uppercase tracking-widest mb-1">Target Date Locked</p>
                        <p className="text-sm font-medium">
                            <span className="font-bold text-lg tracking-wide">
                                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
