import { env } from '../config/env';
import { Match, MatchEvent, MatchStatsComparison } from '../football/types';
import { mockAIProvider } from './mock-ai';
import { EventAutopsyResult, MatchAnalysisResult } from './types';

export async function analyzeMatchWithAI(
  match: Match,
  stats: MatchStatsComparison | null,
  events: MatchEvent[]
): Promise<MatchAnalysisResult> {
  // If no AI API key is configured, use the evidence-grounded deterministic engine
  if (!env.AI_API_KEY || env.AI_PROVIDER === 'mock') {
    return mockAIProvider.generateMatchAnalysis(match, stats, events);
  }

  try {
    const prompt = `You are MatchLens Football Intelligence Engine.
Analyze the following football match grounded STRICTLY in the provided data.
DO NOT invent facts, scores, or statistics.
Clearly separate observed facts from tactical interpretations.
Disclose any missing data metrics (e.g., physical sprint distances, xG coordinates if missing).

Match: ${match.homeTeam.name} vs ${match.awayTeam.name}
Competition: ${match.competition.name}
Score: ${match.score.home} - ${match.score.away}
Venue: ${match.venue ?? 'Unknown'}
Events: ${JSON.stringify(events, null, 2)}
Stats: ${JSON.stringify(stats, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "headline": "Short punchy tactical headline",
  "summary": "1-2 paragraphs summarizing why this result occurred based on data",
  "tacticalNarrative": "Tactical analysis of shape, pressing, transitions",
  "tacticalFactors": [
    {
      "title": "Factor title",
      "evidence": "Observed data evidence",
      "explanation": "Why this influenced the match",
      "impactLevel": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "keyTurningPoint": {
    "minute": 54,
    "description": "What happened",
    "whyCrucial": "Tactical impact"
  },
  "observedFacts": ["Fact 1 grounded in data", "Fact 2"],
  "interpretations": ["Interpretation 1", "Interpretation 2"],
  "missingDataDisclaimers": ["Metric not available in provider feed"]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.AI_MODEL}:generateContent?key=${env.AI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2, // Low temperature for factual precision
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[AI] Gemini API error (${response.status}), falling back to mock provider.`);
      return mockAIProvider.generateMatchAnalysis(match, stats, events);
    }

    const json = await response.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return mockAIProvider.generateMatchAnalysis(match, stats, events);
    }

    const parsed = JSON.parse(candidateText);
    return {
      matchId: match.id,
      headline: parsed.headline || 'Tactical Match Analysis',
      summary: parsed.summary || '',
      tacticalNarrative: parsed.tacticalNarrative || '',
      tacticalFactors: parsed.tacticalFactors || [],
      keyTurningPoint: parsed.keyTurningPoint || {
        minute: 0,
        description: 'No single turning point identified',
        whyCrucial: '',
      },
      observedFacts: parsed.observedFacts || [],
      interpretations: parsed.interpretations || [],
      missingDataDisclaimers: parsed.missingDataDisclaimers || [],
      modelName: env.AI_MODEL,
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[AI] Failed to invoke Gemini API, using fallback engine:', err);
    return mockAIProvider.generateMatchAnalysis(match, stats, events);
  }
}

export async function analyzeEventAutopsyWithAI(
  match: Match,
  event: MatchEvent,
  stats: MatchStatsComparison | null
): Promise<EventAutopsyResult> {
  if (!env.AI_API_KEY || env.AI_PROVIDER === 'mock') {
    return mockAIProvider.generateEventAutopsy(match, event, stats);
  }

  // Similar fallback to mock
  return mockAIProvider.generateEventAutopsy(match, event, stats);
}
