'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, Send, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

function ReviewForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const facilityId = searchParams.get('facilityId');
  const facilityName = searchParams.get('name');

  const [ratings, setRatings] = useState({
    facilityQuality: 5,
    staffHelpfulness: 5,
    safetyCleanliness: 5,
    overallExperience: 5
  });
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const validateForm = () => {
    const trimmedText = text.trim();
    if (!trimmedText) return 'Review text is required.';
    if (trimmedText.length < 10) return `Review text is too short. Need at least ${10 - trimmedText.length} more characters.`;
    if (trimmedText.length > 500) return `Review text is too long. Remove ${trimmedText.length - 500} characters.`;
    if (/^\d+$/.test(trimmedText)) return 'Review cannot consist only of numbers.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await axios.post('http://localhost:8000/api/feedback', {
        userId: 'student_001',
        facilityId,
        facilityName,
        type: 'Review',
        ...ratings,
        reviewText: text.trim()
      });
      setSuccess(true);
      setTimeout(() => router.push(`/hub/reviews/${facilityId}?name=${encodeURIComponent(facilityName)}`), 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      const serverError = err.response?.data?.error || 'Failed to submit review. Please try again.';
      setError(serverError);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 border border-green-100 shadow-xl shadow-green-900/5">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Review Submitted</h2>
        <p className="text-gray-500 font-medium max-w-xs mx-auto">Your feedback has been recorded and will help improve our community services.</p>
        <div className="mt-12 flex items-center gap-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Returning to Gallery</p>
        </div>
      </div>
    );
  }

  const ratingCategories = [
    { id: 'facilityQuality', label: 'Facility Quality' },
    { id: 'staffHelpfulness', label: 'Staff Helpfulness' },
    { id: 'safetyCleanliness', label: 'Safety & Cleanliness' },
    { id: 'overallExperience', label: 'Overall Experience' }
  ];

  const validationError = validateForm();
  const charactersLeft = 500 - text.trim().length;

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Link href={`/hub/reviews/${facilityId}?name=${encodeURIComponent(facilityName)}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest mb-12 transition-all hover:-translate-x-1">
        <ArrowLeft size={14} />
        Exit Submission
      </Link>

      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-[#0A192F] tracking-tight mb-3">Submit Feedback</h1>
        <p className="text-blue-400/80 font-medium text-lg">Rate your experience across multiple categories to help us improve.</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
            {ratingCategories.map((category) => (
              <div key={category.id} className="space-y-4">
                <label className="text-sm font-bold text-gray-900 tracking-tight block">{category.label}</label>
                <div className="flex gap-1.5 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleRatingChange(category.id, num)}
                      className={`transition-all duration-300 transform ${num <= ratings[category.id] ? 'text-yellow-400 scale-110 drop-shadow-sm' : 'text-gray-100 hover:text-gray-200'}`}
                    >
                      <Star size={24} fill={num <= ratings[category.id] ? 'currentColor' : 'none'} strokeWidth={num <= ratings[category.id] ? 0 : 1.5} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-sm font-bold text-gray-900 tracking-tight block">Additional Narrative</label>
              <span className={`text-[10px] font-black uppercase tracking-widest ${charactersLeft < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {text.trim().length} / 500 Characters
              </span>
            </div>
            <textarea
              required
              placeholder="Tell us more about your visit, any specific highlights or areas for improvement..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError('');
              }}
              className={`w-full text-base font-medium p-8 bg-gray-50/50 border rounded-3xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none h-48 transition-all resize-none italic ${error || (text.trim() && validationError) ? 'border-red-400 ring-red-400/5' : 'border-gray-100'}`}
            />

            <div className="flex flex-col gap-2 min-h-[20px]">
              {(error || (text.trim() && validationError)) && (
                <div className="flex items-center gap-2 text-red-500 animate-in fade-in slide-in-from-top-1">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error || validationError}</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || (text.trim().length > 0 && !!validationError)}
            className="w-full bg-[#0A192F] text-white font-bold py-6 rounded-2xl hover:bg-[#112240] transition-all text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Integrity Check...</span>
              </div>
            ) : (
              <>
                <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Submit Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest text-[10px]">Syncing...</div>}>
      <ReviewForm />
    </Suspense>
  );
}
