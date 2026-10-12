import { NextRequest } from 'next/server';
import { getFootballProvider } from '@/lib/football/adapter';
import { getOrGenerateMatchAnalysis } from '@/lib/ai/orchestrator';
import { apiError, apiSuccess } from '@/lib/response';


export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError('Match ID is required', 400, 'INVALID_PARAM');
    }

    const provider = getFootballProvider();
    const match = await provider.getMatchById(id);

    if (!match) {
      return apiError(`Match with ID "${id}" was not found`, 404, 'NOT_FOUND');
    }

    const [stats, events] = await Promise.all([
      provider.getMatchStats(id),
      provider.getMatchEvents(id),
    ]);

    const analysis = await getOrGenerateMatchAnalysis(match, stats, events);

    return apiSuccess(analysis);
  } catch (error) {
    console.error('[API] /matches/:id/analysis error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to generate match analysis',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
