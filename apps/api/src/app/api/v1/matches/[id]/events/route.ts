import { NextRequest } from 'next/server';
import { getFootballProvider } from '@/lib/football/adapter';
import { apiError, apiSuccess } from '@/lib/response';


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError('Match ID is required', 400, 'INVALID_PARAM');
    }

    const provider = getFootballProvider();
    const events = await provider.getMatchEvents(id);

    return apiSuccess(events, { count: events.length });
  } catch (error) {
    console.error('[API] /matches/:id/events error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to retrieve match events',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
