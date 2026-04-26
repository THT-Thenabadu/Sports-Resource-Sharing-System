'use client';

import Link from 'next/link';

import { useEffect, useState } from 'react';
import { Property } from '../types';
import { getProperties } from '../services/bookingApi';
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
        if (p.status !== 'active') return false;
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(property => (
                        <div
                            key={property._id}
                            onClick={() => onSelect(property)}
                            className={`flex flex-col bg-white rounded-xl overflow-hidden border transition-all cursor-pointer group ${
                                selectedFacilityId === property._id
                                    ? 'border-[#0A192F] shadow-lg ring-1 ring-[#0A192F]'
                                    : 'border-gray-200 shadow-sm hover:border-gray-300'
                            }`}
                        >
                            {/* Image Section */}
                            <div className="relative h-52 overflow-hidden bg-gray-100">
                                <img
                                    src={property.images?.[0] ? `http://localhost:8000${property.images[0]}` : fallbackImages[property.propertyType?.toLowerCase()] || fallbackImages['ground']}
                                    alt={property.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-green-600 text-white shadow-sm">
                                        Available
                                    </span>
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-[#0A192F] transition-colors line-clamp-1">
                                        {property.title}
                                    </h3>
                                    <div className="flex items-center gap-1 font-bold text-sm bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                        <span className="text-gray-500 text-[10px] uppercase">Price</span>
                                        <span className="text-[#0A192F]">${property.pricePerHour}/hr</span>
                                    </div>
                                </div>

                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                                    {typeIcons[property.propertyType?.toLowerCase()] || '🏟️'} {typeLabels[property.propertyType?.toLowerCase()] || property.propertyType} • {property.sportType}
                                </span>

                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                                    {property.description || 'No description available for this facility.'}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-sm">👥</span>
                                        <span className="text-xs font-semibold">Standard Limit</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="text-sm">⏱</span>
                                        <span className="text-xs font-semibold">{property.openingTime} - {property.closingTime}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-1 gap-2 mt-auto">
                                    <Link
                                        href={`/hub/reviews/${property._id}?name=${encodeURIComponent(property.title || '')}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
                                    >
                                        <span className="text-sm">⭐</span>
                                        Reviews & Feedback
                                    </Link>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <span className="text-sm">📍</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{property.institution}</span>
                                    </div>
                                    <button className="flex items-center gap-2 text-[#0A192F] text-xs font-bold transition-all">
                                        {selectedFacilityId === property._id ? 'Selected' : 'Select Venue'}
                                        <span className="text-sm">→</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
