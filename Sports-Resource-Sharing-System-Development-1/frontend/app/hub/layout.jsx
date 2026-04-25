'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Shield,
  UserCircle2,
  Settings,
  ArrowLeft,
  Inbox,
  Bot,
  Send,
  X,
  MessageSquare,
  LifeBuoy
} from 'lucide-react';
import '../component-styles/Navbar.css';

export default function HubLayout({ children }) {
  const pathname = usePathname();
  const [mockUser, setMockUser] = useState({ userId: 'student_001', isAdmin: false });

  const toggleAdmin = () => {
    setMockUser(prev => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900 border-t-4 border-[#0A192F]">
      <nav className="navbar shadow-sm" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="navbar-brand">
          <div className="navbar-logo">
            <span>S</span>
          </div>
          <Link href="/" className="navbar-title">SPORTEK</Link>
        </div>

        <div className="navbar-links">
          <Link
            href="/hub"
            className={`navbar-link flex items-center gap-2 ${pathname === '/hub' ? 'text-white' : 'text-gray-300'
              }`}
          >
            <LayoutDashboard size={18} />
            Directory
          </Link>

          <Link
            href="/hub/tickets"
            className={`navbar-link flex items-center gap-2 ${pathname.startsWith('/hub/tickets') ? 'text-white' : 'text-gray-300'
              }`}
          >
            <Inbox size={18} />
            My Tickets
          </Link>

          {mockUser.isAdmin && (
            <Link
              href="/hub/admin"
              className={`navbar-link flex items-center gap-2 ${pathname === '/hub/admin' ? 'text-white' : 'text-gray-300'
                }`}
            >
              <Shield size={18} />
              Operations
            </Link>
          )}

          <div className="h-6 w-px bg-gray-700 mx-2" />

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {mockUser.userId}
            </span>
            <button
              onClick={toggleAdmin}
              className="navbar-btn !py-1.5 !px-4 text-xs"
            >
              {mockUser.isAdmin ? 'ADMIN ON' : 'TOGGLE ADMIN'}
            </button>
          </div>
        </div>
      </nav>

      <main className={`flex-1 w-full ${pathname === '/hub/admin' || pathname.startsWith('/hub/tickets') ? '' : 'max-w-7xl mx-auto py-12 px-6'}`}>
        <div className={`${pathname === '/hub/admin' || pathname.startsWith('/hub/tickets') ? 'h-full' : 'animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
          {children}
        </div>
      </main>

      <AssistantBot />
    </div>
  );
}

function AssistantBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm the Sportek Assistant. What can I help you find today?", role: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = React.useRef(null);

  const SUGGESTED_QUESTIONS = [
    "What are the opening hours?",
    "How do I reserve a venue?",
    "How to report a problem?",
    "What can you do?"
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const getHardcodedResponse = (query) => {
    const q = query.toLowerCase();
    if (q.includes('hour') || q.includes('time')) return "Most facilities are open from 8AM to 6PM daily, including weekends.";
    if (q.includes('book') || q.includes('reserve')) return "You can reserve any venue by clicking the 'Reserve Venue' button on its card in the main Directory.";
    if (q.includes('report') || q.includes('problem') || q.includes('maintenance')) return "To report a technical or maintenance issue, please use the 'My Tickets' section or click 'Raise Ticket' below.";
    if (q.includes('hi') || q.includes('hello')) return "Hi there! I'm ready to answer any questions about our sports facilities.";
    return "I'm not quite sure about that. Would you like to raise a support ticket so our human team can look into it?";
  };

  const sendMessage = (text) => {
    const userMsg = { text, role: 'user' };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const botResponse = { text: getHardcodedResponse(text), role: 'bot' };
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-8 left-8 z-[5500] flex flex-col items-start">
      {/* Bot Icon Circle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0A192F] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </button>

      {/* Chat Window Container */}
      {isOpen && (
        <div className="absolute bottom-20 left-0 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in slide-in-from-bottom-8 duration-300">
          {/* Header */}
          <div className="p-5 bg-[#0A192F] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-600 rounded">
                <Bot size={16} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Sportek AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Message History */}
          <div ref={scrollRef} className="h-80 overflow-y-auto p-5 bg-[#f8fafc]/50 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] px-4 py-2.5 rounded-xl text-[12px] font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#0A192F] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-slate-900 rounded-tl-none'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Escalation Path */}
          <div className="p-4 border-t border-gray-100 bg-white">
            {/* Suggested Questions */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-all shadow-sm shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/hub/tickets/new"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-all border border-blue-100"
              >
                <LifeBuoy size={12} /> Still Need Help? Raise Ticket
              </Link>

              <form onSubmit={handleSend} className="relative group">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full text-xs font-medium py-3 pl-4 pr-10 bg-gray-50 border border-gray-100 rounded-lg focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-[#0A192F] hover:text-blue-600 transition-all disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
