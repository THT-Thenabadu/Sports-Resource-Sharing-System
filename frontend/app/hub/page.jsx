'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProperties } from '../booking/services/bookingApi';

// Map facility type to emoji icon
const typeIcons = {
    pool: '🏊',
    ground: '🏟️',
    court: '🏀',
    gym: '🏋️',
    track: '🏃',
};

// Map facility type to readable label
const typeLabels = {
    pool: 'Swimming Pool',
    ground: 'Ground',
    court: 'Court',
    gym: 'Gymnasium',
    track: 'Athletics Track',
};

const fallbackImages = {
    pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=800&auto=format&fit=crop',
    ground: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=800&auto=format&fit=crop',
    court: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=800&auto=format&fit=crop',
    gym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    track: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
    indoor: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
    outdoor: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?q=80&w=800&auto=format&fit=crop',
    stadium: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop'
};

export default function FacilitiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (err) {
        console.error('Failed to load properties', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProperties();
  }, []);

  return (
    <div className="space-y-10">
      <div className="pb-10 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Facilities Directory</h1>
        <p className="mt-2 text-gray-500 max-w-2xl leading-relaxed">
          Book reliable venues for competitive sports, practice sessions, or events across our network.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-gray-400">Loading facilities...</div>
      ) : properties.length === 0 ? (
        <div className="py-20 text-center font-bold text-gray-400">No properties available.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div
                key={property._id}
                className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:border-gray-300 group"
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
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                        <Link
                            href={`/hub/reviews/new?facilityId=${property._id}&name=${encodeURIComponent(property.title || '')}`}
                            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
                        >
                            <span className="text-sm">➕</span>
                            Add Review
                        </Link>
                        <Link
                            href={`/hub/reviews/${property._id}?name=${encodeURIComponent(property.title || '')}`}
                            className="flex items-center justify-center gap-2 bg-white text-gray-500 text-xs font-bold py-2.5 rounded-lg border border-gray-200 hover:text-gray-900 transition-all"
                        >
                            <span className="text-sm">⭐</span>
                            View Reviews
                        </Link>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                            <span className="text-sm">📍</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-1">{property.city}</span>
                        </div>
                        <Link href={`/?property=${property._id}`} className="flex items-center gap-2 text-[#0A192F] text-xs font-bold hover:gap-3 transition-all">
                            Reserve Venue
                            <span className="text-sm">→</span>
                        </Link>
                    </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
