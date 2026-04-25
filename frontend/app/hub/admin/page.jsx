'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  UserCircle2,
  MessageCircle,
  AlertTriangle,
  X,
  Send,
  Inbox,
  FileText,
  BarChart3
} from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/api/feedback');
      setFeedbacks(res.data);
      if (selectedTicket) {
        const updated = res.data.find(f => f._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };


  const allReviews = feedbacks.filter(f => f.type === 'Review');
  const allComplaints = feedbacks.filter(f => f.type === 'Complaint');

  const getMonthlyStats = () => {
    const categories = ['facilityQuality', 'staffHelpfulness', 'safetyCleanliness'];
    const monthsData = {};
    const facilityData = {};


    const last4Months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      last4Months.push({
        key,
        name: d.toLocaleDateString('default', { month: 'short' })
      });
      monthsData[key] = {
        facilityQuality: { total: 0, count: 0 },
        staffHelpfulness: { total: 0, count: 0 },
        safetyCleanliness: { total: 0, count: 0 }
      };
    }

    allReviews.forEach(r => {
      const date = new Date(r.createdAt);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const facility = r.facilityName;

      if (monthsData[monthKey]) {
        categories.forEach(cat => {
          if (r[cat]) {
            monthsData[monthKey][cat].total += r[cat];
            monthsData[monthKey][cat].count += 1;
          }
        });
      }

      const rating = r.overallExperience || r.rating || 0;
      if (!facilityData[facility]) {
        facilityData[facility] = { totalRating: 0, count: 0 };
      }
      facilityData[facility].totalRating += rating;
      facilityData[facility].count += 1;
    });

    const performance = Object.entries(facilityData).map(([name, data]) => ({
      name,
      avgRating: (data.totalRating / (data.count || 1)).toFixed(1),
      status: (data.totalRating / (data.count || 1)) < 3.0 ? 'CRITICAL' : (data.totalRating / (data.count || 1)) < 4.0 ? 'ATTENTION' : 'GOOD'
    })).sort((a, b) => a.avgRating - b.avgRating);

    return { monthlyGrid: monthsData, months: last4Months, performance };
  };

  const { monthlyGrid, months, performance } = getMonthlyStats();

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.patch(`http://localhost:8000/api/feedback/${id}/admin`, { status });
      const updatedList = feedbacks.map(f => f._id === id ? { ...res.data, isMock: false } : f);
      setFeedbacks(updatedList);
      if (selectedTicket?._id === id) setSelectedTicket(res.data);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const sendAdminMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      const res = await axios.post(`http://localhost:8000/api/feedback/${selectedTicket._id}/message`, {
        senderId: 'admin_sys',
        role: 'admin',
        text: newMessage
      });
      setSelectedTicket(res.data);
      setNewMessage('');
      setFeedbacks(feedbacks.map(f => f._id === res.data._id ? res.data : f));
    } catch (err) {
      console.error('Failed to send admin message:', err);
    }
  };

  const filteredFeedbacks = activeTab === 'complaints' ? allComplaints : allReviews;
  const pendingCount = allComplaints.filter(c => c.status === 'Pending').length;

  return (
    <div className="flex bg-white min-h-[calc(100vh-73px)] w-full font-sans">
      <aside className="w-64 bg-[#0A192F] text-white p-6 flex flex-col sticky top-[73px] h-[calc(100vh-73px)] border-r border-slate-800">
        <nav className="flex flex-col gap-2">

          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'reviews' ? 'bg-white text-[#0A192F] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <MessageCircle size={16} />
            <span className="text-[11px] font-bold uppercase tracking-tight">Reviews</span>
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${activeTab === 'complaints' ? 'bg-white text-[#0A192F] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} />
              <span className="text-[11px] font-bold uppercase tracking-tight">Complaints</span>
            </div>
            {pendingCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-gray-50/20 p-10 relative">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'reports' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <h1 className="text-2xl font-bold text-[#0A192F] tracking-tight">System Analytics</h1>
                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">Identifying maintenance priorities through sentiment updates.</p>
              </div>

              {/* GRID AREA */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-slate-200/40 mb-10 overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-[#f8fafc]/50">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Category Performance</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="p-6 border-b border-r border-gray-100"></th>
                        {months.map(m => (
                          <th key={m.key} className="p-6 border-b border-r border-gray-100 text-[11px] font-black text-[#0A192F] uppercase tracking-[0.2em]">{m.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: 'facilityQuality', label: 'Facility Quality' },
                        { id: 'safetyCleanliness', label: 'Safety & Cleanliness' },
                        { id: 'staffHelpfulness', label: 'Staff Helpfulness' }
                      ].map((cat, idx) => (
                        <tr key={cat.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#f8fafc]/30'}>
                          <td className="p-6 border-r border-b border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50/30">{cat.label}</td>
                          {months.map(m => {
                            const stats = monthlyGrid[m.key]?.[cat.id];
                            const avg = stats?.count > 0 ? (stats.total / stats.count).toFixed(1) : '—';
                            return (
                              <td key={`${m.key}-${cat.id}`} className="p-6 border-r border-b border-gray-100 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className={`text-base font-black ${avg === '—' ? 'text-gray-200' : parseFloat(avg) >= 4 ? 'text-green-600' : parseFloat(avg) >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {avg}
                                  </span>
                                  {avg !== '—' && (
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={8} fill={i < Math.round(parseFloat(avg)) ? "currentColor" : "none"} className={i < Math.round(parseFloat(avg)) ? (parseFloat(avg) >= 4 ? 'text-green-500' : parseFloat(avg) >= 3 ? 'text-amber-400' : 'text-red-400') : 'text-gray-100'} />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ANALYTICS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Facility Health Summary</h3>
                    <span className="text-[9px] font-bold text-slate-300 uppercase italic">Real-time performance distribution</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {performance.map(f => (
                      <div key={f.name} className="flex flex-col gap-3 p-5 bg-[#f8fafc]/50 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-lg transition-all group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[12px] font-bold text-[#0A192F] leading-tight line-clamp-1">{f.name}</span>
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-50">
                            <span className="text-xs font-black text-slate-800">{f.avgRating}</span>
                            <Star size={12} className="text-yellow-400 fill-current" />
                          </div>
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg shadow-sm border self-start ${f.status === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' :
                          f.status === 'ATTENTION' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                            'bg-green-50 text-green-600 border-green-100'
                          }`}>
                          {f.status} {f.status === 'CRITICAL' ? '• Immediate Attention Required' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0A192F] p-8 rounded-2xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <BarChart3 size={200} className="text-white" />
                  </div>
                  <div className="relative h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-8">Maintenance Insight</h3>
                      <div className="space-y-8">
                        <div className="p-5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                          <p className="text-[12px] text-slate-300 leading-relaxed italic">
                            "Analysis of system-wide sentiment identifies <b>{performance.filter(p => p.status === 'CRITICAL').length}</b> facilities currently in a CRITICAL state, requiring structural maintenance or operational review."
                          </p>
                        </div>
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Global Satisfaction</span>
                            <span className="text-blue-400">{(performance.reduce((acc, f) => acc + parseFloat(f.avgRating), 0) / (performance.length || 1)).toFixed(1)} / 5.0</span>
                          </div>
                          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full transition-all duration-1000"
                              style={{ width: `${(performance.reduce((acc, f) => acc + parseFloat(f.avgRating), 0) / (performance.length || 1) / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-gray-100 pb-10">
                <div>
                  <h1 className="text-2xl font-bold text-[#0A192F] capitalize tracking-tight">{activeTab}</h1>
                  <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Support management and sentiment archive.</p>
                </div>
                {activeTab === 'reviews' && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="flex items-center gap-3 bg-[#0A192F] text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/20"
                    >
                      <BarChart3 size={16} />
                      View Performance Reports
                    </button>
                    <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{(allReviews.reduce((acc, curr) => acc + (curr.overallExperience || curr.rating || 0), 0) / (allReviews.length || 1)).toFixed(1)}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">Global Avg</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="p-5 font-bold text-slate-400 text-[9px] uppercase tracking-widest">Ticket ID</th>
                      <th className="p-5 font-bold text-slate-400 text-[9px] uppercase tracking-widest">Facility</th>
                      <th className="p-5 font-bold text-slate-400 text-[9px] uppercase tracking-widest">Description</th>
                      <th className="p-5 font-bold text-slate-400 text-[9px] uppercase tracking-widest text-right">{activeTab === 'complaints' ? 'Actions' : ''}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="5" className="p-24 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Updating Archive...</td></tr>
                    ) : filteredFeedbacks.length === 0 ? (
                      <tr><td colSpan="5" className="p-36 text-center"><Inbox size={40} className="text-slate-100 mx-auto mb-4" /><span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Records in Archive</span></td></tr>
                    ) : filteredFeedbacks.map((fb) => (
                      <tr key={fb._id} onClick={() => fb.type === 'Complaint' && setSelectedTicket(fb)} className={`transition-all cursor-pointer ${fb.type === 'Complaint' ? 'hover:bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                        <td className="p-5 align-top">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-blue-600 font-mono tracking-tighter">#{fb.ticketNumber || (fb._id.length > 6 ? fb._id.slice(-6) : fb._id)}</span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(fb.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="p-5 align-top">
                          <p className="font-bold text-slate-900 text-[13px] tracking-tight">{fb.facilityName}</p>
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1.5"><UserCircle2 size={12} className="text-slate-300" /> {fb.userId}</div>
                        </td>
                        <td className="p-5 align-top max-w-sm">
                          {fb.type === 'Review' && (
                            <div className="flex flex-col gap-1 mb-2.5">
                              <div className="flex items-center gap-0.5 text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={8} fill={i < (fb.overallExperience || fb.rating || 0) ? "currentColor" : "none"} className={i >= (fb.overallExperience || fb.rating || 0) ? "text-gray-100" : ""} />
                                ))}
                              </div>
                              <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest pl-0.5">Overall Status</span>
                            </div>
                          )}
                          <p className="text-[12px] font-medium text-slate-500 leading-relaxed italic pr-6 group-hover:text-slate-700 transition-colors">"{fb.reviewText || "No additional context provided."}"</p>
                        </td>
                        {activeTab === 'complaints' && <td className="p-5 align-top text-right"><button className="bg-[#0A192F] text-white text-[9px] font-black px-4 py-2 rounded-lg uppercase tracking-widest hover:shadow-lg transition-all">Respond</button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedTicket && (
          <div className="fixed inset-0 z-[2000] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#0A192F] text-white">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/50"><MessageCircle size={20} /></div>
                  <div><h3 className="text-xs font-black uppercase tracking-widest">{selectedTicket.ticketNumber}</h3><span className="text-[10px] font-bold text-slate-400 capitalize">{selectedTicket.facilityName}</span></div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 h-10 w-10 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center"><X size={20} /></button>
              </div>

              <div className="bg-gray-50 border-b border-gray-100 p-5 px-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shadow-sm ${selectedTicket.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{selectedTicket.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTicket.status === 'Pending' && <button onClick={() => updateStatus(selectedTicket._id, 'In Progress')} className="px-4 py-2 bg-amber-500 text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-amber-600 shadow-sm shadow-amber-200">Acknowledge</button>}
                  {selectedTicket.status !== 'Resolved' && <button onClick={() => updateStatus(selectedTicket._id, 'Resolved')} className="px-4 py-2 bg-green-600 text-white text-[9px] font-black rounded-lg uppercase tracking-widest hover:bg-green-700 shadow-sm shadow-green-200">MARK RESOLVED</button>}
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#f8fafc]/30">
                {selectedTicket.messages?.map((msg, idx) => (
                  <div key={idx} className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] px-5 py-4 rounded-2xl text-[13px] shadow-sm font-medium leading-relaxed ${msg.role === 'admin' ? 'bg-[#0A192F] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-slate-900 rounded-tl-none'}`}>{msg.text}</div>
                    <span className="text-[8px] font-black text-slate-400 mt-3 uppercase tracking-widest italic pr-1">{msg.role === 'admin' ? 'Admin Response' : `User: ${selectedTicket.userId}`} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>

              <div className="p-8 border-t border-gray-100 bg-white">
                <form onSubmit={sendAdminMessage} className="relative group">
                  <textarea rows="2" placeholder="Write a response..." className="w-full text-[13px] font-medium py-5 pl-6 pr-16 bg-gray-50 border border-gray-200 rounded-2xl focus:border-blue-600 focus:bg-white outline-none transition-all shadow-inner resize-none" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                  <button type="submit" disabled={!newMessage.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-[#0A192F] text-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"><Send size={18} /></button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
