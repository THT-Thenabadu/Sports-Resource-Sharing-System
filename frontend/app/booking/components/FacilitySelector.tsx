'use client';

import { useEffect, useState } from 'react';
import { Facility } from '../types';
import { getFacilities } from '../services/bookingApi';

// Map facility type to emoji icon
const typeIcons: Record<string, string> = {
    pool: '🏊',
    ground: '🏟️',
    court: '🏀',
    gym: '🏋️',
    track: '🏃',
};

// Map facility type to readable label
const typeLabels: Record<string, string> = {
    pool: 'Swimming Pool',
    ground: 'Ground',
    court: 'Court',
    gym: 'Gymnasium',
    track: 'Athletics Track',
};

interface FacilitySelectorProps {
    onSelect: (facility: Facility) => void;
    selectedFacilityId?: string;
}

export default function FacilitySelector({ onSelect, selectedFacilityId }: FacilitySelectorProps) {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [filterInstitution, setFilterInstitution] = useState<string>('');

    useEffect(() => {
        loadFacilities();
    }, []);

    async function loadFacilities() {
        try {
            setLoading(true);
            const data = await getFacilities({ status: 'available' });
            setFacilities(data);
        } catch {
            setError('Failed to load facilities. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }

    // Get unique institutions for the filter dropdown
    const institutions = [...new Set(facilities.map(f => f.institution))];
    const types = [...new Set(facilities.map(f => f.type))];

    // Apply filters
    const filtered = facilities.filter(f => {
        if (filterType && f.type !== filterType) return false;
        if (filterInstitution && f.institution !== filterInstitution) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a2332]"></div>
                <span className="ml-3 text-gray-600">Loading facilities...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 max-w-xl mx-auto text-center shadow-sm">
                <p className="font-semibold text-lg">Oops! Something went wrong</p>
                <p className="text-sm mt-1">{error}</p>
                <button onClick={loadFacilities} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#112240] mb-6 flex items-center gap-2">
                <span className="text-3xl">🏟️</span> Select a Facility
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Facility Type</label>
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#64FFDA] focus:border-[#112240] bg-white transition-shadow"
                    >
                        <option value="">All Types</option>
                        {types.map(t => (
                            <option key={t} value={t}>{typeLabels[t] || t}</option>
                        ))}
                    </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Institution</label>
                    <select
                        value={filterInstitution}
                        onChange={e => setFilterInstitution(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#64FFDA] focus:border-[#112240] bg-white transition-shadow"
                    >
                        <option value="">All Institutions</option>
                        {institutions.map(i => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Facility Cards Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="text-gray-500 font-medium">No facilities found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(facility => (
                        <button
                            key={facility._id}
                            onClick={() => onSelect(facility)}
                            className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                                selectedFacilityId === facility._id
                                    ? 'border-[#112240] bg-blue-50/50 shadow-lg shadow-blue-900/5'
                                    : 'border-gray-100 bg-white shadow-sm hover:border-[#112240]/30 hover:shadow-md'
                            }`}
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-3xl shadow-inner border border-gray-100">
                                        {typeIcons[facility.type] || '🏢'}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-1">
                                        <h3 className="font-bold text-[#112240] truncate text-lg">{facility.name}</h3>
                                        <p className="text-sm font-medium text-gray-500 mt-0.5">{facility.institution}</p>
                                    </div>
                                </div>

                                <div className="flex items-center flex-wrap gap-2">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                                        {typeLabels[facility.type] || facility.type}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-[#112240] text-[#64FFDA]">
                                        {facility.slotDuration}hr slots
                                    </span>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 mt-1 border border-gray-100">
                                    <div className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
                                        <span className="text-sm">⏱</span> Operating Hours
                                    </div>
                                    <p className="text-sm font-medium text-[#112240]">
                                        {facility.operatingHours.open} – {facility.operatingHours.close}
                                    </p>
                                </div>
                                {facility.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{facility.description}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
