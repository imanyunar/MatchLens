import crypto from 'crypto';
import { env } from '../config/env';
import { query } from '../db';
import { Match, MatchEvent, MatchStatsComparison } from '../football/types';
import { analyzeEventAutopsyWithAI, analyzeMatchWithAI } from './gemini';
import { mockAIProvider } from './mock-ai';
import { analyzeEventAutopsyWithOpenRouter, analyzeMatchWithOpenRouter } from './openrouter';
import { EventAutopsyResult, MatchAnalysisResult } from './types';

function computeInputHash(data: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

async function generateFreshMatchAnalysis(
  match: Match,
  stats: MatchStatsComparison | null,
  events: MatchEvent[]
): Promise<MatchAnalysisResult> {
  switch (env.AI_PROVIDER) {
    case 'openrouter':
      return analyzeMatchWithOpenRouter(match, stats, events);
    case 'gemini':
      return analyzeMatchWithAI(match, stats, events);
    case 'mock':
    default:
      return mockAIProvider.generateMatchAnalysis(match, stats, events);
  }
}

async function generateFreshEventAutopsy(
  match: Match,
  event: MatchEvent,
  stats: MatchStatsComparison | null
): Promise<EventAutopsyResult> {
  switch (env.AI_PROVIDER) {
    case 'openrouter':
      return analyzeEventAutopsyWithOpenRouter(match, event, stats);
    case 'gemini':
      return analyzeEventAutopsyWithAI(match, event, stats);
    case 'mock':
    default:
      return mockAIProvider.generateEventAutopsy(match, event, stats);
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getOrGenerateMatchAnalysis(
  match: Match,
  stats: MatchStatsComparison | null,
  events: MatchEvent[]
): Promise<MatchAnalysisResult> {
  const inputHash = computeInputHash({ matchId: match.id, score: match.score, eventsCount: events.length });
  const isUuid = UUID_REGEX.test(match.id);

  // 1. Try to fetch from PostgreSQL cache (if match ID is a valid UUID)
  if (isUuid) {
    try {
      const res = await query(
        `SELECT headline, summary, tactical_narrative, evidence_claims, missing_data_disclaimers, model_name, created_at 
         FROM ai_analyses 
         WHERE match_id = $1 AND analysis_type = 'MATCH_RESULT' AND input_hash = $2
         ORDER BY created_at DESC LIMIT 1`,
        [match.id, inputHash]
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          matchId: match.id,
          headline: row.headline,
          summary: row.summary,
          tacticalNarrative: row.tactical_narrative?.narrative ?? '',
          tacticalFactors: row.evidence_claims?.factors ?? [],
          keyTurningPoint: row.evidence_claims?.keyTurningPoint ?? {
            minute: 0,
            description: '',
            whyCrucial: '',
          },
          observedFacts: row.evidence_claims?.observedFacts ?? [],
          interpretations: row.evidence_claims?.interpretations ?? [],
          missingDataDisclaimers: row.missing_data_disclaimers ?? [],
          modelName: `${row.model_name} (Cached)`,
          generatedAt: row.created_at,
        };
      }
    } catch (err) {
      // If DB is offline or table is not ready, proceed gracefully without cache
      console.warn('[Cache] Could not read from DB cache, generating fresh analysis.');
    }
  }

  // 2. Generate analysis
  const analysis = await generateFreshMatchAnalysis(match, stats, events);

  // 3. Cache result in PostgreSQL if match ID is a valid UUID
  if (isUuid) {
    try {
      await query(
        `INSERT INTO ai_analyses (
          match_id, analysis_type, headline, summary, tactical_narrative, evidence_claims, 
          missing_data_disclaimers, input_hash, model_name
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          match.id,
          'MATCH_RESULT',
          analysis.headline,
          analysis.summary,
          JSON.stringify({ narrative: analysis.tacticalNarrative }),
          JSON.stringify({
            factors: analysis.tacticalFactors,
            keyTurningPoint: analysis.keyTurningPoint,
            observedFacts: analysis.observedFacts,
            interpretations: analysis.interpretations,
          }),
          JSON.stringify(analysis.missingDataDisclaimers),
          inputHash,
          analysis.modelName,
        ]
      );
    } catch (err) {
      console.warn('[Cache] Could not write analysis to PostgreSQL cache.');
    }
  }

  return analysis;
}

export async function getOrGenerateEventAutopsy(
  match: Match,
  event: MatchEvent,
  stats: MatchStatsComparison | null
): Promise<EventAutopsyResult> {
  return generateFreshEventAutopsy(match, event, stats);
}
