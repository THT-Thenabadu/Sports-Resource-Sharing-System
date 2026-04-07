'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { Star, ArrowLeft, MessageCircle, UserCircle2, Edit3, Trash2, X, Send, Plus } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

function FacilityReviews() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const facilityName = searchParams.get('name');

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editError, setEditError] = useState('');

  // Mock current user
  const mockUser = { userId: 'student_001' };

  const mockReviews = {
    'f1': [
      { _id: 'mock_1', type: 'Review', facilityId: 'f1', facilityName: 'Malabe Campus Main Ground', rating: 2, reviewText: 'The grass is uneven and needs maintenance.', userId: 'student_001', createdAt: '2026-02-15T10:00:00Z' },
      { _id: 'mock_2', type: 'Review', facilityId: 'f1', facilityName: 'Malabe Campus Main Ground', rating: 1, reviewText: 'Terrible condition today.', userId: 'student_002', createdAt: '2026-03-31T10:00:00Z' },
    ],
    'f2': [
      { _id: 'mock_5', type: 'Review', facilityId: 'f2', facilityName: 'Indoor Basketball Court', rating: 3, reviewText: 'Lights are a bit dim.', userId: 'student_005', createdAt: '2026-01-15T10:00:00Z' },
      { _id: 'mock_6', type: 'Review', facilityId: 'f2', facilityName: 'Indoor Basketball Court', rating: 4, reviewText: 'Nice court, much better now.', userId: 'student_006', createdAt: '2026-03-31T10:00:00Z' },
    ],
    'f3': [
      { _id: 'mock_3', type: 'Review', facilityId: 'f3', facilityName: 'Swimming Pool', rating: 5, reviewText: 'Crystal clear water, excellent!', userId: 'student_003', createdAt: '2026-01-15T10:00:00Z' },
      { _id: 'mock_4', type: 'Review', facilityId: 'f3', facilityName: 'Swimming Pool', rating: 4, reviewText: 'Good experience.', userId: 'student_004', createdAt: '2026-02-15T10:00:00Z' },
    ],
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/feedback/facility/${id}`);
      const apiReviews = res.data.filter(f => f.type === 'Review');
      const facilityMocks = mockReviews[id] || [];
      const apiIds = new Set(apiReviews.map(r => r._id));
      const merged = [...apiReviews, ...facilityMocks.filter(m => !apiIds.has(m._id))];
      setReviews(merged);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setReviews(mockReviews[id] || []);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await axios.delete(`http://localhost:8000/api/feedback/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditError('');

    if (/^\d+$/.test(editingReview.reviewText.trim())) {
      setEditError('Description cannot consist only of numbers.');
      return;
    }

    try {
      const { _id, facilityQuality, staffHelpfulness, safetyCleanliness, overallExperience, reviewText } = editingReview;
      const res = await axios.put(`http://localhost:8000/api/feedback/${_id}`, {
        facilityQuality,
        staffHelpfulness,
        safetyCleanliness,
        overallExperience,
        reviewText
      });
      setReviews(reviews.map(r => r._id === res.data._id ? res.data : r));
      setEditingReview(null);
    } catch (err) {
      alert('Failed to update review');
    }
  };

  const ratingCategories = [
    { id: 'facilityQuality', label: 'Facility Quality' },
    { id: 'staffHelpfulness', label: 'Staff Helpfulness' },
    { id: 'safetyCleanliness', label: 'Safety & Cleanliness' },
    { id: 'overallExperience', label: 'Overall Experience' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-10">
        <Link href="/hub" className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} />
          Back to Directory
        </Link>
        <Link
          href={`/hub/reviews/new?facilityId=${id}&name=${encodeURIComponent(facilityName)}`}
          className="inline-flex items-center gap-2 bg-[#0A192F] text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} />
          Share Experience
        </Link>
      </div>

      <div className="mb-16 border-b border-gray-100 pb-10">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-none mb-2">
          {facilityName || 'Facility'}
        </h1>
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Community Feedback Archive</p>
          <div className="h-1 w-1 bg-gray-200 rounded-full" />
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">{reviews.length} Experiences</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-gray-300 uppercase tracking-[0.1em] italic text-xs">Syncing Records...</div>
      ) : reviews.length === 0 ? (
        <div className="py-32 flex flex-col items-center justify-center text-center opacity-60">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <MessageCircle size={32} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Zero Experiences Shared</h3>
          <p className="text-xs font-medium text-gray-400 max-w-xs leading-relaxed mb-8">
            This facility hasn't received any community feedback yet. Be the first to document your session!
          </p>
          <Link
            href={`/hub/reviews/new?facilityId=${id}&name=${encodeURIComponent(facilityName)}`}
            className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
          >
            Submit Initial Review
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((rev) => (
            <div key={rev._id} className="group bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 hover:border-gray-200 transition-all duration-500 flex flex-col h-full relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                      Verified
                    </span>
                    <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={11} fill={i < (rev.overallExperience || rev.rating || 0) ? "currentColor" : "none"} className={i >= (rev.overallExperience || rev.rating || 0) ? "text-gray-100" : ""} />
                    ))}
                  </div>
                  <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">Overall</span>
                </div>
              </div>

              <p className="text-base text-gray-600 font-medium leading-relaxed italic mb-10 flex-1 group-hover:text-gray-900 transition-colors">
                "{rev.reviewText || "No context provided."}"
              </p>

              <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-[#0A192F] rounded-xl flex items-center justify-center text-white font-bold text-[11px] shadow-lg shadow-slate-900/10">
                    {rev.userId[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-gray-900 uppercase tracking-tighter leading-none mb-1">
                      {rev.userId}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Resident</span>
                  </div>
                </div>

                {rev.userId === mockUser.userId && (
                  <div className="flex items-center gap-1.5 translate-x-2 group-hover:translate-x-0 transition-transform opacity-0 group-hover:opacity-100 duration-300">
                    <button
                      onClick={() => setEditingReview(rev)}
                      className="p-2 text-gray-400 hover:text-[#0A192F] hover:bg-gray-100 rounded-lg transition-all"
                      title="Edit Review"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(rev._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete Review"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structured Edit Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setEditingReview(null)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex flex-col">
                <h3 className="font-black text-[#0A192F] text-sm uppercase tracking-[0.2em]">Adjust Experience</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Refining community documentation</p>
              </div>
              <button onClick={() => setEditingReview(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-10 space-y-12">
              <div className="grid grid-cols-2 gap-8">
                {ratingCategories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.label}</label>
                    <div className="flex gap-2 justify-center py-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setEditingReview({ ...editingReview, [cat.id]: num })}
                          className={`transition-all duration-300 ${num <= (editingReview[cat.id] || 0) ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:text-gray-300'}`}
                        >
                          <Star size={20} fill={num <= (editingReview[cat.id] || 0) ? 'currentColor' : 'none'} strokeWidth={num <= (editingReview[cat.id] || 0) ? 0 : 1.5} />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Updated Narrative</label>
                <textarea
                  required
                  className={`w-full text-base font-medium p-8 bg-gray-50/30 border rounded-3xl focus:bg-white focus:border-blue-500 outline-none h-48 shadow-inner transition-all resize-none italic ${editError ? 'border-red-500' : 'border-gray-100'}`}
                  value={editingReview.reviewText}
                  onChange={(e) => setEditingReview({ ...editingReview, reviewText: e.target.value })}
                />
                {editError && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">{editError}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A192F] text-white font-black py-6 rounded-2xl text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20 hover:bg-[#112240] transition-all active:scale-[0.98]"
              >
                Sync Records
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FacilityReviewsPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest italic text-[10px]">Initialising Archive...</div>}>
      <FacilityReviews />
    </Suspense>
  );
}
