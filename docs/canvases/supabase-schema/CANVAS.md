---
name: "supabase-schema"
title: "Supabase Schema - Athelgard Memory & Progression System"
type: "text/markdown"
---

# Supabase Schema
## Athelgard Memory & Progression System

**Document ID:** ATHELGARD-SUPABASE-SCHEMA-v1.0  
**Version:** 1.0.0  
**Status:** PRODUCTION READY  
**Author:** Kiran Wolfe  
**Last Updated:** August 5, 2026

---

## 🎯 Purpose

This schema defines the **Supabase database structure** for Athelgard's memory, progression, and persistence systems. It enables:
- Cross-surface context continuity
- User progression tracking
- Skill card collection
- Mission state persistence
- Ethical boundary enforcement

**Core Principle:** One database, one Athelgard, all surfaces.

---

## 🗄️ Database Structure

### Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │   Public Schema   │  │  Auth Schema      │                     │
│  │   (athelgard)     │  │  (supabase)       │                     │
│  │                  │  │                  │                     │
│  │ • users          │  │ • users          │                     │
│  │ • sessions       │  │ • refresh_tokens  │                     │
│  │ • memories        │  │                  │                     │
│  │ • progression     │  │                  │                     │
│  │ • skill_cards     │  │                  │                     │
│  │ • missions        │  │                  │                     │
│  │ • mission_state   │  │                  │                     │
│  │ • modes           │  │                  │                     │
│  │ • safety_logs     │  │                  │                     │
│  │ • audit_logs      │  │                  │                     │
│  │ • domains         │  │                  │                     │
│  │ • london_eras     │  │                  │                     │
│  │ • certifications  │  │                  │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    STORAGE                                   │ │
│  │  • avatars/          - User profile pictures                 │ │
│  │  • mission_assets/   - Mission images, diagrams              │ │
│  │  • card_assets/      - Skill card visuals                    │ │
│  │  • london_assets/    - London history images                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Table Definitions

---

### 1. users (Extended Profile)

**Purpose:** Store user profiles beyond Supabase auth

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Profile
    username TEXT UNIQUE,
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    
    -- Preferences
    preferred_mode TEXT DEFAULT 'guide' CHECK (preferred_mode IN ('guide', 'coach', 'gamemaster', 'builder', 'operator', 'audit')),
    theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light', 'system')),
    voice_enabled BOOLEAN DEFAULT true,
    
    -- BountyWarz Specific
    is_captain BOOLEAN DEFAULT false,
    captain_created_at TIMESTAMPTZ,
    nation_id INTEGER REFERENCES nations(id),
    
    -- Progression
    current_tier INTEGER DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 4),
    total_experience INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    
    -- Stats
    missions_completed INTEGER DEFAULT 0,
    skill_cards_earned INTEGER DEFAULT 0,
    sessions_count INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Cross-surface context
    last_surface TEXT CHECK (last_surface IN ('builder', 'world', 'voice', 'mobile')),
    last_mission_id UUID REFERENCES missions(id),
    last_branch TEXT
);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_captain ON users(is_captain) WHERE is_captain = true;
CREATE INDEX idx_users_tier ON users(current_tier);
CREATE INDEX idx_users_last_active ON users(last_active_at);
```

---

### 2. sessions (Cross-Surface Context)

**Purpose:** Maintain context across sessions and surfaces

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    
    -- Session context
    surface TEXT NOT NULL CHECK (surface IN ('builder', 'world', 'voice', 'mobile')),
    session_data JSONB NOT NULL DEFAULT '{}',
    
    -- Active state
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Conversation state (for voice/phone)
    conversation_id TEXT,
    conversation_history JSONB DEFAULT '[]'
);

-- Cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM sessions 
    WHERE expires_at < NOW();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Run daily at midnight
-- (Would be set up in Supabase dashboard under Database > Cron Jobs)
```

**Indexes:**
```sql
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_surface ON sessions(surface);
CREATE INDEX idx_sessions_active ON sessions(is_active) WHERE is_active = true;
```

---

### 3. memories (Long-Term Memory)

**Purpose:** Store Athelgard's long-term memory about users and projects

```sql
CREATE TABLE memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Memory type
    memory_type TEXT NOT NULL CHECK (memory_type IN ('user_preference', 'skill_mastery', 'mission_history', 'code_pattern', 'system_knowledge', 'ethical_boundary')),
    
    -- Memory content
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    
    -- Metadata
    source_surface TEXT CHECK (source_surface IN ('builder', 'world', 'voice', 'mobile')),
    confidence_score NUMERIC(3,2) DEFAULT 1.0 CHECK (confidence_score BETWEEN 0 AND 1),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, memory_type, key)
);

-- Trigger for updated_at
CREATE TRIGGER update_memories_updated_at
    BEFORE UPDATE ON memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_memories_user ON memories(user_id);
CREATE INDEX idx_memories_type ON memories(memory_type);
CREATE INDEX idx_memories_key ON memories(key);
CREATE INDEX idx_memories_accessed ON memories(last_accessed_at);
```

