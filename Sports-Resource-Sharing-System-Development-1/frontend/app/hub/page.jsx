'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Users, Calendar, ArrowRight, Star, Plus, Eye } from 'lucide-react';
import { FACILITIES } from './constants/facilities';


export default function FacilitiesPage() {
  return (
    <div className="space-y-10">
      <div className="pb-10 border-b border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Facilities Directory</h1>
        <p className="mt-2 text-gray-500 max-w-2xl leading-relaxed">
          Book reliable venues for competitive sports, practice sessions, or events across our network.
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FACILITIES.map((facility) => (
          <div
            key={facility.id}
            className="flex flex-col bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm transition-all hover:border-gray-300 group"
          >
            {/* Image Section */}
            <div className="relative h-52 overflow-hidden bg-gray-100">
              <img
                src={facility.img}
                alt={facility.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${facility.status === 'Available' ? 'bg-green-600 text-white' :
                    facility.status === 'Booked' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                  }`}>
                  {facility.status}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-[#0A192F] transition-colors">
                  {facility.name}
                </h3>
                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                  <Star size={14} fill="currentColor" />
                  {facility.rating}
                </div>
              </div>

              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                {facility.type}
              </span>

              <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
                {facility.description}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={14} />
                  <span className="text-xs font-semibold">{facility.capacity} Limit</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} />
                  <span className="text-xs font-semibold">{facility.hours}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <Link
                  href={`/hub/reviews/new?facilityId=${facility.id}&name=${encodeURIComponent(facility.name)}`}
                  className="flex items-center justify-center gap-2 bg-gray-50 text-gray-700 text-xs font-bold py-2.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all shadow-sm"
                >
                  <Plus size={14} />
                  Add Review
                </Link>
                <Link
                  href={`/hub/reviews/${facility.id}?name=${encodeURIComponent(facility.name)}`}
                  className="flex items-center justify-center gap-2 bg-white text-gray-500 text-xs font-bold py-2.5 rounded-lg border border-gray-200 hover:text-gray-900 transition-all"
                >
                  <Eye size={14} />
                  View Reviews
                </Link>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{facility.location}</span>
                </div>
                <button className="flex items-center gap-2 text-[#0A192F] text-xs font-bold hover:gap-3 transition-all">
                  Reserve Venue
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
