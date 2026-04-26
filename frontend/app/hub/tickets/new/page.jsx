'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Send, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { FACILITIES } from '../../constants/facilities';


export default function NewTicketPage() {
  const router = useRouter();
  const [selectedFacility, setSelectedFacility] = useState(FACILITIES[0]);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (/^\d+$/.test(text.trim())) {
      setError('Description cannot consist only of numbers.');
      return;
    }

    setSubmitting(true);
    try {
      const storedUser = localStorage.getItem('user');
      let userId = 'anonymous';
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || parsed._id || 'anonymous';
      }

      await axios.post('http://localhost:8000/api/feedback', {
        userId,
        facilityId: selectedFacility?.id || selectedFacility?._id || 'unknown_facility',
        facilityName: selectedFacility?.name || selectedFacility?.title || 'General Support',
        type: 'Complaint',
        reviewText: text
      });
      setSuccess(true);
      setTimeout(() => router.push('/hub/tickets'), 2000);
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-4 border border-red-100 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Ticket Submitted</h2>
        <p className="text-gray-500 text-sm font-medium">An administrator will review your issue shortly.</p>
        <p className="text-[10px] text-gray-300 mt-10 uppercase tracking-widest">Redirecting to My Tickets...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <Link href="/hub/tickets" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest mb-8 transition-colors">
        <ArrowLeft size={14} />
        Back to Tickets
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-[#f8fafc]/50">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-red-600 text-white rounded shadow-sm">
              <AlertTriangle size={16} />
            </div>
            <h1 className="text-xl font-bold text-[#0A192F]">Contact Support</h1>
          </div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Report technical issues or facility maintenance needs.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">Affected Facility</label>
            <div className="grid grid-cols-1 gap-1.5">
              {FACILITIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFacility(f)}
                  className={`p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${selectedFacility.id === f.id ? 'border-[#0A192F] bg-[#0A192F]/5' : 'border-gray-50 text-gray-400 hover:border-gray-100'
                    }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-tight">{f.name}</span>
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-current ${selectedFacility.id === f.id ? 'bg-[#0A192F]' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">Detailed Description</label>
            <textarea
              required
              placeholder="Provide a detailed narrative of the technical issue..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className={`w-full text-sm font-medium p-6 bg-white border rounded-lg focus:border-blue-500 outline-none h-40 shadow-inner transition-all resize-none ${error ? 'border-red-500' : 'border-gray-100'}`}
            />
            {error && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-none">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0A192F] text-white font-bold py-4 rounded-lg hover:opacity-95 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2"
          >
            {submitting ? 'Submitting Ticket...' : (
              <>
                <Send size={14} />
                Open Support Ticket
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