---

### 4. progression (User Progression Tracking)

**Purpose:** Track user progress through tiers and skill development

```sql
CREATE TABLE progression (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Tier progression
    tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
    tier_unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tier_completed_at TIMESTAMPTZ,
    
    -- Experience points
    experience_points INTEGER NOT NULL DEFAULT 0,
    experience_required INTEGER NOT NULL DEFAULT 1000,
    
    -- Readiness assessments
    readiness_score NUMERIC(5,2) DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
    last_assessment_at TIMESTAMPTZ,
    next_assessment_at TIMESTAMPTZ,
    
    -- Completion status
    is_complete BOOLEAN DEFAULT false
);

-- Trigger for updated_at
CREATE TRIGGER update_progression_updated_at
    BEFORE UPDATE ON progression
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate tier from experience
CREATE OR REPLACE FUNCTION calculate_tier(exp INTEGER) RETURNS INTEGER AS $$
DECLARE
    tier INTEGER;
BEGIN
    IF exp >= 10000 THEN tier := 4;
    ELSIF exp >= 5000 THEN tier := 3;
    ELSIF exp >= 2000 THEN tier := 2;
    ELSE tier := 1;
    END IF;
    RETURN tier;
END;
$$ LANGUAGE plpgsql;
```

**Indexes:**
```sql
CREATE INDEX idx_progression_user ON progression(user_id);
CREATE INDEX idx_progression_tier ON progression(tier);
CREATE INDEX idx_progression_experience ON progression(experience_points);
```

---

### 5. skill_cards (Learning Artifacts)

**Purpose:** Define all skill cards and user collections

```sql
CREATE TABLE skill_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Card metadata
    card_id TEXT NOT NULL UNIQUE,  -- e.g., "web-security-foundations"
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    
    -- Classification
    card_type TEXT NOT NULL CHECK (card_type IN ('certification', 'vulnerability', 'threat', 'remediation', 'historical')),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'expert')),
    
    -- Certification alignment
    certification_name TEXT,
    certification_domain TEXT,
    certification_objective TEXT,
    
    -- London history
    era_id INTEGER REFERENCES london_eras(id),
    historical_context TEXT,
    
    -- Visual
    image_url TEXT,
    icon TEXT,
    color TEXT DEFAULT '#4F46E5',
    
    -- Game integration
    is_mission_required BOOLEAN DEFAULT false,
    mission_prerequisite_id UUID REFERENCES missions(id),
    experience_value INTEGER DEFAULT 100
);

-- User skill card collection (junction table)
CREATE TABLE user_skill_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_card_id UUID NOT NULL REFERENCES skill_cards(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Collection status
    mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
    is_sealed BOOLEAN DEFAULT false,
    sealed_at TIMESTAMPTZ,
    
    -- How it was earned
    source_mission_id UUID REFERENCES missions(id),
    source_surface TEXT CHECK (source_surface IN ('builder', 'world', 'voice', 'mobile')),
    
    UNIQUE(user_id, skill_card_id)
);

-- Trigger for updated_at on skill_cards
CREATE TRIGGER update_skill_cards_updated_at
    BEFORE UPDATE ON skill_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_skill_cards_type ON skill_cards(card_type);
CREATE INDEX idx_skill_cards_difficulty ON skill_cards(difficulty_level);
CREATE INDEX idx_skill_cards_era ON skill_cards(era_id);
CREATE INDEX idx_user_skill_cards_user ON user_skill_cards(user_id);
CREATE INDEX idx_user_skill_cards_card ON user_skill_cards(skill_card_id);
```

---

### 6. missions (Mission Definitions)

**Purpose:** Define all missions in the game

```sql
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Mission metadata
    mission_id TEXT NOT NULL UNIQUE,  -- e.g., "great-fire-containment"
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    
    -- Classification
    era_id INTEGER REFERENCES london_eras(id),
    tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_duration_minutes INTEGER DEFAULT 10,
    
    -- Story elements
    briefing TEXT NOT NULL,
    narrative TEXT,
    debrief TEXT,
    
    -- Gameplay
    is_guest_accessible BOOLEAN DEFAULT true,
    is_captain_only BOOLEAN DEFAULT false,
    
    -- Requirements
    prerequisite_mission_id UUID REFERENCES missions(id),
    prerequisite_skill_card_id UUID REFERENCES skill_cards(id),
    
    -- Rewards
    experience_value INTEGER DEFAULT 250,
    skill_card_reward_id UUID REFERENCES skill_cards(id),
    currency_reward INTEGER DEFAULT 50,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false
);

-- Trigger for updated_at
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_missions_era ON missions(era_id);
CREATE INDEX idx_missions_tier ON missions(tier);
CREATE INDEX idx_missions_difficulty ON missions(difficulty_level);
CREATE INDEX idx_missions_active ON missions(is_active) WHERE is_active = true;
CREATE INDEX idx_missions_guest ON missions(is_guest_accessible) WHERE is_guest_accessible = true;
```

