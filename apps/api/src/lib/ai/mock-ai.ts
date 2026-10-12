import { Match, MatchEvent, MatchStatsComparison } from '../football/types';
import { EventAutopsyResult, MatchAnalysisResult } from './types';

export class MockAIProvider {
  name = 'MatchLens-Deterministic-Tactical-Engine-v1';

  generateMatchAnalysis(
    match: Match,
    stats: MatchStatsComparison | null,
    events: MatchEvent[]
  ): MatchAnalysisResult {
    const homeTeam = match.homeTeam.name;
    const awayTeam = match.awayTeam.name;
    const winner =
      match.score.home > match.score.away
        ? homeTeam
        : match.score.away > match.score.home
        ? awayTeam
        : null;

    const homeXG = stats?.home.expectedGoals ?? 'N/A';
    const awayXG = stats?.away.expectedGoals ?? 'N/A';
    const homeShots = stats?.home.shotsTotal ?? 0;
    const awayShots = stats?.away.shotsTotal ?? 0;

    return {
      matchId: match.id,
      headline: winner
        ? `${winner} prevail through superior vertical transitions and box efficiency`
        : `Evenly contested stalemate between ${homeTeam} and ${awayTeam}`,
      summary: `${homeTeam} (${match.score.home}) faced ${awayTeam} (${match.score.away}) in ${match.competition.name}. Despite City controlling 53.5% possession, Arsenal generated higher quality scoring opportunities (2.15 xG vs 1.42 xG) and capitalized on high turnovers.`,
      tacticalNarrative: `The match turned on pressing intensity during the second half. While ${awayTeam} dictated tempo in the first 45 minutes culminating in Haaland's 18th-minute opener, ${homeTeam} adjusted their counter-press structure, pressing aggressively in central channels and converting critical errors into decisive chances.`,
      tacticalFactors: [
        {
          title: 'High Turnover Exploitation',
          evidence: `Arsenal forced 9 turnovers in the opponent's half compared to City's 4.`,
          explanation: `Arsenal restricted City's progressive passing options from deep, isolating Rodri and forcing lateral circulation that broke down in the 86th minute.`,
          impactLevel: 'HIGH',
        },
        {
          title: 'Shot Quality over Volume',
          evidence: `Arsenal generated 2.15 xG from 14 shots (0.15 xG/shot average), whereas City produced 1.42 xG from 11 shots.`,
          explanation: `Arsenal consistently penetrated deep into the 18-yard box before releasing strikes, avoiding low-probability long-range attempts.`,
          impactLevel: 'HIGH',
        },
        {
          title: 'Second Half Wing Overload',
          evidence: `Bukayo Saka scored in the 54th minute following sustained pressure down Arsenal's right flank.`,
          explanation: `Switching play rapidly to 1v1 situations on the right exploited space behind City's advancing full-backs.`,
          impactLevel: 'MEDIUM',
        },
      ],
      keyTurningPoint: {
        minute: 54,
        description: `Bukayo Saka equalized with a curling left-footed strike to shift momentum.`,
        whyCrucial: `The goal disrupted Manchester City's game management and forced them to open up their defensive midfield block.`,
      },
      observedFacts: [
        `Final Score: ${homeTeam} ${match.score.home} - ${match.score.away} ${awayTeam}`,
        `Total Shots: ${homeTeam} ${homeShots} - ${awayShots} ${awayTeam}`,
        `Expected Goals (xG): ${homeTeam} ${homeXG} - ${awayXG} ${awayTeam}`,
        `Possession: ${homeTeam} ${stats?.home.possessionPct ?? 50}% - ${stats?.away.possessionPct ?? 50}% ${awayTeam}`,
        `Goals recorded: ${events.filter((e) => e.eventType === 'GOAL').length} total goals`,
      ],
      interpretations: [
        `Arsenal demonstrated greater tactical adaptability during half-time adjustments.`,
        `City struggled to sustain defensive compactness in transitional phases after the 70th minute.`,
      ],
      missingDataDisclaimers: [
        `Defensive line height and player sprint distance metrics are not available in this data tier.`,
        `Direct passing network coordinates are excluded from this feed.`,
      ],
      modelName: this.name,
      generatedAt: new Date().toISOString(),
    };
  }

  generateEventAutopsy(
    match: Match,
    event: MatchEvent,
    stats: MatchStatsComparison | null
  ): EventAutopsyResult {
    return {
      matchId: match.id,
      eventId: event.id,
      minute: event.minute,
      eventType: event.eventType,
      headline: `Tactical Breakdown: ${event.eventType} in minute ${event.minute}`,
      tacticalPrecursor: `In the 5 minutes preceding minute ${event.minute}, the defensive side faced consecutive attacking entries into the final third.`,
      executionBreakdown: `${event.description} The defensive block failed to track runner momentum, leaving space exploited by the attacker.`,
      subsequentImpact: `Following this event, the game tempo noticeably shifted, altering possession distribution and pressing triggers.`,
      evidenceCited: [
        `Event occurred at minute ${event.minute}`,
        `Player involved: ${event.playerName ?? 'Unknown'} (${event.teamName})`,
        `Current match score when event occurred`,
      ],
      modelName: this.name,
      generatedAt: new Date().toISOString(),
    };
  }
}

export const mockAIProvider = new MockAIProvider();
