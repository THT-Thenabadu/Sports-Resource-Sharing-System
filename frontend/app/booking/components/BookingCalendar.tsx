'use client';

interface BookingCalendarProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export default function BookingCalendar({ selectedDate, onDateSelect }: BookingCalendarProps) {
    // Get today's date in YYYY-MM-DD format for the min attribute
    const today = new Date().toISOString().split('T')[0];

    // Max date = 30 days from now
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    const maxDateStr = maxDate.toISOString().split('T')[0];

    // Generate the next 7 days for quick selection
    const quickDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            value: d.toISOString().split('T')[0],
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
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                                isSelected
                                    ? 'border-[#112240] bg-[#112240] text-white shadow-lg shadow-gray-900/20 scale-[1.03] ring-2 ring-offset-2 ring-[#112240]'
                                    : 'border-gray-200 bg-white hover:border-[#112240]/40 hover:-translate-y-1 hover:shadow-md hover:bg-gray-50'
                            }`}
                        >
                            {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                            )}
                            <span className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isSelected ? 'text-[#64FFDA]' : 'text-gray-500'}`}>
                                {d.dayName}
                            </span>
                            <span className={`text-2xl font-bold leading-none ${isSelected ? 'text-white' : 'text-[#112240]'}`}>
                                {d.dayNum}
                            </span>
                            <span className={`text-xs mt-1 font-medium ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                {d.monthName}
                            </span>

                            {d.label === 'Today' && !isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                            )}
                            {d.label === 'Today' && isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#64FFDA] shadow-[0_0_8px_rgba(100,255,218,0.8)]"></div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Full date picker for dates beyond 7 days */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-xl">🔍</span>
                    <label htmlFor="custom-date" className="text-sm font-semibold text-gray-700">Need another date?</label>
                </div>
                <div className="flex-1 max-w-xs relative">
                    <input
                        id="custom-date"
                        type="date"
                        value={selectedDate}
                        min={today}
                        max={maxDateStr}
                        onChange={e => onDateSelect(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#112240] focus:border-[#112240] shadow-sm transition-all"
                    />
                </div>
            </div>

            {selectedDate && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-green-800 animate-in slide-in-from-bottom-2">
                    <span className="text-green-500">✓</span>
                    <p className="text-sm font-medium">
                        Selected: <span className="font-bold">
                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
