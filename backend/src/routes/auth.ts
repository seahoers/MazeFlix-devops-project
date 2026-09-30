import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { hashPassword, verifyPassword } from '../lib/password';
import {
  clearSessionCookie,
  createSession,
  deleteSessionByToken,
  getSessionCookie,
  setSessionCookie,
} from '../lib/session';
import { requireAuth } from '../middleware/require-auth';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const POSTGRES_UNIQUE_VIOLATION = '23505';

export function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === POSTGRES_UNIQUE_VIOLATION
  );
}

export const authRouter = Router();

authRouter.post('/signup', async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const passwordHash = await hashPassword(parsed.data.password);

    let user;
    try {
      [user] = await db.insert(users).values({ email, passwordHash }).returning();
    } catch (err) {
      if (isUniqueViolation(err)) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }
      throw err;
    }

    const { token, expiresAt } = await createSession(user.id);
    setSessionCookie(res, token, expiresAt);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/signin', async (req, res, next) => {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const { token, expiresAt } = await createSession(user.id);
    setSessionCookie(res, token, expiresAt);
    res.status(200).json({ id: user.id, email: user.email });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/signout', async (req, res, next) => {
  try {
    const token = getSessionCookie(req);
    if (token) {
      await deleteSessionByToken(token);
    }
    clearSessionCookie(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.status(200).json({ id: req.user!.id, email: req.user!.email });
});