---

### 7. mission_state (User Mission Progress)

**Purpose:** Track user progress through missions

```sql
CREATE TABLE mission_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Progress
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'paused', 'completed', 'failed')) DEFAULT 'not_started',
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    
    -- State data
    current_objective_index INTEGER DEFAULT 0,
    objectives_completed INTEGER[] DEFAULT '{}',
    hints_used INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    
    -- Time tracking
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    
    -- Results
    is_successful BOOLEAN,
    score INTEGER,
    feedback TEXT,
    
    -- Unique constraint
    UNIQUE(user_id, mission_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_mission_state_updated_at
    BEFORE UPDATE ON mission_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Indexes:**
```sql
CREATE INDEX idx_mission_state_user ON mission_state(user_id);
CREATE INDEX idx_mission_state_mission ON mission_state(mission_id);
CREATE INDEX idx_mission_state_status ON mission_state(status);
CREATE INDEX idx_mission_state_progress ON mission_state(user_id, progress_percentage) WHERE progress_percentage > 0;
```

---

### 8. modes (Mode System)

**Purpose:** Define Athelgard's modes and their configurations

```sql
CREATE TABLE modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Mode definition
    mode_name TEXT NOT NULL UNIQUE CHECK (mode_name IN ('guide', 'coach', 'gamemaster', 'builder', 'operator', 'audit')),
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Voice configuration
    voice_style TEXT NOT NULL,
    tone TEXT NOT NULL,
    
    -- Capabilities
    capabilities TEXT[] NOT NULL,
    restrictions TEXT[] DEFAULT '{}',
    
    -- Surface availability
    available_surfaces TEXT[] NOT NULL DEFAULT '{"builder", "world", "voice", "mobile"}',
    
    -- Priority
    priority INTEGER NOT NULL DEFAULT 0
);

-- Mode switching rules
CREATE TABLE mode_switching_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_mode TEXT NOT NULL REFERENCES modes(mode_name),
    to_mode TEXT NOT NULL REFERENCES modes(mode_name),
    trigger_conditions JSONB NOT NULL,
    priority INTEGER NOT NULL DEFAULT 0,
    
    UNIQUE(from_mode, to_mode)
);
```

**Indexes:**
```sql
CREATE INDEX idx_modes_name ON modes(mode_name);
```

---

### 9. safety_logs (Audit Trail)

**Purpose:** Log all safety decisions for compliance and debugging

```sql
CREATE TABLE safety_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Context
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    surface TEXT CHECK (surface IN ('builder', 'world', 'voice', 'mobile')),
    
    -- Request
    request_type TEXT NOT NULL,
    request_data JSONB NOT NULL,
    
    -- Decision
    action TEXT NOT NULL CHECK (action IN ('ALLOW', 'BLOCK', 'REDIRECT', 'CLARIFY', 'WARN')),
    reason TEXT NOT NULL,
    tier INTEGER CHECK (tier BETWEEN 0 AND 3),
    
    -- Guardrails
    guardrails_checked TEXT[] NOT NULL,
    guardrails_violated TEXT[] DEFAULT '{}',
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical'))
);

-- Create index for time-based queries
CREATE INDEX idx_safety_logs_created ON safety_logs(created_at);
CREATE INDEX idx_safety_logs_user ON safety_logs(user_id);
CREATE INDEX idx_safety_logs_action ON safety_logs(action);
CREATE INDEX idx_safety_logs_severity ON safety_logs(severity);
```

---

### 10. audit_logs (System Audit)

**Purpose:** Track system changes and audits

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'system', 'athelgard')),
    
    -- Action
    action_type TEXT NOT NULL,
    action_data JSONB NOT NULL,
    
    -- Context
    surface TEXT CHECK (surface IN ('builder', 'world', 'voice', 'mobile')),
    mode TEXT CHECK (mode IN ('guide', 'coach', 'gamemaster', 'builder', 'operator', 'audit')),
    
    -- Target
    target_type TEXT,
    target_id UUID,
    
    -- Result
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT
);

-- Indexes
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);
```

---

### 11. domains (Domain Dictionary)

**Purpose:** Store BountyWarz and cybersecurity domain knowledge

