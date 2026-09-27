/**
 * Seed script – creates admin user + sample users in MongoDB.
 *
 * Run:  npx ts-node --transpile-only src/utils/seed.ts
 */
import mongoose from 'mongoose';
import { config } from '../config/env';
import { UserModel } from '../models/user.model';

const SEED_USERS = [
  {
    name: 'Avinash Suryawanshi',
    email: 'admin@company.com',
    password: 'Admin@123',
    role: 'admin' as const,
    department: 'Engineering',
    status: 'active' as const
  },
  {
    name: 'Priya Patel',
    email: 'priya@company.com',
    password: 'Welcome@123',
    role: 'user' as const,
    department: 'HR',
    status: 'active' as const
  },
  {
    name: 'Rahul Sharma',
    email: 'rahul@company.com',
    password: 'Welcome@123',
    role: 'user' as const,
    department: 'Finance',
    status: 'active' as const
  },
  {
    name: 'Sneha Desai',
    email: 'sneha@company.com',
    password: 'Welcome@123',
    role: 'user' as const,
    department: 'Sales',
    status: 'inactive' as const
  },
  {
    name: 'Amit Kumar',
    email: 'amit@company.com',
    password: 'Welcome@123',
    role: 'user' as const,
    department: 'IT',
    status: 'active' as const
  }
];

async function seed() {
  console.log('🌱 Connecting to MongoDB…');
  await mongoose.connect(config.mongoUrl);
  console.log('✅ Connected:', config.mongoUrl);

  let created = 0, skipped = 0;

  for (const u of SEED_USERS) {
    const exists = await UserModel.findOne({ email: u.email });
    if (exists) {
      console.log(`  ⏭  Skipping ${u.email} (already exists)`);
      skipped++;
      continue;
    }
    await UserModel.create(u);
    console.log(`  ✅ Created: ${u.name} <${u.email}> [${u.role}]`);
    created++;
  }

  console.log(`\n🎉 Seed complete — ${created} created, ${skipped} skipped`);
  console.log('\n📋 Login credentials:');
  console.log('   Admin  →  admin@company.com  /  Admin@123');
  console.log('   User   →  priya@company.com  /  Welcome@123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
