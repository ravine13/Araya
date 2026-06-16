const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const hospital = await prisma.hospital.create({
    data: { name: 'Test Hospital', shortName: 'TH', type: 'Clinic', verified: true, about: 'Test' }
  });
  const user = await prisma.user.create({
    data: { name: 'Test User', email: 'test@example.com', password: 'test', role: 'RECRUITER', hospitalId: hospital.id }
  });
  const job = await prisma.job.create({
    data: {
      hospitalId: hospital.id,
      role: 'Doctor', specialty: 'General', type: 'Full-time', experience: '1-3', location: 'Delhi', salary: '10 LPA',
      tags: JSON.stringify(['Tag1']), responsibilities: JSON.stringify(['Resp1']), requirements: JSON.stringify(['Req1']), perks: JSON.stringify(['Perk1']), postedDays: 0
    }
  });
  console.log(job);
}
main().catch(console.error).finally(() => prisma.$disconnect());
