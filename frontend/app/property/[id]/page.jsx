'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import './PropertyBooking.css';

export default function PropertyBookingPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  // ✅ New states for Digital Ticket feature
  const [confirmedBookingData, setConfirmedBookingData] = useState(null);
  const ticketRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (!propertyId || !date) return;
    fetchSlots(date);
  }, [propertyId, date]);

  const fetchSlots = async (selectedDate) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/api/bookings/slots/${propertyId}/${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setProperty(data.facility); // Backend maps it to 'facility'
        setSlots(data.slots || []);
        setSelectedSlots([]); 
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSlotToggle = (slot) => {
    setSelectedSlots(prev => {
      const isSelected = prev.some(s => s.startTime === slot.startTime);
      if (isSelected) {
        return prev.filter(s => s.startTime !== slot.startTime);
      } else {
        if (prev.length >= 3) {
          alert('You can only select up to 3 slots continuously per booking.');
          return prev;
        }
        return [...prev, slot].sort((a,b) => a.startTime.localeCompare(b.startTime));
      }
    });
  };

  const handleBooking = async () => {
    if (!user) {
      alert('Please log in first to book a property.');
      router.push('/login');
      return;
    }
    
    if (selectedSlots.length === 0) return;

    setBookingLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/bookings/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          facilityId: propertyId,
          userId: user.id || user._id, 
          userName: user.name || user.email || 'Guest',
          date: date,
          slots: selectedSlots
        })
      });

      const data = await res.json();

      if (res.ok) {
        setConfirmedBookingData(data); // Contains accessCode and _id
        fetchSlots(date); // Refresh to show slot as booked behind the token
      } else {
        alert(data.message || 'Failed to book');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend');
    }
    setBookingLoading(false);
  };

  const handleDownloadTicket = async () => {
    if (ticketRef.current) {
      const canvas = await html2canvas(ticketRef.current, { scale: 2 });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Booking-${confirmedBookingData._id}.png`;
      link.click();
    }
  };

  return (
    <div className="booking-page-container">
      <button className="back-button" onClick={() => router.back()}>
        &larr; Back
      </button>

      {loading && !property ? (
        <p className="loading-text">Loading property details...</p>
      ) : property ? (
        <div className="booking-content">
          <div className="property-header">
            <h1 className="property-title">{property.name}</h1>
            <p className="property-type">{property.type} • {property.institution}</p>
          </div>

          {confirmedBookingData ? (
             <div className="digital-ticket-wrapper">
               <div className="digital-ticket-card" ref={ticketRef}>
                 <div className="ticket-header-strip"></div>
                 <h2 className="ticket-title">Booking Confirmed!</h2>
                 
                 <div className="ticket-qr-section">
                   <div className="qr-box">
                     <QRCode 
                       value={JSON.stringify({ 
                         id: confirmedBookingData._id, 
                         code: confirmedBookingData.accessCode 
                       })} 
                       size={180}
                       level="Q"
                     />
                   </div>
                   <p className="ticket-access-code">{confirmedBookingData.accessCode}</p>
                   <p className="ticket-instruction">Show this code at the entrance</p>
                 </div>

                 <div className="ticket-details-grid">
                   <div className="ticket-detail-item">
                     <span className="detail-label">Booking ID</span>
                     <span className="detail-value">{confirmedBookingData.bookings && confirmedBookingData.bookings[0]?._id.slice(-8).toUpperCase()}</span>
                   </div>
                   <div className="ticket-detail-item">
                     <span className="detail-label">Facility</span>
                     <span className="detail-value">{property.name}</span>
                   </div>
                   <div className="ticket-detail-item">
                     <span className="detail-label">Date</span>
                     <span className="detail-value">{date}</span>
                   </div>
                   <div className="ticket-detail-item">
                     <span className="detail-label">Times ({confirmedBookingData.bookings?.length})</span>
                     <span className="detail-value">
                       {confirmedBookingData.bookings?.map(b => `${b.startTime} - ${b.endTime}`).join(', ')}
                     </span>
                   </div>
                 </div>
               </div>

               <div className="ticket-actions">
                 <button className="confirm-book-btn" onClick={handleDownloadTicket}>
                   Download Ticket
                 </button>
                 <button className="done-btn" onClick={() => {
                   setConfirmedBookingData(null);
                   setSelectedSlots([]);
                 }}>
                   Book Another Slot
                 </button>
               </div>
             </div>
          ) : (
            <div className="booking-card">
              <h2 className="booking-card-title">Select Date & Time</h2>
              
              <div className="date-picker-container">
                <label className="date-label">Date</label>
                <input 
                  type="date" 
                  className="date-input" 
                  value={date} 
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)} 
                />
              </div>

              <div className="slots-grid">
                {slots.length > 0 ? slots.map((slot, idx) => {
                  const isSelected = selectedSlots.some(s => s.startTime === slot.startTime);
                  let btnClass = 'slot-btn';
                  if (!slot.available) btnClass += ' slot-btn-disabled';
                  else if (isSelected) btnClass += ' slot-btn-selected';
                  
                  return (
                    <button 
                      key={idx} 
                      className={btnClass}
                      disabled={!slot.available}
                      onClick={() => handleSlotToggle(slot)}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  );
                }) : (
                  <p className="no-slots">No slots available for this date.</p>
                )}
              </div>

              {selectedSlots.length > 0 && (
                <div className="booking-summary">
                  <h3>Booking Summary</h3>
                  <p><strong>Date:</strong> {date}</p>
                  <p><strong>Selected Times ({selectedSlots.length}):</strong> {selectedSlots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}</p>
                  <button 
                    className="confirm-book-btn" 
                    onClick={handleBooking}
                    disabled={bookingLoading}
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Bookings'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="error-text">Property not found.</p>
      )}
    </div>
  );
}
