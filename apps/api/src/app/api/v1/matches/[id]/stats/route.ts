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
    const stats = await provider.getMatchStats(id);

    if (!stats) {
      return apiError(`Statistics for match "${id}" are not available yet`, 404, 'NOT_FOUND');
    }

    return apiSuccess(stats);
  } catch (error) {
    console.error('[API] /matches/:id/stats error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to retrieve match statistics',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
