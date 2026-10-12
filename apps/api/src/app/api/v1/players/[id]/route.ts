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
      return apiError('Player ID is required', 400, 'INVALID_PARAM');
    }

    const provider = getFootballProvider();
    const player = await provider.getPlayerById(id);

    if (!player) {
      return apiError(`Player "${id}" not found`, 404, 'NOT_FOUND');
    }

    return apiSuccess(player);
  } catch (error) {
    console.error('[API] /players/:id error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to retrieve player',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