```sql
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Domain info
    term TEXT NOT NULL UNIQUE,
    definition TEXT NOT NULL,
    short_definition TEXT,
    
    -- Classification
    category TEXT NOT NULL CHECK (category IN ('bountywarz', 'cybersecurity', 'game_mechanics', 'ethical_framework', 'london_history')),
    subcategory TEXT,
    
    -- Relationships
    related_terms TEXT[] DEFAULT '{}',
    see_also TEXT[] DEFAULT '{}',
    
    -- Usage
    example TEXT,
    usage_context TEXT,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ
);

-- Full-text search
CREATE INDEX idx_domains_search ON domains USING GIN (to_tsvector('english', term || ' ' || definition));

-- Indexes
CREATE INDEX idx_domains_category ON domains(category);
CREATE INDEX idx_domains_active ON domains(is_active) WHERE is_active = true;
```

---

### 12. london_eras (Historical Framework)

**Purpose:** Define the London history pedagogical scaffold

```sql
CREATE TABLE london_eras (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Era info
    era_name TEXT NOT NULL UNIQUE,
    year INTEGER,
    historical_event TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Cybersecurity mapping
    cybersecurity_concept TEXT NOT NULL,
    bug_class TEXT,
    cwe_id TEXT,
    threat_model TEXT NOT NULL,
    remediation_mindset TEXT NOT NULL,
    
    -- Certification
    cert_skill TEXT NOT NULL,
    cert_name TEXT,
    cert_domain TEXT,
    
    -- Visual
    image_url TEXT,
    color TEXT DEFAULT '#4F46E5',
    
    -- Order
    display_order INTEGER NOT NULL UNIQUE
);

-- Indexes
CREATE INDEX idx_london_eras_order ON london_eras(display_order);
```

---

### 13. nations (BountyWarz Nations)

**Purpose:** Define nations for player selection

```sql
CREATE TABLE nations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Nation info
    nation_name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    short_description TEXT,
    
    -- Visual
    flag_image_url TEXT,
    emblem_image_url TEXT,
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    
    -- Gameplay
    starting_mission_id UUID REFERENCES missions(id),
    unique_mission_types TEXT[],
    special_skill_cards TEXT[],
    
    -- Progression
    progression_path TEXT[] NOT NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false
);
```

---

### 14. certifications (Certification Pathways)

**Purpose:** Define real certification pathways for alignment

```sql
CREATE TABLE certifications (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Certification info
    certification_name TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL,
    description TEXT NOT NULL,
    website_url TEXT,
    
    -- Domains
    domains TEXT[] NOT NULL,
    
    -- Visual
    logo_url TEXT,
    color TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true
);

-- Mapping skill cards to certifications (junction table)
CREATE TABLE certification_skill_cards (
    certification_id INTEGER NOT NULL REFERENCES certifications(id),
    skill_card_id UUID NOT NULL REFERENCES skill_cards(id),
    domain TEXT NOT NULL,
    weight NUMERIC(5,2) DEFAULT 1.0,
    
    PRIMARY KEY (certification_id, skill_card_id)
);
```

---

## 🔐 Row Level Security (RLS)

All tables have RLS enabled for security. Here are the policies:

### Users Table
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Admins can see all users
CREATE POLICY "Admins can view all users"
ON users
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid()
    )
);
```

### Sessions Table
```sql
CREATE POLICY "Users can view own sessions"
ON sessions
FOR ALL
USING (auth.uid() = user_id);
```

### Memories Table
```sql
CREATE POLICY "Users can view own memories"
ON memories
FOR ALL
USING (auth.uid() = user_id);
```

### Progression Table
```sql
CREATE POLICY "Users can view own progression"
ON progression
FOR ALL
USING (auth.uid() = user_id);
```

### User Skill Cards Table
```sql
CREATE POLICY "Users can view own skill cards"
ON user_skill_cards
FOR ALL
USING (auth.uid() = user_id);
```

### Mission State Table
```sql
CREATE POLICY "Users can view own mission state"
ON mission_state
FOR ALL
USING (auth.uid() = user_id);
```

### Public Tables (Read-Only)
```sql
-- These tables are read-only for all users
CREATE POLICY "Public read access for skill_cards"
ON skill_cards
FOR SELECT
USING (true);

CREATE POLICY "Public read access for missions"
ON missions
FOR SELECT
USING (true);

CREATE POLICY "Public read access for london_eras"
ON london_eras
FOR SELECT
USING (true);

CREATE POLICY "Public read access for nations"
ON nations
FOR SELECT
USING (true);

CREATE POLICY "Public read access for domains"
ON domains
FOR SELECT
USING (true);

CREATE POLICY "Public read access for certifications"
ON certifications
FOR SELECT
USING (true);

