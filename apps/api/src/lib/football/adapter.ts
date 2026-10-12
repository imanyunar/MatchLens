import {
  Match,
  MatchEvent,
  MatchStatsComparison,
  Player,
  TransferReport,
} from './types';
import { env } from '../config/env';
import { mockFootballProvider } from './mock-provider';
import { footballDataOrgProvider } from './football-data-org';

export interface GetMatchesOptions {
  date?: string;
  status?: string;
  competitionId?: string;
}

export interface IFootballProvider {
  name: string;
  getMatches(options?: GetMatchesOptions): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | null>;
  getMatchEvents(matchId: string): Promise<MatchEvent[]>;
  getMatchStats(matchId: string): Promise<MatchStatsComparison | null>;
  getPlayerById(playerId: string): Promise<Player | null>;
  getTransferReports(): Promise<TransferReport[]>;
}

export function getFootballProvider(): IFootballProvider {
  switch (env.FOOTBALL_PROVIDER) {
    case 'football-data-org':
      return footballDataOrgProvider;
    case 'mock':
    default:
      // If user provided a football API key, auto-activate real provider
      if (env.FOOTBALL_API_KEY) {
        return footballDataOrgProvider;
      }
      return mockFootballProvider;
  }
}
