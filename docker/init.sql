-- MatchLens Database Schema (PostgreSQL 16)
-- Target: Local Docker PostgreSQL & Supabase Compatible

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    favorite_club_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Competitions
CREATE TABLE IF NOT EXISTS competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    country VARCHAR(50),
    logo_url TEXT,
    season VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teams
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    tla VARCHAR(10),
    logo_url TEXT,
    founded INT,
    venue VARCHAR(100),
    country VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Players
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    position VARCHAR(20),
    jersey_number INT,
    date_of_birth DATE,
    nationality VARCHAR(50),
    current_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    photo_url TEXT,
    market_value BIGINT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Matches
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(50) UNIQUE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('SCHEDULED', 'TIMED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED')),
    home_score INT DEFAULT 0,
    away_score INT DEFAULT 0,
    half_time_home_score INT,
    half_time_away_score INT,
    venue VARCHAR(100),
    referee VARCHAR(100),
    matchday INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Match Stats (Team-level)
CREATE TABLE IF NOT EXISTS match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    possession_pct NUMERIC(5, 2) DEFAULT 0,
    shots_total INT DEFAULT 0,
    shots_on_target INT DEFAULT 0,
    shots_off_target INT DEFAULT 0,
    shots_blocked INT DEFAULT 0,
    expected_goals NUMERIC(4, 2), -- xG
    corner_kicks INT DEFAULT 0,
    offsides INT DEFAULT 0,
    fouls INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    passes_total INT DEFAULT 0,
    passes_accurate INT DEFAULT 0,
    pass_accuracy_pct NUMERIC(5, 2) DEFAULT 0,
    advanced_stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);

-- 7. Match Events (Goals, Cards, Substitutions, VAR)
CREATE TABLE IF NOT EXISTS match_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(50) UNIQUE,
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    assist_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    event_type VARCHAR(30) NOT NULL CHECK (event_type IN ('GOAL', 'PENALTY_GOAL', 'MISSED_PENALTY', 'OWN_GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION', 'VAR_DECISION', 'WOODWORK')),
    minute INT NOT NULL,
    stoppage_minute INT DEFAULT 0,
    description TEXT,
    event_detail JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Player Match Stats
CREATE TABLE IF NOT EXISTS player_match_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    minutes_played INT DEFAULT 0,
    rating NUMERIC(4, 2),
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    shots INT DEFAULT 0,
    shots_on_target INT DEFAULT 0,
    key_passes INT DEFAULT 0,
    touches INT DEFAULT 0,
    pass_accuracy_pct NUMERIC(5, 2) DEFAULT 0,
    duels_won INT DEFAULT 0,
    duels_lost INT DEFAULT 0,
    tackles INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    raw_stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- 9. User Favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    favorite_type VARCHAR(20) NOT NULL CHECK (favorite_type IN ('TEAM', 'PLAYER', 'COMPETITION')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, favorite_type, target_id)
);

-- 10. Articles
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    source_name VARCHAR(100) NOT NULL,
    source_url TEXT NOT NULL,
    related_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    related_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Transfer Reports
CREATE TABLE IF NOT EXISTS transfer_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    from_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    to_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    source_name VARCHAR(100) NOT NULL,
    source_tier INT CHECK (source_tier BETWEEN 1 AND 5),
    status VARCHAR(30) NOT NULL CHECK (status IN ('RUMOR', 'ADVANCED_TALKS', 'BID_SUBMITTED', 'ACCEPTED', 'MEDICAL_PENDING', 'COMPLETED', 'COLLAPSED')),
    reported_fee BIGINT,
    currency VARCHAR(10) DEFAULT 'EUR',
    source_url TEXT,
    summary TEXT NOT NULL,
    confidence_score NUMERIC(3, 2),
    reported_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AI Analyses (Why It Happened & Autopsies)
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    analysis_type VARCHAR(30) NOT NULL CHECK (analysis_type IN ('MATCH_RESULT', 'TACTICAL_DEEPDIVE', 'EVENT_AUTOPSY')),
    event_id UUID REFERENCES match_events(id) ON DELETE SET NULL,
    headline VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    tactical_narrative JSONB NOT NULL,
    evidence_claims JSONB NOT NULL,
    missing_data_disclaimers JSONB DEFAULT '[]'::jsonb,
    input_hash VARCHAR(64) NOT NULL,
    model_name VARCHAR(50) NOT NULL,
    prompt_tokens INT,
    completion_tokens INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Analysis Feedback