CREATE POLICY "Public read access for modes"
ON modes
FOR SELECT
USING (true);
```

### Admin-Only Tables
```sql
CREATE POLICY "Admins only for safety_logs"
ON safety_logs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins only for audit_logs"
ON audit_logs
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM admins 
        WHERE user_id = auth.uid()
    )
);
```

---

## 📊 Initial Data

### Modes
```sql
INSERT INTO modes (mode_name, display_name, description, voice_style, tone, capabilities, restrictions, available_surfaces, priority) VALUES
('guide', 'Guide', 'Teaches gameplay concepts and explains cybersecurity principles', 'Warm, mentor-like, adaptive', 'Pedagogical, patient', ARRAY['teach', 'explain', 'coach', 'hint'], ARRAY[], ARRAY['world', 'mobile', 'voice'], 1),
('coach', 'Coach', 'Adapts challenge difficulty and helps users improve', 'Encouraging, patient', 'Supportive, growth-focused', ARRAY['adapt', 'assess', 'encourage', 'challenge'], ARRAY[], ARRAY['world', 'mobile'], 2),
('gamemaster', 'Gamemaster', 'Preserves narrative and system coherence', 'Deliberate, world-aware', 'Authoritative, systematic', ARRAY['design', 'balance', 'narrate', 'maintain'], ARRAY[], ARRAY['world'], 3),
('builder', 'Builder', 'Codes, architectures, and implements systems', 'Crisp, technical, precise', 'Concise, solution-focused', ARRAY['code', 'inspect', 'patch', 'verify', 'plan'], ARRAY['exploit', 'unauthorized_modify'], ARRAY['builder', 'web'], 4),
('operator', 'Operator', 'Inspects connected systems and state', 'Precise, cautious, service-aware', 'Analytical, detail-oriented', ARRAY['inspect', 'trace', 'monitor', 'diagnose'], ARRAY['mutate', 'modify'], ARRAY['builder', 'web'], 5),
('audit', 'Audit', 'Critiques UX, trust, and system flows', 'Blunt, diagnostic, analytical', 'Critical, thorough', ARRAY['review', 'critique', 'analyze', 'recommend'], ARRAY[], ARRAY['builder', 'web'], 6);
```

### Mode Switching Rules
```sql
INSERT INTO mode_switching_rules (from_mode, to_mode, trigger_conditions, priority) VALUES
('guide', 'gamemaster', '{"intent": ["mission_design", "world_building", "balance"], "surface": ["world"]}', 1),
('guide', 'builder', '{"intent": ["code", "bug", "fix", "patch", "implement"], "surface": ["builder", "web"]}', 2),
('guide', 'operator', '{"intent": ["inspect", "check", "review", "status"], "surface": ["builder", "web"]}', 3),
('guide', 'audit', '{"intent": ["audit", "review", "critique", "why"], "surface": ["builder", "web"]}', 4),
('builder', 'operator', '{"intent": ["github", "supabase", "vercel", "service", "state"], "surface": ["builder", "web"]}', 1),
('any', 'any', '{"intent": ["phone", "call"], "surface": ["voice"]}', 5);
```

### London Eras
```sql
INSERT INTO london_eras (era_name, year, historical_event, description, cybersecurity_concept, bug_class, cwe_id, threat_model, remediation_mindset, cert_skill, cert_name, cert_domain, display_order, color) VALUES
('Great Fire of London', 1666, 'The Great Fire of London', 'Cascading failure and the importance of containment in system design', 'Cascading failure, containment', 'Buffer overflow, memory corruption', 'CWE-125', 'Uncontrolled propagation', 'Segmentation, isolation', 'Risk Management', 'CompTIA Security+', 'Threats, Attacks, and Vulnerabilities', 1, '#F59E0B'),
('The Blitz', 1940, 'The Blitz of World War II', 'Resilience, redundancy, and distributed failure in critical infrastructure', 'Resilience, redundancy', 'DDoS, availability attacks', 'CWE-404', 'Resource exhaustion', 'Redundancy, failover', 'Business Continuity', 'CompTIA Security+', 'Architecture and Design', 2, '#4F46E5'),
('Victorian Era', 1850, 'Victorian Sewer System', 'Legacy systems and the hidden dependencies that maintain modern infrastructure', 'Legacy systems, hidden dependencies', 'Supply chain, third-party risk', 'CWE-1104', 'Compromised dependencies', 'Maintenance, updates', 'Supply Chain Security', '(ISC)² CISSP', 'Security Architecture and Engineering', 3, '#3B82F6'),
('Cold War', 1950, 'Telecom Espionage', 'Network trust, interception, and the challenges of secure communication', 'Network trust, interception', 'MITM, eavesdropping', 'CWE-200', 'Compromised communication', 'Encryption, authentication', 'Network Security', 'CompTIA Security+', 'Implementation', 4, '#10B981'),
('Modern London', 2000, 'Financial London', 'Fraud prevention, access control, and auditability in modern financial systems', 'Fraud, access control', 'Authentication bypass', 'CWE-287', 'Unauthorized access', 'Auditability, logging', 'Access Control', 'CompTIA Security+', 'Identity and Access Management', 5, '#8B5CF6');
```

### Nations
```sql
INSERT INTO nations (nation_name, description, short_description, flag_image_url, emblem_image_url, primary_color, secondary_color, starting_mission_id, unique_mission_types, special_skill_cards, progression_path, is_active, is_featured) VALUES
('Albion', 'The first nation, representing the heart of London and traditional cybersecurity values', 'Guardians of London', '/flags/albion.png', '/emblems/albion.png', '#4F46E5', '#1E293B', NULL, ARRAY['defensive', 'recon'], ARRAY['firebreak_protocol', 'blitz_defense'], ARRAY['trust', 'clarity', 'ethics'], true, true),
('Caledonia', 'Representing the northern reach and strategic thinking', 'Strategists of the North', '/flags/caledonia.png', '/emblems/caledonia.png', '#10B981', '#064E3B', NULL, ARRAY['strategic', 'analysis'], ARRAY['victorian_maintenance', 'cold_war_comms'], ARRAY['coherence', 'adaptability', 'precision'], true, false),
('Hibernia', 'Representing the western isles and creative problem-solving', 'Innovators of the West', '/flags/hibernia.png', '/emblems/hibernia.png', '#8B5CF6', '#7C3AED', NULL, ARRAY['creative', 'innovation'], ARRAY['financial_gateway'], ARRAY['imagination', 'resourcefulness', 'insight'], true, false),
('Cambria', 'Representing the western lands and systematic approaches', 'System Builders', '/flags/cambria.png', '/emblems/cambria.png', '#F59E0B', '#D97706', NULL, ARRAY['systematic', 'engineering'], ARRAY['blitz_defense'], ARRAY['discipline', 'rigor', 'thoroughness'], true, false);
```

### Certifications
```sql
INSERT INTO certifications (certification_name, provider, description, website_url, domains, logo_url, color, is_active) VALUES
('CompTIA Security+', 'CompTIA', 'Global certification that validates the baseline skills you need to perform core security functions and pursue an IT security career', 'https://www.comptia.org/certifications/security', ARRAY['Threats, Attacks, and Vulnerabilities', 'Architecture and Design', 'Implementation', 'Operations and Incident Response', 'Governance, Risk, and Compliance'], 'https://www.comptia.org/-/media/images/comptia/logos/security-plus-logo.ashx', '#0068B4', true),
('Certified Ethical Hacker', 'EC-Council', 'The most trusted ethical hacking certification and accreditation', 'https://www.eccouncil.org/programs/certified-ethical-hacker-ceh/', ARRAY['Footprinting and Reconnaissance', 'Scanning Networks', 'Enumeration', 'Vulnerability Analysis', 'System Hacking'], 'https://www.eccouncil.org/wp-content/uploads/2020/09/CEH-Logo.png', '#1E88E5', true),
('Offensive Security Certified Professional', 'Offensive Security', 'World-renowned ethical hacking certification', 'https://www.offensive-security.com/pwk-oscp/', ARRAY['Penetration Testing', 'Exploitation', 'Post-Exploitation', 'Reporting'], 'https://www.offensive-security.com/wp-content/uploads/2020/08/oscp-logo.png', '#1E3A8A', true),
('CISSP', '(ISC)²', 'Prove your skills, advance your career and gain the support of a community of cybersecurity leaders', 'https://www.isc2.org/Certifications/CISSP', ARRAY['Security and Risk Management', 'Asset Security', 'Security Architecture and Engineering', 'Communication and Network Security', 'Identity and Access Management'], 'https://www.isc2.org/-/media/ISC2/Certifications/CISSP/CISSP-Logo.ashx', '#1E3A8A', true);
```

---

## 🔧 Functions & Triggers

### Experience Calculation
```sql
CREATE OR REPLACE FUNCTION calculate_experience(
    mission_difficulty TEXT,
    completion_time_minutes INTEGER,
    hints_used INTEGER,
    is_first_attempt BOOLEAN
) RETURNS INTEGER AS $$
DECLARE
    base_exp INTEGER;
    time_bonus INTEGER;
    hint_penalty INTEGER;
    first_attempt_bonus INTEGER;
    total_exp INTEGER;
