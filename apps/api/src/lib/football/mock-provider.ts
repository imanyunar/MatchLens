import { IFootballProvider } from './adapter';
import {
  Competition,
  Match,
  MatchEvent,
  MatchStatsComparison,
  Player,
  TransferReport,
} from './types';

const MOCK_COMPETITIONS: Record<string, Competition> = {
  pl: {
    id: 'pl',
    name: 'Premier League',
    code: 'PL',
    country: 'England',
    season: '2026/2027',
  },
  ucl: {
    id: 'ucl',
    name: 'UEFA Champions League',
    code: 'UCL',
    season: '2026/2027',
  },
  laliga: {
    id: 'laliga',
    name: 'La Liga',
    code: 'PD',
    country: 'Spain',
    season: '2026/2027',
  },
};

const MOCK_PLAYERS: Record<string, Player> = {
  'p-saka': {
    id: 'p-saka',
    name: 'Bukayo Saka',
    shortName: 'B. Saka',
    position: 'Attacker',
    jerseyNumber: 7,
    nationality: 'England',
    currentTeamId: 't-ars',
    currentTeamName: 'Arsenal FC',
    marketValue: 140000000,
  },
  'p-haaland': {
    id: 'p-haaland',
    name: 'Erling Haaland',
    shortName: 'E. Haaland',
    position: 'Attacker',
    jerseyNumber: 9,
    nationality: 'Norway',
    currentTeamId: 't-mci',
    currentTeamName: 'Manchester City FC',
    marketValue: 180000000,
  },
  'p-odegaard': {
    id: 'p-odegaard',
    name: 'Martin Ødegaard',
    shortName: 'M. Ødegaard',
    position: 'Midfielder',
    jerseyNumber: 8,
    nationality: 'Norway',
    currentTeamId: 't-ars',
    currentTeamName: 'Arsenal FC',
    marketValue: 110000000,
  },
  'p-bellingham': {
    id: 'p-bellingham',
    name: 'Jude Bellingham',
    shortName: 'J. Bellingham',
    position: 'Midfielder',
    jerseyNumber: 5,
    nationality: 'England',
    currentTeamId: 't-rma',
    currentTeamName: 'Real Madrid',
    marketValue: 180000000,
  },
  'p-yamal': {
    id: 'p-yamal',
    name: 'Lamine Yamal',
    shortName: 'L. Yamal',
    position: 'Attacker',
    jerseyNumber: 19,
    nationality: 'Spain',
    currentTeamId: 't-bar',
    currentTeamName: 'FC Barcelona',
    marketValue: 150000000,
  },
};

