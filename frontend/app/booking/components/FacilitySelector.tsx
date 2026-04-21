'use client';

import { useEffect, useState } from 'react';
import { Property } from '../types';
import { getProperties } from '../services/bookingApi';

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

// Map facility type to dynamic fallback images
const fallbackImages: Record<string, string> = {
    pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800&auto=format&fit=crop',
    ground: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=800&auto=format&fit=crop',
    court: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=800&auto=format&fit=crop',
    gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    track: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
    indoor: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    outdoor: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=800&auto=format&fit=crop',
    stadium: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop'
};

interface FacilitySelectorProps {
    onSelect: (property: Property) => void;
    selectedFacilityId?: string;
}

export default function FacilitySelector({ onSelect, selectedFacilityId }: FacilitySelectorProps) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [filterCity, setFilterCity] = useState<string>('');

    useEffect(() => {
        loadProperties();
    }, []);

    async function loadProperties() {
        try {
            setLoading(true);
            const data = await getProperties();
            setProperties(data);
        } catch {
            setError('Failed to load properties. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    }

    // Get unique cities for the filter dropdown
    const cities = [...new Set(properties.map(p => p.city).filter(Boolean))];
    const types = [...new Set(properties.map(p => p.propertyType).filter(Boolean))];

    // Apply filters
    const filtered = properties.filter(p => {
        if (filterType && p.propertyType !== filterType) return false;
        if (filterCity && p.city !== filterCity) return false;
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
                <button onClick={loadProperties} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
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
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">Property Type</label>
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
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 px-1">City</label>
                    <select
                        value={filterCity}
                        onChange={e => setFilterCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#64FFDA] focus:border-[#112240] bg-white transition-shadow"
                    >
                        <option value="">All Cities</option>
                        {cities.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Facility Cards Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="text-gray-500 font-medium">No properties found matching your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(property => (
                        <button
                            key={property._id}
                            onClick={() => onSelect(property)}
                            className={`group relative overflow-hidden text-left w-full h-[320px] rounded-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-end ${
                                selectedFacilityId === property._id
                                    ? 'ring-4 ring-[#64FFDA] ring-offset-2 shadow-2xl'
                                    : 'hover:shadow-2xl shadow-md border border-gray-200'
                            }`}
                        >
                            {/* Background Image */}
                            <img
                                src={property.images?.[0] ? `http://localhost:8000${property.images[0]}` : fallbackImages[property.propertyType?.toLowerCase()] || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop'}
                                alt={property.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />

                            {/* Dark Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#112240] via-[#112240]/60 to-transparent transition-opacity duration-300 group-hover:opacity-90"></div>

                            {/* Content */}
                            <div className="relative z-10 p-6 flex flex-col gap-3">
                                <div className="flex items-center flex-wrap gap-2 mb-1 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#64FFDA] text-[#112240] shadow-sm">
                                        {typeIcons[property.propertyType?.toLowerCase()] || '🏟️'} {typeLabels[property.propertyType?.toLowerCase()] || property.propertyType}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/10 shadow-sm">
                                        ${property.pricePerHour}/hr
                                    </span>
                                </div>

                                <div className="transform transition-transform duration-300">
                                    <h3 className="font-extrabold text-white text-xl sm:text-2xl line-clamp-1">{property.title}</h3>
                                    <p className="text-sm font-semibold text-gray-300 mt-1">{property.city} • {property.sportType}</p>
                                </div>

                                {/* Slide-up on hover info (Operating Hours & Desc) */}
                                <div className="opacity-0 max-h-0 overflow-hidden transform translate-y-4 group-hover:opacity-100 group-hover:max-h-[100px] group-hover:translate-y-0 transition-all duration-300 ease-out">
                                    <div className="flex items-center gap-1.5 mt-2 text-sm text-[#64FFDA] font-medium bg-black/30 w-fit px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
                                        <span className="text-base text-white">⏱</span>
                                        <span>{property.openingTime} – {property.closingTime}</span>
                                    </div>
                                    {property.description && (
                                        <p className="text-xs text-gray-300 line-clamp-2 mt-3 leading-relaxed border-t border-white/10 pt-2">{property.description}</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
