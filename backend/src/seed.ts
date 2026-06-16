import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database (minimal — no demo jobs or applicants)...');

  const existing = await prisma.hospital.findFirst();
  if (existing) {
    console.log('Database already has data; skipping seed. Reset the DB to re-seed.');
    return;
  }

  await prisma.hospital.create({
    data: {
      name: 'Demo Multispeciality Hospital',
      shortName: 'Demo Hospital',
      type: 'Multispeciality Hospital',
      city: 'Kolkata',
      state: 'West Bengal',
      address: '',
      phone: '',
      email: 'recruitment@demo-hospital.in',
      website: '',
      registrationNumber: '',
      beds: 0,
      founded: 2000,
      about: 'Complete your hospital profile in Settings after signing in as a recruiter.',
      specialties: JSON.stringify(['General Medicine', 'Cardiology', 'Nursing']),
      verified: false,
      verifiedOn: null,
      verifiedBy: null,
    },
  });

  console.log('Seed complete. Post jobs from the recruiter portal; candidates will see live listings only.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
