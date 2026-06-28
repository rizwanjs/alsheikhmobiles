const { connectDB, Mobile, connection } = require('./db');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/alsheikh_mobiles';

const brands = ['Apple', 'Samsung', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Infinix', 'Tecno'];
const appleModels = ['iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 15 Pro Max'];
const samsungModels = ['Galaxy S22', 'Galaxy S23', 'Galaxy S24 Ultra', 'Galaxy A14', 'Galaxy A54', 'Galaxy Z Fold 5'];
const xiaomiModels = ['Redmi Note 12', 'Redmi Note 13 Pro', 'Poco X5', 'Xiaomi 13T'];
const otherModels = ['Reno 10', 'V29', 'C55', 'Note 30', 'Camon 20'];

// Keep track of generated IMEIs to avoid unique-constraint collisions
const usedImeis = new Set();

function generateRandomImei() {
  let imei = '';
  do {
    imei = '';
    for (let i = 0; i < 15; i++) {
      imei += Math.floor(Math.random() * 10).toString();
    }
  } while (usedImeis.has(imei));
  usedImeis.add(imei);
  return imei;
}

function generateRandomCnic() {
  let cnic = '35202-';
  for (let i = 0; i < 7; i++) cnic += Math.floor(Math.random() * 10).toString();
  cnic += `-${Math.floor(Math.random() * 9) + 1}`;
  return cnic;
}

function generateRandomMobile() {
  const brand = brands[Math.floor(Math.random() * brands.length)];
  let modelName = '';
  
  if (brand === 'Apple') modelName = appleModels[Math.floor(Math.random() * appleModels.length)];
  else if (brand === 'Samsung') modelName = samsungModels[Math.floor(Math.random() * samsungModels.length)];
  else if (brand === 'Xiaomi') modelName = xiaomiModels[Math.floor(Math.random() * xiaomiModels.length)];
  else modelName = `${brand} ${otherModels[Math.floor(Math.random() * otherModels.length)]}`;

  const price = Math.floor(Math.random() * 150) * 1000 + 20000; // Between 20k and 170k

  return {
    model: modelName,
    purchasingPrice: price,
    imei: generateRandomImei(),
    details: `Brand new PTA Approved, Box packed. Color: ${['Black', 'White', 'Blue', 'Gold'][Math.floor(Math.random() * 4)]}`,
    status: 'Available',
    sellerName: ['Ahmad', 'Bilal', 'Usman', 'Ali', 'Zain', 'Hamza', 'Saad'][Math.floor(Math.random() * 7)],
    sellerCnic: generateRandomCnic(),
    purchasePaymentType: Math.random() < 0.3 ? 'Udhaar' : 'Cash'
  };
}

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDB(MONGODB_URI);
    console.log('Connected.');

    // Clear existing data so re-seeding doesn't trip the unique IMEI index
    await Mobile.deleteMany({});
    await connection.db.collection('customers').deleteMany({});
    console.log('Cleared existing mobiles & customers.');

    const mobilesToInsert = [];
    for (let i = 0; i < 60; i++) {
      mobilesToInsert.push(generateRandomMobile());
    }

    console.log(`Inserting ${mobilesToInsert.length} mobiles...`);
    await Mobile.insertMany(mobilesToInsert);
    console.log('Seed completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      mongoose.disconnect();
    }
    console.log('Seed script finished.');
  }
}

seedDatabase();
