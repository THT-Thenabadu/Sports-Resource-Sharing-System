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
        };
    });

    return (
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Date</h2>

            {/* Quick date selection - next 7 days */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {quickDates.map(d => (
                    <button
                        key={d.value}
                        onClick={() => onDateSelect(d.value)}
                        className={`flex flex-col items-center min-w-[72px] px-3 py-2 rounded-xl border-2 transition-all ${
                            selectedDate === d.value
                                ? 'border-[#4a9ece] bg-[#edf5fa] text-[#1a2332]'
                                : 'border-gray-200 bg-white hover:border-[#4a9ece] text-gray-600'
                        }`}
                    >
                        <span className="text-xs font-medium">{d.dayName}</span>
                        <span className="text-xl font-bold">{d.dayNum}</span>
                        {d.label === 'Today' && (
                            <span className="text-[10px] font-medium text-[#4a9ece]">Today</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Full date picker for dates beyond 7 days */}
            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">Or pick a date:</span>
                <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    max={maxDateStr}
                    onChange={e => onDateSelect(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#4a9ece] focus:border-[#4a9ece]"
                />
            </div>

            {selectedDate && (
                <p className="mt-3 text-sm text-gray-600">
                    Selected: <span className="font-medium text-gray-800">
                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </span>
                </p>
            )}
        </div>
    );
}