const MOCK_MATCHES: Match[] = [
  {
    id: 'match-001',
    competition: MOCK_COMPETITIONS.pl,
    homeTeam: {
      id: 't-ars',
      name: 'Arsenal FC',
      shortName: 'Arsenal',
      tla: 'ARS',
      venue: 'Emirates Stadium',
    },
    awayTeam: {
      id: 't-mci',
      name: 'Manchester City FC',
      shortName: 'Man City',
      tla: 'MCI',
      venue: 'Etihad Stadium',
    },
    scheduledAt: '2026-10-11T16:30:00Z',
    status: 'FINISHED',
    score: {
      home: 2,
      away: 1,
      halfTimeHome: 0,
      halfTimeAway: 1,
    },
    venue: 'Emirates Stadium, London',
    referee: 'Michael Oliver',
    matchday: 8,
  },
  {
    id: 'match-002',
    competition: MOCK_COMPETITIONS.laliga,
    homeTeam: {
      id: 't-rma',
      name: 'Real Madrid',
      shortName: 'Real Madrid',
      tla: 'RMA',
      venue: 'Santiago Bernabéu',
    },
    awayTeam: {
      id: 't-bar',
      name: 'FC Barcelona',
      shortName: 'Barcelona',
      tla: 'BAR',
      venue: 'Camp Nou',
    },
    scheduledAt: '2026-10-10T19:00:00Z',
    status: 'FINISHED',
    score: {
      home: 3,
      away: 2,
      halfTimeHome: 1,
      halfTimeAway: 1,
    },
    venue: 'Santiago Bernabéu, Madrid',
    referee: 'Jesús Gil Manzano',
    matchday: 9,
  },
  {
    id: 'match-003',
    competition: MOCK_COMPETITIONS.pl,
    homeTeam: {
      id: 't-liv',
      name: 'Liverpool FC',
      shortName: 'Liverpool',
      tla: 'LIV',
      venue: 'Anfield',
    },
    awayTeam: {
      id: 't-che',
      name: 'Chelsea FC',
      shortName: 'Chelsea',
      tla: 'CHE',
      venue: 'Stamford Bridge',
    },
    scheduledAt: '2026-10-12T19:00:00Z',
    status: 'LIVE',
    score: {
      home: 1,
      away: 1,
      halfTimeHome: 1,
      halfTimeAway: 0,
    },
    venue: 'Anfield, Liverpool',
    referee: 'Anthony Taylor',
    matchday: 8,
  },
  {
    id: 'match-004',
    competition: MOCK_COMPETITIONS.ucl,
    homeTeam: {
      id: 't-bay',
      name: 'Bayern Munich',
      shortName: 'Bayern',
      tla: 'BAY',
      venue: 'Allianz Arena',
    },
    awayTeam: {
      id: 't-psg',
      name: 'Paris Saint-Germain',
      shortName: 'PSG',
      tla: 'PSG',
      venue: 'Parc des Princes',
    },
    scheduledAt: '2026-10-14T19:00:00Z',
    status: 'SCHEDULED',
    score: {
      home: 0,
      away: 0,
    },
    venue: 'Allianz Arena, Munich',
    matchday: 3,
  },
];

const MOCK_EVENTS: Record<string, MatchEvent[]> = {
  'match-001': [
    {
      id: 'ev-01',
      matchId: 'match-001',
      teamId: 't-mci',
      teamName: 'Manchester City FC',
      playerId: 'p-haaland',
      playerName: 'Erling Haaland',
      eventType: 'GOAL',
      minute: 18,
      description: 'Haaland left-footed finish inside the 6-yard box from a cutback cross.',
    },
    {
      id: 'ev-02',
      matchId: 'match-001',
      teamId: 't-ars',
      teamName: 'Arsenal FC',
      eventType: 'YELLOW_CARD',
      minute: 34,
      description: 'Tactical foul preventing a fast break on the halfway line.',
    },
    {
      id: 'ev-03',
      matchId: 'match-001',
      teamId: 't-ars',
      teamName: 'Arsenal FC',
      playerId: 'p-saka',
      playerName: 'Bukayo Saka',
      eventType: 'GOAL',
      minute: 54,
      description: 'Saka cuts inside from the right wing and curls past the keeper into the bottom left corner.',
    },
    {
      id: 'ev-04',
      matchId: 'match-001',
      teamId: 't-mci',
      teamName: 'Manchester City FC',
      eventType: 'SUBSTITUTION',
      minute: 72,
      description: 'Defensive reinforcement to contain Arsenal high pressing.',
    },
    {
      id: 'ev-05',
      matchId: 'match-001',
      teamId: 't-ars',
      teamName: 'Arsenal FC',
      playerId: 'p-odegaard',
      playerName: 'Martin Ødegaard',
      eventType: 'GOAL',
      minute: 86,
      description: 'Ødegaard strikes a half-volley from edge of the box following an interception turnover.',
    },
  ],
};

