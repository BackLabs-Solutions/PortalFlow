import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const MAGIC_LINK_SECRET = process.env.MAGIC_LINK_SECRET || 'dev-magic-secret';

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
}

export function signMagicLink(payload: { email: string }): string {
  return jwt.sign(payload, MAGIC_LINK_SECRET, { expiresIn: '15m' });
}

export function verifyMagicLink(token: string): { email: string } {
  return jwt.verify(token, MAGIC_LINK_SECRET) as { email: string };
}
