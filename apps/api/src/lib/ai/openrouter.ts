import { env } from '../config/env';
import { Match, MatchEvent, MatchStatsComparison } from '../football/types';
import { mockAIProvider } from './mock-ai';
import { EventAutopsyResult, MatchAnalysisResult } from './types';

function getOpenRouterApiKey(): string {
  return env.OPENROUTER_API_KEY || env.AI_API_KEY || '';
}

function extractJsonPayload(text: string): string {
  // Strip markdown code fences if model enclosed JSON in ```json ... ```
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }
  // Find first { and last }
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1).trim();
  }
  return text.trim();
}

export async function analyzeMatchWithOpenRouter(
  match: Match,
  stats: MatchStatsComparison | null,
  events: MatchEvent[]
): Promise<MatchAnalysisResult> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    console.warn('[OpenRouter] No API key provided, falling back to mock tactical engine.');
    return mockAIProvider.generateMatchAnalysis(match, stats, events);
  }

  const model = env.AI_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

  const systemPrompt = `You are MatchLens Football Intelligence Engine.
Analyze the following football match grounded STRICTLY in the provided data.
DO NOT invent facts, scores, or statistics.
Clearly separate observed facts from tactical interpretations.
Disclose any missing data metrics (e.g., physical sprint distances, xG coordinates if missing).
You must output ONLY valid, strictly parseable JSON adhering to the required structure.`;

  const userPrompt = `Match: ${match.homeTeam.name} vs ${match.awayTeam.name}
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
      "impactLevel": "HIGH"
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

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'MatchLens Football Intelligence',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[OpenRouter] API returned status ${response.status}: ${errorText}. Falling back to mock tactical engine.`);
      return mockAIProvider.generateMatchAnalysis(match, stats, events);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn('[OpenRouter] Empty content received, falling back to mock.');
      return mockAIProvider.generateMatchAnalysis(match, stats, events);
    }

    const cleanedJson = extractJsonPayload(content);
    const parsed = JSON.parse(cleanedJson);

    return {
      matchId: match.id,
      headline: parsed.headline || `${match.homeTeam.name} vs ${match.awayTeam.name} Tactical Analysis`,
      summary: parsed.summary || '',
      tacticalNarrative: parsed.tacticalNarrative || '',
      tacticalFactors: Array.isArray(parsed.tacticalFactors) ? parsed.tacticalFactors : [],
      keyTurningPoint: parsed.keyTurningPoint || {
        minute: 0,
        description: 'No single turning point identified',
        whyCrucial: '',
      },
      observedFacts: Array.isArray(parsed.observedFacts) ? parsed.observedFacts : [],
      interpretations: Array.isArray(parsed.interpretations) ? parsed.interpretations : [],
      missingDataDisclaimers: Array.isArray(parsed.missingDataDisclaimers) ? parsed.missingDataDisclaimers : [],
      modelName: `${model} (OpenRouter)`,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[OpenRouter] Error generating match analysis:', error);
    return mockAIProvider.generateMatchAnalysis(match, stats, events);
  }
}

export async function analyzeEventAutopsyWithOpenRouter(
  match: Match,
  event: MatchEvent,
  stats: MatchStatsComparison | null
): Promise<EventAutopsyResult> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    console.warn('[OpenRouter] No API key provided, falling back to mock event autopsy.');
    return mockAIProvider.generateEventAutopsy(match, event, stats);
  }

  const model = env.AI_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b:free';

  const systemPrompt = `You are MatchLens Football Intelligence Engine.
Perform a deep tactical Match Autopsy for the specified match event grounded strictly in the provided data.
DO NOT hallucinate or assume metrics not present in the data.
You must output ONLY valid, strictly parseable JSON adhering to the required structure.`;

  const userPrompt = `Match: ${match.homeTeam.name} vs ${match.awayTeam.name}
Competition: ${match.competition.name}
Score: ${match.score.home} - ${match.score.away}
Target Event: ${JSON.stringify(event, null, 2)}
Match Stats: ${JSON.stringify(stats, null, 2)}

Return ONLY a valid JSON object matching this schema:
{
  "headline": "Tactical breakdown headline for this event",
  "tacticalPrecursor": "What tactical patterns or sequences led up to this event",
  "executionBreakdown": "How the event unfolded tactically from the data",
  "subsequentImpact": "How this event impacted momentum and tactics after it occurred",
  "evidenceCited": ["Evidence item 1", "Evidence item 2"]
}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'MatchLens Football Intelligence',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[OpenRouter] API returned status ${response.status}: ${errorText}. Falling back to mock event autopsy.`);
      return mockAIProvider.generateEventAutopsy(match, event, stats);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return mockAIProvider.generateEventAutopsy(match, event, stats);
    }

    const cleanedJson = extractJsonPayload(content);
    const parsed = JSON.parse(cleanedJson);

    return {
      matchId: match.id,
      eventId: event.id,
      minute: event.minute,
      eventType: event.eventType,
      headline: parsed.headline || `Tactical Breakdown: ${event.eventType} in minute ${event.minute}`,
      tacticalPrecursor: parsed.tacticalPrecursor || '',
      executionBreakdown: parsed.executionBreakdown || '',
      subsequentImpact: parsed.subsequentImpact || '',
      evidenceCited: Array.isArray(parsed.evidenceCited) ? parsed.evidenceCited : [],
      modelName: `${model} (OpenRouter)`,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[OpenRouter] Error generating event autopsy:', error);
    return mockAIProvider.generateEventAutopsy(match, event, stats);
  }
}
