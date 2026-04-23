'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import SecurityShell from '../SecurityShell';

export default function SecurityScanPage() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success' | 'error', message: '', data?: [...] }

  const handleValidation = async (codeStr) => {
    // If we're already loading, don't spam requests
    if (loading) return;
    
    // In multi-slot bookings, the QR encodes JSON {id, code}
    // We only need the code
    let parsedCode = codeStr;
    try {
      const parsed = JSON.parse(codeStr);
      if (parsed.code) parsedCode = parsed.code;
    } catch {
      
    }

    if (!parsedCode || parsedCode.length < 3) return;

    setLoading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/security/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ code: parsedCode })
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          type: 'success',
          message: data.message,
          data: data.bookings
        });
      } else {
        setResult({
          type: 'error',
          message: data.message || 'Scan failed.'
        });
      }
    } catch (err) {
      setResult({
        type: 'error',
        message: 'Network error communicating with the server.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleValidation(manualCode.trim());
  };

  return (
    <SecurityShell>
      <div className="security-page-head">
        <h2>Scan Pass / Check-In</h2>
        <p>Verify Digital Tickets or manually enter access tokens to grant property access</p>
      </div>

      <div className="scanner-container">
        
        {/* Left Side: Camera OR Result */}
        <div className="scanner-camera-section">
          {result?.type === 'success' ? (
             <div className="scan-result-card success">
               <div className="icon-circle">✓</div>
               <h3>{result.message}</h3>
               
               <div className="scan-booking-details">
                 <p><strong>Guest:</strong> {result.data[0].userName}</p>
                 <p><strong>Facility:</strong> {result.data[0].facilityName}</p>
                 <p><strong>Date:</strong> {new Date(result.data[0].date).toLocaleDateString('en-CA')}</p>
                 <p><strong>Times:</strong></p>
                 <ul className="scan-times-list">
                    {result.data.map(b => (
                      <li key={b._id}>{b.startTime} - {b.endTime}</li>
                    ))}
                 </ul>
               </div>

               <button className="scan-again-btn" onClick={() => setResult(null)}>
                 Scan Another Target
               </button>
             </div>
          ) : result?.type === 'error' ? (
             <div className="scan-result-card error">
               <div className="icon-circle">✕</div>
               <h3>Access Denied</h3>
               <p className="error-message-text">{result.message}</p>
               
               <button className="scan-again-btn" onClick={() => setResult(null)}>
                 Try Again
               </button>
             </div>
          ) : (
             <div className="camera-wrapper">
               <Scanner
                 onScan={(detectedCodes) => {
                   if (detectedCodes && detectedCodes.length > 0) {
                     handleValidation(detectedCodes[0].rawValue);
                   }
                 }}
                 onError={(error) => console.log(error?.message)}
                 components={{
                   audio: false,       // Don't beep
                   onOff: false,       // Don't show flashlight btn if not needed
                   finder: true        // Show scanner square
                 }}
               />
               <p className="camera-hint">Point camera at the Digital Ticket QR Code</p>
               {loading && <div className="scanner-overlay"><span className="loader">Verifying...</span></div>}
             </div>
          )}
        </div>

        {/* Right Side: Manual Token Entry */}
        <div className="scanner-manual-section">
          <div className="manual-card">
            <h3>Manual Token Entry</h3>
            <p>If the user's screen is too dark or the camera fails, enter the 6-character access token printed on their ticket.</p>
            
            <form onSubmit={handleManualSubmit} className="manual-token-form">
              <input
                type="text"
                placeholder="e.g. A4X9B2"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                maxLength={8}
                disabled={loading}
              />
              <button type="submit" disabled={loading} className="manual-submit-btn">
                {loading ? 'Checking...' : 'Verify Token'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </SecurityShell>
  );
}