const MOCK_STATS: Record<string, MatchStatsComparison> = {
  'match-001': {
    matchId: 'match-001',
    home: {
      teamId: 't-ars',
      teamName: 'Arsenal FC',
      possessionPct: 46.5,
      shotsTotal: 14,
      shotsOnTarget: 6,
      shotsOffTarget: 5,
      shotsBlocked: 3,
      expectedGoals: 2.15,
      cornerKicks: 7,
      offsides: 1,
      fouls: 10,
      yellowCards: 2,
      redCards: 0,
      passesTotal: 412,
      passesAccurate: 348,
      passAccuracyPct: 84.5,
      advancedStats: {
        bigChancesCreated: 4,
        tacklesWon: 18,
        interceptions: 12,
        highPressTurnovers: 9,
      },
    },
    away: {
      teamId: 't-mci',
      teamName: 'Manchester City FC',
      possessionPct: 53.5,
      shotsTotal: 11,
      shotsOnTarget: 4,
      shotsOffTarget: 4,
      shotsBlocked: 3,
      expectedGoals: 1.42,
      cornerKicks: 5,
      offsides: 2,
      fouls: 12,
      yellowCards: 3,
      redCards: 0,
      passesTotal: 508,
      passesAccurate: 448,
      passAccuracyPct: 88.2,
      advancedStats: {
        bigChancesCreated: 2,
        tacklesWon: 14,
        interceptions: 7,
        highPressTurnovers: 4,
      },
    },
  },
};

const MOCK_TRANSFERS: TransferReport[] = [
  {
    id: 'tr-01',
    playerId: 'p-yamal',
    playerName: 'Lamine Yamal',
    fromTeamId: 't-bar',
    fromTeamName: 'FC Barcelona',
    sourceName: 'Fabrizio Romano',
    sourceTier: 1,
    status: 'COMPLETED',
    reportedFee: 0,
    currency: 'EUR',
    sourceUrl: 'https://twitter.com/FabrizioRomano',
    summary: 'Barcelona reach complete agreement on long-term contract extension until 2031 with €1B release clause.',
    confidenceScore: 0.98,
    reportedAt: '2026-10-11T12:00:00Z',
  },
  {
    id: 'tr-02',
    playerId: 'p-saka',
    playerName: 'Bukayo Saka',
    fromTeamId: 't-ars',
    fromTeamName: 'Arsenal FC',
    sourceName: 'David Ornstein (The Athletic)',
    sourceTier: 1,
    status: 'ADVANCED_TALKS',
    reportedFee: 0,
    currency: 'GBP',
    sourceUrl: 'https://theathletic.com',
    summary: 'Arsenal in advanced discussions with Bukayo Saka over record new wage structure.',
    confidenceScore: 0.94,
    reportedAt: '2026-10-09T08:30:00Z',
  },
  {
    id: 'tr-03',
    playerId: 'p-haaland',
    playerName: 'Erling Haaland',
    fromTeamId: 't-mci',
    fromTeamName: 'Manchester City FC',
    toTeamId: 't-rma',
    toTeamName: 'Real Madrid',
    sourceName: 'Diario AS',
    sourceTier: 3,
    status: 'RUMOR',
    reportedFee: 200000000,
    currency: 'EUR',
    sourceUrl: 'https://as.com',
    summary: 'Real Madrid monitoring Haaland contractual release clause for summer 2027 window.',
    confidenceScore: 0.52,
    reportedAt: '2026-10-08T14:15:00Z',
  },
];

export const mockFootballProvider: IFootballProvider = {
  name: 'MockFootballProvider',

  async getMatches(options) {
    let result = [...MOCK_MATCHES];
    if (options?.status) {
      result = result.filter(
        (m) => m.status.toLowerCase() === options.status?.toLowerCase()
      );
    }
    if (options?.competitionId) {
      result = result.filter(
        (m) => m.competition.id.toLowerCase() === options.competitionId?.toLowerCase()
      );
    }
    return result;
  },

  async getMatchById(id) {
    const match = MOCK_MATCHES.find((m) => m.id === id);
    return match || null;
  },

  async getMatchEvents(matchId) {
    return MOCK_EVENTS[matchId] || [];
  },

  async getMatchStats(matchId) {
    return MOCK_STATS[matchId] || null;
  },

  async getPlayerById(playerId) {
    return MOCK_PLAYERS[playerId] || null;
  },

  async getTransferReports() {
    return MOCK_TRANSFERS;
  },
};
