import type { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { getSessionCookie, getUserIdForToken } from '../lib/session';

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = getSessionCookie(req);
  if (!token) {
    res.status(401).json({ message: 'Not signed in' });
    return;
  }

  const userId = await getUserIdForToken(token);
  if (!userId) {
    res.status(401).json({ message: 'Not signed in' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) {
    res.status(401).json({ message: 'Not signed in' });
    return;
  }

  req.user = { id: user.id, email: user.email };
  next();
}
