import { NextRequest } from 'next/server';
import { getFootballProvider } from '@/lib/football/adapter';
import { getOrGenerateEventAutopsy } from '@/lib/ai/orchestrator';
import { apiError, apiSuccess } from '@/lib/response';


export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  try {
    const { id, eventId } = await params;
    if (!id || !eventId) {
      return apiError('Match ID and Event ID are required', 400, 'INVALID_PARAM');
    }

    const provider = getFootballProvider();
    const match = await provider.getMatchById(id);

    if (!match) {
      return apiError(`Match "${id}" was not found`, 404, 'NOT_FOUND');
    }

    const [events, stats] = await Promise.all([
      provider.getMatchEvents(id),
      provider.getMatchStats(id),
    ]);

    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) {
      return apiError(`Event "${eventId}" not found in match "${id}"`, 404, 'NOT_FOUND');
    }

    const autopsy = await getOrGenerateEventAutopsy(match, targetEvent, stats);

    return apiSuccess(autopsy);
  } catch (error) {
    console.error('[API] /matches/:id/events/:eventId/analysis error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to analyze match event autopsy',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