BEGIN
    -- Base experience by difficulty
    IF mission_difficulty = 'expert' THEN base_exp := 500;
    ELSIF mission_difficulty = 'hard' THEN base_exp := 350;
    ELSIF mission_difficulty = 'medium' THEN base_exp := 250;
    ELSE base_exp := 150;
    END IF;
    
    -- Time bonus (faster = more bonus)
    IF completion_time_minutes < 5 THEN time_bonus := 50;
    ELSIF completion_time_minutes < 10 THEN time_bonus := 30;
    ELSIF completion_time_minutes < 15 THEN time_bonus := 15;
    ELSE time_bonus := 0;
    END IF;
    
    -- Hint penalty
    hint_penalty := hints_used * 20;
    
    -- First attempt bonus
    IF is_first_attempt THEN first_attempt_bonus := 50;
    ELSE first_attempt_bonus := 0;
    END IF;
    
    -- Calculate total
    total_exp := base_exp + time_bonus - hint_penalty + first_attempt_bonus;
    
    -- Ensure minimum of 50 experience
    IF total_exp < 50 THEN total_exp := 50;
    END IF;
    
    RETURN total_exp;
END;
$$ LANGUAGE plpgsql;
```

### Tier Progression
```sql
CREATE OR REPLACE FUNCTION update_user_tier(user_id UUID) RETURNS VOID AS $$
DECLARE
    total_exp INTEGER;
    new_tier INTEGER;
