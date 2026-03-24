/**
 * Seed script to populate MongoDB with sample facilities.
 * Run: node Booking/seed/facilitySeed.js
 *
 * This inserts sample sports facilities so you can test the booking engine
 * without needing the Institutional Asset Registry component.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Facility = require('../models/Facility');

const sampleFacilities = [
    {
        name: 'Olympic Swimming Pool',
        type: 'pool',
        institution: 'Royal College',
        slotDuration: 1,
        operatingHours: { open: '06:00', close: '20:00' },
        status: 'available',
        description: '50m Olympic standard swimming pool with 8 lanes'
    },
    {
        name: 'Training Pool',
        type: 'pool',
        institution: 'Ananda College',
        slotDuration: 1,
        operatingHours: { open: '07:00', close: '18:00' },
        status: 'available',
        description: '25m training pool suitable for beginners'
    },
    {
        name: 'Main Cricket Ground',
        type: 'ground',
        institution: 'Royal College',
        slotDuration: 4,
        operatingHours: { open: '06:00', close: '18:00' },
        status: 'available',
        description: 'Full-size cricket ground with pavilion seating'
    },
    {
        name: 'Football Ground',
        type: 'ground',
        institution: 'St. Thomas College',
        slotDuration: 4,
        operatingHours: { open: '06:00', close: '18:00' },
        status: 'available',
        description: 'FIFA standard football ground with natural turf'
    },
    {
        name: 'Indoor Basketball Court',
        type: 'court',
        institution: 'Ananda College',
        slotDuration: 1,
        operatingHours: { open: '08:00', close: '21:00' },
        status: 'available',
        description: 'Air-conditioned indoor basketball court'
    },
    {
        name: 'Tennis Court A',
        type: 'court',
        institution: 'Royal College',
        slotDuration: 1,
        operatingHours: { open: '06:00', close: '20:00' },
        status: 'available',
        description: 'Hard court surface tennis court'
    },
    {
        name: 'Athletics Track',
        type: 'track',
        institution: 'St. Thomas College',
        slotDuration: 4,
        operatingHours: { open: '05:00', close: '17:00' },
        status: 'available',
        description: '400m synthetic athletics track'
    },
    {
        name: 'School Gym',
        type: 'gym',
        institution: 'Ananda College',
        slotDuration: 1,
        operatingHours: { open: '06:00', close: '22:00' },
        status: 'available',
        description: 'Fully equipped gym with modern equipment'
    }
];

async function seedFacilities() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');

        // Clear existing facilities
        await Facility.deleteMany({});
        console.log('🗑️  Cleared existing facilities');

        // Insert sample data
        const inserted = await Facility.insertMany(sampleFacilities);
        console.log(`🌱 Seeded ${inserted.length} facilities:`);
        inserted.forEach(f => {
            console.log(`   - ${f.name} (${f.type}) @ ${f.institution} — ${f.slotDuration}hr slots`);
        });

        await mongoose.connection.close();
        console.log('✅ Done! Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        process.exit(1);
    }
}

seedFacilities();

