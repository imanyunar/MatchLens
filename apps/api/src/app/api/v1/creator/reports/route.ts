import { NextRequest } from 'next/server';
import { getFootballProvider } from '@/lib/football/adapter';
import { getOrGenerateMatchAnalysis } from '@/lib/ai/orchestrator';
import { apiError, apiSuccess } from '@/lib/response';
import { creatorReportSchema } from '@/lib/validation/schemas';


export async function POST(request: NextRequest) {
  try {
    const json = await request.json().catch(() => ({}));
    const parseResult = creatorReportSchema.safeParse(json);

    if (!parseResult.success) {
      return apiError(
        'Invalid request body',
        400,
        'VALIDATION_ERROR',
        parseResult.error.flatten()
      );
    }

    const { matchId, format, tone } = parseResult.data;
    const provider = getFootballProvider();
    const match = await provider.getMatchById(matchId);

    if (!match) {
      return apiError(`Match with ID "${matchId}" was not found`, 404, 'NOT_FOUND');
    }

    const [stats, events] = await Promise.all([
      provider.getMatchStats(matchId),
      provider.getMatchEvents(matchId),
    ]);

    const analysis = await getOrGenerateMatchAnalysis(match, stats, events);

    // Format output based on requested format
    let content: Record<string, unknown> = {};

    if (format === 'SUMMARY_CARD') {
      content = {
        title: `${match.homeTeam.name} ${match.score.home} - ${match.score.away} ${match.awayTeam.name}`,
        headline: analysis.headline,
        keyStat: `${match.homeTeam.shortName} ${stats?.home.expectedGoals ?? 0} xG vs ${match.awayTeam.shortName} ${stats?.away.expectedGoals ?? 0} xG`,
        topFactor: analysis.tacticalFactors[0]?.title ?? 'Tactical battle',
        evidence: analysis.tacticalFactors[0]?.evidence ?? '',
      };
    } else if (format === 'TACTICAL_THREAD') {
      content = {
        threadPosts: [
          `1/4 ⚽ Autopsy: ${analysis.headline}`,
          `2/4 📊 The Data: ${analysis.summary}`,
          `3/4 🔑 Key Factor: ${analysis.tacticalFactors[0]?.title} - ${analysis.tacticalFactors[0]?.explanation}`,
          `4/4 ⏱️ Turning Point: Minute ${analysis.keyTurningPoint.minute} - ${analysis.keyTurningPoint.description}`,
        ],
      };
    } else if (format === 'VIDEO_SCRIPT_OUTLINE') {
      content = {
        hook: `Did ${match.score.home > match.score.away ? match.homeTeam.name : match.awayTeam.name} really deserve to win this match? Here is the data breakdown.`,
        sections: [
          { title: 'Intro & Scoreline', notes: `Show 1st half scoreline and stats.` },
          { title: 'Turning Point', notes: analysis.keyTurningPoint.description },
          { title: 'Tactical Reason', notes: analysis.tacticalFactors.map((f) => f.title).join(', ') },
          { title: 'Conclusion', notes: analysis.summary },
        ],
      };
    }

    return apiSuccess({
      matchId,
      format,
      tone,
      generatedContent: content,
      sourceAnalysis: {
        headline: analysis.headline,
        modelName: analysis.modelName,
      },
    });
  } catch (error) {
    console.error('[API] /creator/reports error:', error);
    return apiError(
      error instanceof Error ? error.message : 'Failed to generate creator report',
      500,
      'INTERNAL_SERVER_ERROR'
    );
  }
}