CREATE TABLE IF NOT EXISTS analysis_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID REFERENCES ai_analyses(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_helpful BOOLEAN NOT NULL,
    feedback_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Saved Reports
CREATE TABLE IF NOT EXISTS saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(30) NOT NULL,
    content_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Tactical Documents (RAG Knowledge Base & Embeddings)
CREATE TABLE IF NOT EXISTS tactical_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type VARCHAR(50) NOT NULL, -- 'PRESS_CONFERENCE', 'TACTICAL_REVIEW', 'TEAM_REPORT'
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    chunk_content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536),
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES for fast lookup
CREATE INDEX IF NOT EXISTS idx_matches_scheduled_at ON matches(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_comp ON matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_match_events_match ON match_events(match_id, minute);
CREATE INDEX IF NOT EXISTS idx_match_stats_match ON match_stats(match_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_match ON ai_analyses(match_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_transfer_player ON transfer_reports(player_id);
CREATE INDEX IF NOT EXISTS idx_tactical_embedding ON tactical_documents USING hnsw (embedding vector_cosine_ops);

-- SEED DATA (Premier League demo match)
INSERT INTO competitions (id, external_id, name, code, country, season)
VALUES ('00000000-0000-0000-0000-000000000001', 'PL', 'Premier League', 'PL', 'England', '2026/2027')
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO teams (id, external_id, name, short_name, tla, country)
VALUES 
('00000000-0000-0000-0000-000000000010', 'ARS', 'Arsenal FC', 'Arsenal', 'ARS', 'England'),
('00000000-0000-0000-0000-000000000011', 'MCI', 'Manchester City FC', 'Man City', 'MCI', 'England')
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO players (id, external_id, name, short_name, position, jersey_number, current_team_id)
VALUES 
('00000000-0000-0000-0000-000000000100', 'SAKA', 'Bukayo Saka', 'Saka', 'Attacker', 7, '00000000-0000-0000-0000-000000000010'),
('00000000-0000-0000-0000-000000000101', 'HAALAND', 'Erling Haaland', 'Haaland', 'Attacker', 9, '00000000-0000-0000-0000-000000000011'),
('00000000-0000-0000-0000-000000000102', 'ODEGAARD', 'Martin Ødegaard', 'Ødegaard', 'Midfielder', 8, '00000000-0000-0000-0000-000000000010')
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO matches (id, external_id, competition_id, home_team_id, away_team_id, scheduled_at, status, home_score, away_score, venue, referee)
VALUES 
('00000000-0000-0000-0000-000000001000', 'MATCH_ARS_MCI_2026', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', NOW() - INTERVAL '1 day', 'FINISHED', 2, 1, 'Emirates Stadium', 'Michael Oliver')
ON CONFLICT (external_id) DO NOTHING;

INSERT INTO match_stats (match_id, team_id, possession_pct, shots_total, shots_on_target, expected_goals, corner_kicks, fouls, passes_total, pass_accuracy_pct)
VALUES 
('00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000010', 46.5, 14, 6, 2.15, 7, 10, 412, 84.5),
('00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000011', 53.5, 11, 4, 1.42, 5, 12, 508, 88.2)
ON CONFLICT (match_id, team_id) DO NOTHING;

INSERT INTO match_events (id, external_id, match_id, team_id, player_id, event_type, minute, description)
VALUES 
('00000000-0000-0000-0000-000000010001', 'EV_01', '00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000101', 'GOAL', 18, 'Haaland left-footed finish inside the 6-yard box'),
('00000000-0000-0000-0000-000000001000', 'EV_02', '00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000100', 'GOAL', 54, 'Saka curling strike into the bottom left corner'),
('00000000-0000-0000-0000-000000010003', 'EV_03', '00000000-0000-0000-0000-000000001000', '00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000102', 'GOAL', 86, 'Ødegaard edge-of-the-box half-volley after transition turnover')
ON CONFLICT (external_id) DO NOTHING;
