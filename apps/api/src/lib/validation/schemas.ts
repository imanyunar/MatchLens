import { z } from 'zod';

export const matchesQuerySchema = z.object({
  date: z.string().optional(),
  status: z
    .enum([
      'SCHEDULED',
      'TIMED',
      'LIVE',
      'IN_PLAY',
      'PAUSED',
      'FINISHED',
      'POSTPONED',
      'CANCELLED',
    ])
    .optional(),
  competitionId: z.string().optional(),
});

export const matchIdParamSchema = z.object({
  id: z.string().min(1, 'Match ID is required'),
});

export const eventAutopsyParamSchema = z.object({
  id: z.string().min(1, 'Match ID is required'),
  eventId: z.string().min(1, 'Event ID is required'),
});

export const creatorReportSchema = z.object({
  matchId: z.string().min(1, 'Match ID is required'),
  format: z.enum(['SUMMARY_CARD', 'TACTICAL_THREAD', 'VIDEO_SCRIPT_OUTLINE']),
  tone: z.enum(['ANALYTICAL', 'ENTERTAINING', 'FAN_PERSPECTIVE']).default('ANALYTICAL'),
  focusPlayerId: z.string().optional(),
});
