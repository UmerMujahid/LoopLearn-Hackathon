/**
 * FoodLoop Seed Script
 * Generates sample users, food listings, and charity claims for hackathon demo.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/foodloop_db';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['provider', 'organization', 'admin'], default: 'provider' },
    organizationName: { type: String },
    address: { type: String },
    phone: { type: String },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

const foodListingSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodName: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    pickupLocation: { type: String, required: true },
    pickupLat: { type: Number, default: 37.7749 },
    pickupLng: { type: Number, default: -122.4194 },
    availableFrom: { type: Date, default: Date.now },
    availableUntil: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    description: { type: String },
    status: { type: String, enum: ['available', 'reserved', 'collected', 'expired'], default: 'available' },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    claimedAt: { type: Date, default: null },
    collectedAt: { type: Date, default: null },
}, { timestamps: true });

const requestSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    foodListingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'collected'], default: 'pending' },
    requestedQuantity: { type: Number, required: true },
    message: { type: String },
}, { timestamps: true });

const sustainabilitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    totalDonated: { type: Number, default: 0 },
    totalCollected: { type: Number, default: 0 },
    wasteReduced: { type: Number, default: 0 },
    co2Saved: { type: Number, default: 0 },
    month: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const FoodListing = mongoose.model('FoodListing', foodListingSchema);
const Request = mongoose.model('Request', requestSchema);
const SustainabilityStats = mongoose.model('SustainabilityStats', sustainabilitySchema);

const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✓ Connected to MongoDB');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Users
        console.log('Seeding Demo Accounts...');
        await User.deleteMany({});
        await FoodListing.deleteMany({});
        await Request.deleteMany({});
        await SustainabilityStats.deleteMany({});

        const admin = await User.create({
            name: 'Municipal Admin Officer',
            email: 'admin@foodloop.city',
            password: hashedPassword,
            role: 'admin',
            address: 'City Hall Zero-Waste Directorate, Suite 400',
            phone: '+1 555-010-0001',
            isVerified: true
        });

        const provider1 = await User.create({
            name: 'Chef Tariq Hassan',
            email: 'chef@grandpalacecatering.com',
            password: hashedPassword,
            role: 'provider',
            address: 'Grand Palace Banquet Hall, 45 Market St',
            phone: '+1 555-014-8821',
            isVerified: true
        });

        const provider2 = await User.create({
            name: 'Artisan Bakery Co.',
            email: 'surplus@downtownbakery.com',
            password: hashedPassword,
            role: 'provider',
            address: 'Downtown Artisan Bakery, 108 4th Ave',
            phone: '+1 555-019-3320',
            isVerified: true
        });

        const org1 = await User.create({
            name: 'Sarah Jenkins',
            email: 'intake@hopehaven.org',
            password: hashedPassword,
            role: 'organization',
            organizationName: 'Hope Haven Community Shelter',
            address: 'Downtown Relief Center, 5th Ave',
            phone: '+1 555-019-2834',
            isVerified: true
        });

        const org2 = await User.create({
            name: 'David Al-Mansoor',
            email: 'relief@barakahpantry.org',
            password: hashedPassword,
            role: 'organization',
            organizationName: 'Barakah Food Pantry',
            address: 'Central Avenue Relief Mission',
            phone: '+1 555-012-9844',
            isVerified: false // Unverified for admin verification demo flow
        });

        console.log('✓ Users created: 1 Admin, 2 Providers, 2 Organizations (1 verified, 1 pending)');

        // 2. Create Food Listings
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const listing1 = await FoodListing.create({
            providerId: provider1._id,
            foodName: '50 Gourmet Vegetarian Rice & Curry Bowls',
            category: 'meals',
            quantity: 50,
            unit: 'portions',
            pickupLocation: 'Grand Palace Back Kitchen Gate, 45 Market St',
            pickupLat: 37.7749,
            pickupLng: -122.4194,
            availableFrom: now,
            availableUntil: tomorrow,
            expiryDate: dayAfter,
            description: 'Freshly prepared vegetarian catering trays kept strictly in temperature-controlled chafers. Ready for shelter distribution.',
            status: 'available'
        });

        const listing2 = await FoodListing.create({
            providerId: provider2._id,
            foodName: '35 Loaves Artisanal Sourdough & Croissants',
            category: 'bakery',
            quantity: 35,
            unit: 'portions',
            pickupLocation: 'Downtown Artisan Bakery, 108 4th Ave',
            pickupLat: 37.7833,
            pickupLng: -122.4167,
            availableFrom: now,
            availableUntil: tomorrow,
            expiryDate: dayAfter,
            description: 'Freshly baked daily bread and morning croissants bagged in food-grade kraft bags.',
            status: 'available'
        });

        const listing3 = await FoodListing.create({
            providerId: provider1._id,
            foodName: '20 kg Fresh Crisp Organic Apples',
            category: 'produce',
            quantity: 20,
            unit: 'kg',
            pickupLocation: 'Grand Palace Receiving Bay, 45 Market St',
            pickupLat: 37.7750,
            pickupLng: -122.4200,
            availableFrom: now,
            availableUntil: tomorrow,
            expiryDate: dayAfter,
            description: 'Crisp organic orchard apples suitable for families and community kitchens.',
            status: 'collected',
            claimedBy: org1._id,
            claimedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
            collectedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        });

        console.log('✓ Food Listings seeded (2 Available, 1 Collected)');

        // 3. Create Request
        await Request.create({
            organizationId: org1._id,
            foodListingId: listing1._id,
            requestedQuantity: 50,
            message: 'Hope Haven has a volunteer van on the road. We can collect at 4:30 PM.',
            status: 'pending'
        });

        await Request.create({
            organizationId: org1._id,
            foodListingId: listing3._id,
            requestedQuantity: 20,
            message: 'Collected for evening community dinner.',
            status: 'collected'
        });

        console.log('✓ Claim requests seeded');

        // 4. Create Initial Sustainability Metrics
        const currentMonth = now.toISOString().slice(0, 7);
        await SustainabilityStats.create({
            userId: provider1._id,
            totalDonated: 50,
            wasteReduced: 20,
            co2Saved: 50,
            month: currentMonth
        });

        await SustainabilityStats.create({
            userId: org1._id,
            totalCollected: 50,
            wasteReduced: 20,
            co2Saved: 50,
            month: currentMonth
        });

        console.log('✓ Sustainability stats initialized');
        console.log('==============================================');
        console.log('✨ Seed completed successfully! Test credentials:');
        console.log('  Admin        : admin@foodloop.city / password123');
        console.log('  Food Donor   : chef@grandpalacecatering.com / password123');
        console.log('  Community Org: intake@hopehaven.org / password123');
        console.log('  Pending Org  : relief@barakahpantry.org / password123');
        console.log('==============================================');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seedDatabase();
