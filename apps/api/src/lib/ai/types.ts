export interface TacticalFactor {
  title: string;
  evidence: string; // Grounded in validated match data
  explanation: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MatchAnalysisResult {
  matchId: string;
  headline: string;
  summary: string;
  tacticalNarrative: string;
  tacticalFactors: TacticalFactor[];
  keyTurningPoint: {
    minute: number;
    description: string;
    whyCrucial: string;
  };
  observedFacts: string[];
  interpretations: string[];
  missingDataDisclaimers: string[];
  modelName: string;
  generatedAt: string;
}

export interface EventAutopsyResult {
  matchId: string;
  eventId: string;
  minute: number;
  eventType: string;
  headline: string;
  tacticalPrecursor: string; // What build-up or tactical shift preceded this event
  executionBreakdown: string; // How the event unfolded tactically
  subsequentImpact: string; // What changed in momentum/tactics after this event
  evidenceCited: string[];
  modelName: string;
  generatedAt: string;
}
