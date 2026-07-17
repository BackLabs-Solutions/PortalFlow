import prisma from '../config/database';
import { signMagicLink, verifyMagicLink, signToken } from '../utils/jwt';
import { sendMagicLinkEmail } from './email.service';
import { AppError } from '../utils/errors';
import { v4 as uuid } from 'uuid';

export async function sendMagicLink(email: string) {
  const token = signMagicLink({ email });
  await sendMagicLinkEmail(email, token);
  return { message: 'Check your email for the magic link' };
}

export async function verifyMagicLinkToken(token: string) {
  const { email } = verifyMagicLink(token);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        referralCode: uuid().slice(0, 8),
      },
    });
  }

  const jwt = signToken({ userId: user.id, email: user.email });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
    },
    token: jwt,
  };
}

export async function generateApiKey(userId: string) {
  const apiKey = `pk_${uuid().replace(/-/g, '')}`;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { apiKey },
  });

  if (!user) throw new AppError(404, 'User not found');

  return { apiKey };
}
