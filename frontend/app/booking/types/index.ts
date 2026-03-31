// TypeScript interfaces for the Booking component
// These mirror the MongoDB schemas on the backend



export type BookingStatus = "pending_payment" | "confirmed" | "expired" | "cancelled";
export type PaymentMethod = "card" | "onsite" | "shared";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "pending" | "failed" | "expired";


export interface SharedPaymentItem {
    shareIndex: number;
    payerName?: string;
    payerContact?: string;
    status: "pending" | "paid" | "expired";
    paidAt?: string;
}

export interface BookingPaymentState {
    _id: string;
    bookingStatus: BookingStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    holdExpiresAt: string;
    totalShares?: number;
    paidShares?: number;
    sharedPayments?: SharedPaymentItem[];
}


export interface Facility {
    _id: string;
    name: string;
    type: 'pool' | 'ground' | 'court' | 'gym' | 'track';
    institution: string;
    slotDuration: 1 | 4;
    operatingHours: {
        open: string;
        close: string;
    };
    status: 'available' | 'under_repair';
    description: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    rates: {
        perHour: number;
    };
}

export interface TimeSlot {
    startTime: string;  // "09:00"
    endTime: string;    // "10:00"
    available: boolean;
}

export interface SlotResponse {
    facility: {
        id: string;
        name: string;
        type: string;
        institution: string;
        slotDuration: number;
    };
    date: string;
    slots: TimeSlot[];
}

export interface Booking {
    _id: string;
    facilityId: string | Facility;
    facilityName: string;
    facilityType: string;
    institution: string;
    userId: string;
    userName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    paymentIntentId: string;
    paymentRef: string | null;
    paymentSettledAt: string | null;
    holdExpiresAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBookingData {
    facilityId: string;
    userId: string;
    userName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    paymentMethod: PaymentMethod;
    shareEnabled: boolean;
    totalShares: number;
    holdExpiresAt?: string; // Optional here, will be set in api if not present
}

export interface CreateBookingResponse extends Booking {
    // The `payment` object is deprecated as per the new flow
}

// Used for the booking flow state machine
export type BookingStep = 'select-facility' | 'select-date' | 'select-slot' | 'confirm' | 'payment' | 'success';
