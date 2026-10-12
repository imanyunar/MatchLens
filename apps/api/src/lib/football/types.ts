export type MatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'LIVE'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'CANCELLED';

export interface Competition {
  id: string;
  name: string;
  code: string;
  country?: string;
  logoUrl?: string;
  season: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla: string;
  logoUrl?: string;
  venue?: string;
  founded?: number;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker';
  jerseyNumber?: number;
  nationality?: string;
  currentTeamId?: string;
  currentTeamName?: string;
  photoUrl?: string;
  marketValue?: number;
}

export interface MatchScore {
  home: number;
  away: number;
  halfTimeHome?: number;
  halfTimeAway?: number;
}

export interface Match {
  id: string;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  scheduledAt: string;
  status: MatchStatus;
  score: MatchScore;
  venue?: string;
  referee?: string;
  matchday?: number;
}

export interface TeamMatchStats {
  teamId: string;
  teamName: string;
  possessionPct: number;
  shotsTotal: number;
  shotsOnTarget: number;
  shotsOffTarget?: number;
  shotsBlocked?: number;
  expectedGoals?: number; // xG
  cornerKicks: number;
  offsides: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  passesTotal: number;
  passesAccurate: number;
  passAccuracyPct: number;
  advancedStats?: Record<string, unknown>;
}

export interface MatchStatsComparison {
  matchId: string;
  home: TeamMatchStats;
  away: TeamMatchStats;
}

export type MatchEventType =
  | 'GOAL'
  | 'PENALTY_GOAL'
  | 'MISSED_PENALTY'
  | 'OWN_GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'VAR_DECISION'
  | 'WOODWORK';

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: string;
  teamName: string;
  playerId?: string;
  playerName?: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  eventType: MatchEventType;
  minute: number;
  stoppageMinute?: number;
  description: string;
  detail?: Record<string, unknown>;
}

export type TransferStatus =
  | 'RUMOR'
  | 'ADVANCED_TALKS'
  | 'BID_SUBMITTED'
  | 'ACCEPTED'
  | 'MEDICAL_PENDING'
  | 'COMPLETED'
  | 'COLLAPSED';

export interface TransferReport {
  id: string;
  playerId: string;
  playerName: string;
  playerPhotoUrl?: string;
  fromTeamId?: string;
  fromTeamName?: string;
  toTeamId?: string;
  toTeamName?: string;
  sourceName: string;
  sourceTier: number; // 1 (Most reliable) - 5 (Tabloid rumor)
  status: TransferStatus;
  reportedFee?: number;
  currency: string;
  sourceUrl?: string;
  summary: string;
  confidenceScore: number;
  reportedAt: string;
}
