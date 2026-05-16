import jwt from 'jsonwebtoken';
import type { JwtPayload } from '@codex/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}
