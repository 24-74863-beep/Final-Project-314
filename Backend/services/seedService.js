// Default data: one owner account, one mechanic, and the initial services and parts.
const Seed = require('../models/seedModel');
const { hashPw } = require('../utils/hash');

async function seed() {
  const now = new Date().toISOString();
  await Seed.insertOwner('Sir Ariel Socorro', 'owner', hashPw('owner123'), now);
  await Seed.insertMechanic('Mario Mekaniko', ['Engine Repair', 'Tune-up', 'Brakes'], now);
  await Seed.insertServices([['Oil Change', 250], ['General Check-up', 150], ['Tune-up', 600], ['Brake Adjustment', 200],
    ['Brake Pad Replacement', 350], ['Chain Cleaning & Lubrication', 150], ['Tire Change', 200],
    ['Battery Check / Replacement', 150], ['Carburetor Cleaning', 450], ['CVT Cleaning', 500],
    ['Electrical Troubleshooting', 400], ['Engine Overhaul', 5000]], now);
  await Seed.insertParts([['Engine Oil 1L', 280, 30], ['Spark Plug', 120, 25], ['Brake Pad (Front)', 350, 20], ['Brake Pad (Rear)', 300, 20],
    ['Drive Chain', 900, 10], ['Tire 2.75-17', 1200, 8], ['Battery 12V', 1100, 6], ['Air Filter', 220, 15],
    ['Clutch Cable', 180, 10], ['Headlight Bulb', 150, 20], ['CVT Belt', 650, 8], ['Brake Fluid', 180, 12]], now);
}

async function seedIfEmpty() {
  if (await Seed.countUsers() > 0) return false;
  await seed();
  return true;
}

module.exports = { seed, seedIfEmpty };
