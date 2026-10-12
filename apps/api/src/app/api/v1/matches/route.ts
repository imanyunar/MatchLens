import { NextRequest } from 'next/server';
import { getFootballProvider } from '@/lib/football/adapter';
import { apiError, apiSuccess } from '@/lib/response';
import { matchesQuerySchema } from '@/lib/validation/schemas';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = matchesQuerySchema.safeParse({
      date: searchParams.get('date') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      competitionId: searchParams.get('competitionId') ?? undefined,
    });

    if (!parseResult.success) {
      return apiError(
        'Invalid query parameters',
        400,
        'VALIDATION_ERROR',
        parseResult.error.flatten()
      );
    }

    const provider = getFootballProvider();
    const matches = await provider.getMatches(parseResult.data);

    return apiSuccess(matches, {
      total: matches.length,
      provider: provider.name,
    });
  } catch (error) {
    console.error('[API] /matches error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to retrieve matches',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
