import { PrismaClient } from '@prisma/client';
import { v4 as uuid } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@portalflow.com' },
    update: {},
    create: {
      email: 'demo@portalflow.com',
      name: 'Demo Freelancer',
      tier: 'pro',
      referralCode: 'DEMO2026',
      apiKey: `pk_test_${uuid().replace(/-/g, '')}`,
      brandColor: '#185FA5',
    },
  });

  console.log('Seed user:', user.email, '| API Key:', user.apiKey);

  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Refonte Site Web - Acme Corp',
      description: 'Refonte complète du site corporate avec nouveau branding',
      clientEmail: 'contact@acme.com',
      clientName: 'Marie Dupont',
    },
  });

  console.log('Seed project:', project.name);

  await prisma.checklistItem.createMany({
    data: [
      { projectId: project.id, title: 'Maquettes desktop validées', status: 'approved', approvedBy: 'Marie Dupont', approvedAt: new Date() },
      { projectId: project.id, title: 'Maquettes mobile validées', status: 'pending' },
      { projectId: project.id, title: 'Intégration page d\'accueil', status: 'pending' },
      { projectId: project.id, title: 'Contenu texte final', status: 'pending' },
    ],
  });

  await prisma.file.create({
    data: {
      projectId: project.id,
      name: 'maquette-desktop-v2.fig',
      url: 'https://storage.portalflow.app/mock/maquette-desktop-v2.fig',
      size: 4500000,
      uploadedBy: 'freelancer',
    },
  });

  await prisma.message.createMany({
    data: [
      { projectId: project.id, userEmail: 'demo@portalflow.com', content: 'Bonjour Marie, voici les maquettes desktop finales.' },
      { projectId: project.id, userEmail: 'contact@acme.com', content: 'Super, les maquettes desktop sont validées !' },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
