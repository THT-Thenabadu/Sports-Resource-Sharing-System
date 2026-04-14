const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        facilityId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facility',
            required: true,
        },
        // Denormalized fields for easier querying
        facilityName: { type: String, required: true },
        facilityType: { type: String, required: true },
        institution: { type: String, required: true },

        userId: { type: String, required: true },
        userName: { type: String, required: true },
        date: { type: Date, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },

        // Renamed from bookingStatus for consistency
        status: {
            type: String,
            enum: ['pending_payment', 'confirmed', 'expired', 'cancelled', 'blocked'],
            default: 'pending_payment',
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'onsite', 'shared'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'partial', 'paid', 'failed', 'expired'],
            default: 'unpaid',
        },
        holdExpiresAt: {
            type: Date,
            required: true,
        },
        totalAmount: { type: Number, required: true, default: 0 },

        // Shared Payment Fields
        shareEnabled: { type: Boolean, default: false },
        totalShares: { type: Number, default: 0 },
        paidShares: { type: Number, default: 0 },
        shareAmount: { type: Number, default: 0 },
        sharedPayments: [
            {
                _id: false,
                shareIndex: Number,
                payerName: String,
                payerContact: String,
                status: {
                    type: String,
                    enum: ['pending', 'paid', 'expired'],
                    default: 'pending',
                },
                paidAt: Date,
            },
        ],

        // Deprecated/Optional fields from old flow
        paymentIntentId: { type: String, required: false },
        paymentRef: { type: String, required: false },
        paymentSettledAt: { type: Date, required: false },
        expiresAt: { type: Date, required: false },

        // Change Requests
        changeRequest: { type: String, enum: ['none', 'pending', 'resolved', 'rejected'], default: 'none' },
        changeNote: { type: String, default: '' },
    },
    { timestamps: true }
);

// Index for fast overlap queries
bookingSchema.index({ facilityId: 1, date: 1, status: 1 });
// Index for expiring pending bookings
bookingSchema.index({ status: 1, holdExpiresAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
