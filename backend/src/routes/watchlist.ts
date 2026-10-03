import { Router } from 'express';
import { z } from 'zod';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { watchlistItems } from '../db/schema';
import { requireAuth } from '../middleware/require-auth';

// Postgres `integer` (int4) tops out at 2147483647; anything beyond that is a valid JS safe
// integer but would make the insert below throw an unhandled 500 instead of a 400.
const showIdBodySchema = z.object({
  showId: z.number().int().positive().max(2147483647),
});

const showIdParamSchema = z.object({
  showId: z.coerce.number().int().positive().max(2147483647),
});

export const watchlistRouter = Router();

watchlistRouter.use(requireAuth);

watchlistRouter.get('/', async (req, res, next) => {
  try {
    const items = await db
      .select({ showId: watchlistItems.showId })
      .from(watchlistItems)
      .where(eq(watchlistItems.userId, req.user!.id))
      .orderBy(asc(watchlistItems.createdAt));

    res.status(200).json(items.map((item) => item.showId));
  } catch (err) {
    next(err);
  }
});

watchlistRouter.post('/', async (req, res, next) => {
  try {
    const parsed = showIdBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid show id' });
      return;
    }

    await db
      .insert(watchlistItems)
      .values({ userId: req.user!.id, showId: parsed.data.showId })
      .onConflictDoNothing();

    res.status(201).json({ showId: parsed.data.showId });
  } catch (err) {
    next(err);
  }
});

watchlistRouter.delete('/:showId', async (req, res, next) => {
  try {
    const parsed = showIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid show id' });
      return;
    }

    await db
      .delete(watchlistItems)
      .where(
        and(eq(watchlistItems.userId, req.user!.id), eq(watchlistItems.showId, parsed.data.showId)),
      );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