BEGIN
    -- Get total experience
    SELECT COALESCE(SUM(experience_points), 0) INTO total_exp
    FROM progression 
    WHERE user_id = update_user_tier.user_id;
    
    -- Calculate new tier
    new_tier := calculate_tier(total_exp);
    
    -- Update user tier if changed
    UPDATE users 
    SET current_tier = new_tier,
        level = FLOOR(total_exp / 1000) + 1
    WHERE id = update_user_tier.user_id
    AND current_tier != new_tier;
END;
$$ LANGUAGE plpgsql;
```

### Mission Completion
```sql
CREATE OR REPLACE FUNCTION complete_mission(
    user_id UUID,
    mission_id UUID,
    completion_time_minutes INTEGER,
    hints_used INTEGER,
    is_successful BOOLEAN,
    score INTEGER
) RETURNS VOID AS $$
DECLARE
    mission_difficulty TEXT;
    exp_earned INTEGER;
    skill_card_id UUID;
BEGIN
    -- Get mission difficulty
    SELECT difficulty_level INTO mission_difficulty
    FROM missions 
    WHERE id = complete_mission.mission_id;
    
    -- Calculate experience
    exp_earned := calculate_experience(
        mission_difficulty,
        completion_time_minutes,
        hints_used,
        TRUE  -- Assuming first attempt for now
    );
    
    -- Get skill card reward
    SELECT skill_card_reward_id INTO skill_card_id
    FROM missions 
    WHERE id = complete_mission.mission_id;
    
    -- Update mission state
    UPDATE mission_state 
    SET 
        status = 'completed',
        progress_percentage = 100,
        completed_at = NOW(),
        time_spent_minutes = completion_time_minutes,
        is_successful = is_successful,
        score = score
    WHERE user_id = complete_mission.user_id 
    AND mission_id = complete_mission.mission_id;
    
    -- Add experience to progression
    INSERT INTO progression (user_id, tier, experience_points)
    VALUES (complete_mission.user_id, calculate_tier(exp_earned), exp_earned)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        experience_points = progression.experience_points + EXCLUDED.experience_points,
        tier = calculate_tier(progression.experience_points + EXCLUDED.experience_points);
    
    -- Update user missions completed
    UPDATE users 
    SET missions_completed = missions_completed + 1,
        total_experience = total_experience + exp_earned
    WHERE id = complete_mission.user_id;
    
    -- Award skill card if applicable
    IF skill_card_id IS NOT NULL THEN
        INSERT INTO user_skill_cards (user_id, skill_card_id, source_mission_id, source_surface)
        VALUES (complete_mission.user_id, skill_card_id, complete_mission.mission_id, 'world')
        ON CONFLICT (user_id, skill_card_id) DO NOTHING;
    END IF;
    
    -- Update user tier
    PERFORM update_user_tier(complete_mission.user_id);
END;
$$ LANGUAGE plpgsql;
```

---

## 📊 Views

### User Dashboard View
```sql
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.current_tier,
    u.level,
    u.total_experience,
    u.missions_completed,
    u.skill_cards_earned,
    (
        SELECT COUNT(*) 
        FROM user_skill_cards usc 
        WHERE usc.user_id = u.id
    ) AS actual_skill_cards_count,
    (
        SELECT MAX(tier) 
        FROM progression p 
        WHERE p.user_id = u.id
    ) AS highest_tier_unlocked,
    (
        SELECT string_agg(DISTINCT era_name, ', ')
        FROM london_eras le
        JOIN skill_cards sc ON le.id = sc.era_id
        JOIN user_skill_cards usc ON sc.id = usc.skill_card_id
        WHERE usc.user_id = u.id
    ) AS eras_unlocked,
    u.last_active_at,
    u.last_surface,
    u.last_mission_id
