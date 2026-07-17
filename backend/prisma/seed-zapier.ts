import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

const TEST_EMAIL = 'integration-testing@zapier.com';

async function main() {
  const apiKey = `pk_${uuid().replace(/-/g, '')}`;

  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { apiKey, tier: 'agency' },
    create: {
      email: TEST_EMAIL,
      name: 'Zapier Test Account',
      tier: 'agency',
      referralCode: uuid().slice(0, 8),
      apiKey,
      brandColor: '#3B4CCA',
    },
  });

  console.log('Zapier test user:', user.email, '| tier:', user.tier, '| API key:', apiKey);

  const project = await prisma.project.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      userId: user.id,
      name: 'Website Redesign — Acme Corp',
      description: 'Full redesign of the corporate site with new branding.',
      clientEmail: 'client@example.com',
      clientName: 'Jordan Lee',
    },
  });

  console.log('Sample project:', project.name, '| id:', project.id);

  const existingItems = await prisma.checklistItem.count({ where: { projectId: project.id } });
  if (existingItems === 0) {
    await prisma.checklistItem.createMany({
      data: [
        {
          projectId: project.id,
          title: 'Desktop mockups approved',
          status: 'approved',
          approvedBy: 'Jordan Lee',
          approvedAt: new Date(),
        },
        { projectId: project.id, title: 'Mobile mockups approved', status: 'pending' },
        { projectId: project.id, title: 'Homepage build', status: 'pending' },
      ],
    });
  }

  const existingFiles = await prisma.file.count({ where: { projectId: project.id } });
  if (existingFiles === 0) {
    await prisma.file.create({
      data: {
        projectId: project.id,
        name: 'homepage-mockup-v2.fig',
        url: 'https://storage.portalflow.app/demo/homepage-mockup-v2.fig',
        size: 3_800_000,
        uploadedBy: 'freelancer',
      },
    });
  }

  const existingMessages = await prisma.message.count({ where: { projectId: project.id } });
  if (existingMessages === 0) {
    await prisma.message.createMany({
      data: [
        { projectId: project.id, userEmail: TEST_EMAIL, content: 'Hi Jordan, here are the final desktop mockups.' },
        { projectId: project.id, userEmail: 'client@example.com', content: 'Looks great, approved!' },
      ],
    });
  }

  console.log('Zapier test account ready.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
