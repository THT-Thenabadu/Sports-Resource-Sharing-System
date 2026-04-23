/**
 * Seeds dummy data for testing the Security Dashboard (properties, bookings, entry logs).
 *
 * Usage (from repo root):
 *   node backend/seed/securityDashboardSeed.js
 *
 * Optional env:
 *   SEED_SECURITY_FORCE=1   — remove previous SEED data for the demo owner and re-insert
 *
 * Login as the demo owner:
 *   Email:    security-demo-owner@example.com
 *   Password: Demo123456
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../Booking/models/Booking');
const EntryLog = require('../models/EntryLog');

const DEMO_EMAIL = 'security-demo-owner@example.com';
const DEMO_PASSWORD = 'Demo123456';
const DEMO_NAME = 'Security Demo Owner';

const SEED_TITLE_PREFIX = '[SEED]';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(base, n) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

async function getOrCreateDemoOwner() {
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);
    user = await User.create({
      name: DEMO_NAME,
      email: DEMO_EMAIL,
      password: hashed,
      role: 'owner',
      businessName: 'Demo Sports Venue'
    });
    console.log(`Created demo owner: ${DEMO_EMAIL}`);
  } else {
    if (user.role !== 'owner') {
      user.role = 'owner';
      await user.save();
    }
    console.log(`Using existing user: ${DEMO_EMAIL}`);
  }
  return user;
}

async function clearSeedData(ownerId) {
  const props = await Property.find({ owner: ownerId, title: new RegExp(`^${SEED_TITLE_PREFIX}`) });
  const ids = props.map((p) => p._id);
  if (ids.length) {
    await Booking.deleteMany({ facilityId: { $in: ids } });
    await Property.deleteMany({ _id: { $in: ids } });
    console.log(`Removed ${ids.length} seed properties and their bookings.`);
  }
  await EntryLog.deleteMany({ owner: ownerId, name: /^SEED / });
  console.log('Removed seed entry logs.');
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const owner = await getOrCreateDemoOwner();

  if (process.env.SEED_SECURITY_FORCE === '1') {
    await clearSeedData(owner._id);
  } else {
    const existing = await Property.findOne({ owner: owner._id, title: new RegExp(`^${SEED_TITLE_PREFIX}`) });
    if (existing) {
      console.log('Seed data already exists. Set SEED_SECURITY_FORCE=1 to replace.');
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  const p1 = await Property.create({
    owner: owner._id,
    title: `${SEED_TITLE_PREFIX} Football Ground A`,
    description: 'Full-size football pitch for matches and training.',
    sportType: 'Football',
    propertyType: 'ground',
    address: 'Lane 1, Sports Complex',
    city: 'Colombo',
    postalCode: '00100',
    pricePerHour: 5000,
    maxPlayers: 22,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    openingTime: '06:00',
    closingTime: '22:00',
    amenities: ['Floodlights', 'Changing rooms'],
    status: 'active',
    availabilityState: 'available'
  });

  const p2 = await Property.create({
    owner: owner._id,
    title: `${SEED_TITLE_PREFIX} Cricket Pitch 1`,
    description: 'Outdoor cricket pitch.',
    sportType: 'Cricket',
    propertyType: 'ground',
    address: 'Block B',
    city: 'Colombo',
    postalCode: '00100',
    pricePerHour: 4500,
    maxPlayers: 30,
    openingTime: '06:00',
    closingTime: '22:00',
    status: 'active',
    availabilityState: 'not_available'
  });

  const p3 = await Property.create({
    owner: owner._id,
    title: `${SEED_TITLE_PREFIX} Tennis Court 1`,
    description: 'Synthetic surface tennis court.',
    sportType: 'Tennis',
    propertyType: 'court',
    address: 'Court Wing',
    city: 'Colombo',
    postalCode: '00100',
    pricePerHour: 2000,
    maxPlayers: 4,
    openingTime: '07:00',
    closingTime: '21:00',
    status: 'active',
    availabilityState: 'available'
  });

  const today = startOfToday();
  const tomorrow = addDays(today, 1);
  const dayAfter = addDays(today, 2);

  const demoUserId = 'demo-customer-001';

  const bookingsPayload = [
    {
      facilityId: p1._id,
      facilityName: p1.title,
      facilityType: p1.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Rahul Sharma',
      date: today,
      startTime: '10:00',
      endTime: '11:00',
      guestCount: 22,
      status: 'pending'
    },
    {
      facilityId: p3._id,
      facilityName: p3.title,
      facilityType: p3.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Priya Patel',
      date: today,
      startTime: '14:00',
      endTime: '15:00',
      guestCount: 4,
      status: 'pending'
    },
    {
      facilityId: p2._id,
      facilityName: p2.title,
      facilityType: p2.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Amit Singh',
      date: tomorrow,
      startTime: '09:00',
      endTime: '10:00',
      guestCount: 18,
      status: 'pending'
    },
    {
      facilityId: p1._id,
      facilityName: p1.title,
      facilityType: p1.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Sanjay Verma',
      date: today,
      startTime: '15:00',
      endTime: '16:00',
      guestCount: 20,
      status: 'confirmed'
    },
    {
      facilityId: p3._id,
      facilityName: p3.title,
      facilityType: p3.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Anita Mehta',
      date: tomorrow,
      startTime: '08:00',
      endTime: '09:00',
      guestCount: 6,
      status: 'confirmed'
    },
    {
      facilityId: p1._id,
      facilityName: p1.title,
      facilityType: p1.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Rajesh Kumar',
      date: today,
      startTime: '09:00',
      endTime: '10:00',
      guestCount: 24,
      status: 'checkedin'
    },
    {
      facilityId: p2._id,
      facilityName: p2.title,
      facilityType: p2.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Amit Singh',
      date: today,
      startTime: '09:00',
      endTime: '13:00',
      guestCount: 30,
      status: 'checkedin'
    },
    {
      facilityId: p3._id,
      facilityName: p3.title,
      facilityType: p3.propertyType,
      institution: 'Property Owner',
      userId: demoUserId,
      userName: 'Rahul Sharma',
      date: dayAfter,
      startTime: '10:00',
      endTime: '11:00',
      guestCount: 22,
      status: 'checkedout'
    }
  ];

  await Booking.insertMany(bookingsPayload);
  console.log(`Inserted ${bookingsPayload.length} bookings.`);

  const logs = [
    { name: 'SEED Rahul Sharma', type: 'Member', facility: 'Football Ground A', entryTime: '09:55', exitTime: '12:10', idVerified: true },
    { name: 'SEED Priya Patel', type: 'Visitor', facility: 'Tennis Court 1', entryTime: '13:40', exitTime: '', idVerified: true },
    { name: 'SEED Delivery - Amazon', type: 'Service', facility: 'Main Gate', entryTime: '11:20', exitTime: '11:35', idVerified: false },
    { name: 'SEED Unknown Person', type: 'Visitor', facility: 'Side Gate', entryTime: '08:05', exitTime: '08:12', idVerified: false },
    { name: 'SEED Coach Mike', type: 'Member', facility: 'Cricket Pitch 1', entryTime: '08:50', exitTime: '', idVerified: true },
    { name: 'SEED Staff - Cleaning', type: 'Service', facility: 'Football Ground A', entryTime: '06:30', exitTime: '07:45', idVerified: true },
    { name: 'SEED Junior League', type: 'Visitor', facility: 'Football Ground A', entryTime: '16:00', exitTime: '', idVerified: true }
  ];

  await EntryLog.insertMany(
    logs.map((l) => ({
      owner: owner._id,
      name: l.name,
      type: l.type,
      facility: l.facility,
      entryTime: l.entryTime,
      exitTime: l.exitTime,
      idVerified: l.idVerified,
      logDate: new Date()
    }))
  );
  console.log(`Inserted ${logs.length} entry logs for today.`);

  console.log('\n--- Demo login (Security / Owner dashboard) ---');
  console.log(`Email:    ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log('Use security credentials flow if you use that login path.\n');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