FROM users u;
```

### Leaderboard View
```sql
CREATE VIEW leaderboard AS
SELECT 
    u.id,
    u.username,
    u.display_name,
    u.total_experience,
    u.level,
    u.missions_completed,
    (
        SELECT COUNT(*) 
        FROM user_skill_cards usc 
        WHERE usc.user_id = u.id
    ) AS skill_cards_earned,
    u.last_active_at,
    RANK() OVER (ORDER BY u.total_experience DESC) AS experience_rank,
    RANK() OVER (ORDER BY u.missions_completed DESC) AS mission_rank,
    RANK() OVER (ORDER BY (
        SELECT COUNT(*) 
        FROM user_skill_cards usc 
        WHERE usc.user_id = u.id
    ) DESC) AS skill_card_rank
FROM users u
WHERE u.is_captain = true
ORDER BY u.total_experience DESC;
```

### User Progress View
```sql
CREATE VIEW user_progress AS
SELECT 
    u.id AS user_id,
    u.username,
    u.current_tier,
    p.tier,
    p.experience_points,
    p.experience_required,
    (p.experience_points::FLOAT / p.experience_required) * 100 AS tier_progress_percentage,
    p.readiness_score,
    ms.mission_id,
    m.title AS mission_title,
    m.difficulty_level,
    ms.status AS mission_status,
    ms.progress_percentage,
    ms.started_at,
    ms.completed_at
FROM users u
JOIN progression p ON u.id = p.user_id
LEFT JOIN mission_state ms ON u.id = ms.user_id
LEFT JOIN missions m ON ms.mission_id = m.id
WHERE p.tier = u.current_tier
ORDER BY u.id, ms.created_at DESC;
```

---

## 🔐 Security Considerations

### Data Encryption
- All sensitive user data should be encrypted at rest
- Use Supabase's built-in encryption or implement custom encryption for:
  - Session data
  - User preferences
  - Conversation history

### Access Control
- RLS policies enforce user isolation
- Admin tables restricted to admins only
- Public tables are read-only

### Audit Trail
- All safety decisions logged in `safety_logs`
- All system changes logged in `audit_logs`
- No sensitive data in logs

### Privacy
- GDPR compliant data storage
- Right to be forgotten implementation
- Data export capabilities

---

## 🚀 Deployment Steps

### 1. Set Up Supabase Project
```bash
# Create new project in Supabase dashboard
# Note project URL and anon/public keys
```

### 2. Enable Extensions
```sql
-- In Supabase SQL editor
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### 3. Create Tables
```bash
# Run all CREATE TABLE statements from this document
# Can be done via Supabase SQL editor or migration files
```

### 4. Create RLS Policies
```bash
# Run all CREATE POLICY statements
```

### 5. Create Functions & Triggers
```bash
# Run all CREATE FUNCTION and CREATE TRIGGER statements
```

### 6. Insert Initial Data
```bash
# Run INSERT statements for modes, london_eras, nations, certifications
```

### 7. Create Views
```bash
# Run CREATE VIEW statements
```

### 8. Set Up Storage
```bash
# Create buckets in Supabase Storage:
# - avatars
# - mission_assets
# - card_assets
# - london_assets
```

### 9. Configure Auth
```bash
# Enable email/password auth
# Enable GitHub OAuth (for developer login)
# Configure JWT settings
```

### 10. Set Up Cron Jobs
```bash
# Create cron job for session cleanup
# Runs daily at midnight
```

---

## 📚 Related Documents

- [Athelgard Core PRD](canvas) - Core system requirements
- [BountyWarz Learning Loop PRD](canvas) - Progression system
- [Athelgard Master Spec](canvas) - Production-ready spec
- [Athelgard Operating Spec](canvas) - Detailed implementation
- [Athelgard Ethical Blueprint](canvas) - Safety layer definition

---

## ✅ Final Notes

This schema provides:
- **Complete memory system** for cross-surface continuity
- **Full progression tracking** for all tiers
- **Skill card collection** with certification alignment
- **Mission state persistence** across sessions
- **Safety audit trail** for compliance
- **Domain knowledge** for Athelgard's intelligence
- **London history framework** for pedagogy

**Next Steps:**
1. Set up Supabase project
2. Run schema migrations
3. Insert initial data
4. Connect to Athelgard Core
5. Test all integrations

---

*"The database is the memory. Athelgard's persistence depends on this schema."*