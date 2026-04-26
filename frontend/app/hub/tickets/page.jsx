'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Clock,
  CheckCircle2,
  MessageCircle,
  AlertOctagon,
  Send,
  ShieldAlert,
  ChevronRight,
  UserCircle2,
  Inbox,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setLoading(false); // End loading if no user
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/feedback/user/${user.id}`);
      const complaints = res.data.filter(f => f.type === 'Complaint');
      setTickets(complaints);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !user) return;
    try {
      const res = await axios.post(`http://localhost:8000/api/feedback/${selectedTicket._id}/message`, {
        senderId: user.id,
        role: 'student',
        text: newMessage
      });
      setSelectedTicket(res.data);
      setNewMessage('');
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px)] bg-white overflow-hidden">

      {/* Sidebar List */}
      <aside className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Tickets</h1>
            <Link
              href="/hub/tickets/new"
              className="p-2 bg-[#0A192F] text-white rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} />
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="py-20 text-center font-bold text-gray-300 uppercase tracking-widest italic text-[10px]">Refreshing...</div>
          ) : tickets.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
              <Inbox size={40} className="text-gray-200 mb-4" />
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">No Tickets</h3>
              <p className="text-[10px] font-medium text-gray-400 max-w-[150px] mt-1 leading-relaxed">You haven't submitted any complaints yet.</p>
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${selectedTicket?._id === ticket._id
                  ? 'bg-white border-blue-600 shadow-md'
                  : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-blue-600 font-mono tracking-tighter uppercase">
                    {ticket.ticketNumber}
                  </span>
                  <span className="text-[9px] font-bold text-gray-300 uppercase">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-xs leading-none mb-2 line-clamp-1">{ticket.facilityName}</h4>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Resolved' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{ticket.status}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>


      <main className="flex-1 flex flex-col bg-white">
        {selectedTicket ? (
          <>
            <header className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 bg-white shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0A192F] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {selectedTicket.facilityName[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">{selectedTicket.facilityName}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">ID: {selectedTicket.ticketNumber}</span>
                    <span className="text-gray-300 text-[10px]">•</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{selectedTicket.status}</span>
                  </div>
                </div>
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/30">
              {selectedTicket.messages?.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'student' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-[13px] shadow-sm font-medium leading-relaxed transition-all ${msg.role === 'student'
                    ? 'bg-[#0A192F] text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none'
                    }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 mt-2 px-1 uppercase tracking-widest opacity-60">
                    {msg.role === 'admin' ? 'Support' : 'Me'} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>

            <footer className="p-6 border-t border-gray-100 bg-white">
              <div className="max-w-3xl mx-auto text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                {selectedTicket.status === 'Resolved' ? (
                  <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest italic flex items-center justify-center gap-2">
                    <CheckCircle2 size={12} /> Conversation closed - Ticket Resolved
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic flex items-center justify-center gap-2">
                    <Clock size={12} /> Feedback registered - Admin will reply soon
                  </p>
                )}
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 opacity-50 space-y-4">
            <div className="w-16 h-16 bg-gray-50 text-gray-200 rounded-xl border border-gray-200 flex items-center justify-center shadow-inner">
              <MessageCircle size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight uppercase">Support Hub</h2>
              <p className="text-[10px] font-bold text-gray-400 max-w-xs leading-relaxed uppercase tracking-widest italic">
                Select a ticket from the sidebar to view your conversation with administrators.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
