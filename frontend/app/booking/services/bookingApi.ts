/**
 * API service layer for the Booking component.
 *
 * Think of this like a Spring Boot Service class — it handles
 * all HTTP communication with the backend REST API.
 */

import { Facility, SlotResponse, Booking, CreateBookingData, CreateBookingResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ─── Facility Endpoints ───

export async function getFacilities(filters?: {
    type?: string;
    institution?: string;
    status?: string;
}): Promise<Facility[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.institution) params.append('institution', filters.institution);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = `${API_BASE}/facilities${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch facilities');
    return res.json();
}

export async function getFacilityById(id: string): Promise<Facility> {
    const res = await fetch(`${API_BASE}/facilities/${id}`);
    if (!res.ok) throw new Error('Failed to fetch facility');
    return res.json();
}

// ─── Booking Endpoints ───

export async function getAvailableSlots(facilityId: string, date: string): Promise<SlotResponse> {
    const res = await fetch(`${API_BASE}/bookings/slots/${facilityId}/${date}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch slots');
    }
    return res.json();
}

export async function createBookingWithHold(data: CreateBookingData, token: string): Promise<CreateBookingResponse> {
    console.log("Sending payload to createPendingBooking:", data);
    const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Backend Error:", errorData);
        throw new Error(
            errorData.message || `Failed to create booking (${res.status})`
        );
    }
    return res.json();
}

export async function settleBookingPayment(id: string, paymentIntentId: string): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/settle-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to settle payment');
    }
    return res.json();
}

export async function getBookings(filters?: {
    facilityId?: string;
    institution?: string;
    userId?: string;
    date?: string;
    status?: string;
}): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters?.facilityId) params.append('facilityId', filters.facilityId);
    if (filters?.institution) params.append('institution', filters.institution);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const url = `${API_BASE}/bookings${queryString ? `?${queryString}` : ''}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch bookings');
    return res.json();
}

export async function getBookingById(id: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    if (!res.ok) throw new Error('Failed to fetch booking');
    return res.json();
}

export async function cancelBooking(id: string, token: string): Promise<{ message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!res.ok) throw new Error('Failed to cancel booking');
    return res.json();
}

export async function requestBookingChange(id: string, note: string, token: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${id}/request-change`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ note })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to request change');
    }
    return res.json();
}

// --- New Payment Endpoints ---

export async function payBookingByCard(id: string, token: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/pay/card`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Card payment failed');
    }
    return res.json();
}

export async function payBookingOnsite(id: string, token: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/pay/onsite`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'On-site payment selection failed');
    }
    return res.json();
}

export async function paySharedShare(
    id: string,
    shareIndex: number,
    payload: { payerName?: string; payerContact?: string },
    token: string
) {
    const res = await fetch(`${API_BASE}/bookings/${id}/shared/pay/${shareIndex}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Shared payment failed');
    }
    return res.json();
}

export async function getSharedStatus(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/shared/status`);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Unable to fetch shared payment status');
    }
    return res.json();
}
