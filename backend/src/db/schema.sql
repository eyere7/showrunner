CREATE TABLE IF NOT EXISTS shows (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  genre TEXT NOT NULL,
  tone TEXT NOT NULL,
  premise TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS characters (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  traits TEXT[] DEFAULT '{}',
  voice_notes TEXT,
  relationship_map JSONB DEFAULT '{}',
  arc_status TEXT DEFAULT 'emerging'
);

CREATE TABLE IF NOT EXISTS plot_threads (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  introduced_episode INTEGER
);

CREATE TABLE IF NOT EXISTS episodes (
  id SERIAL PRIMARY KEY,
  show_id INTEGER REFERENCES shows(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  script TEXT,
  shot_list JSONB,
  director_brief TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS continuity_flags (
  id SERIAL PRIMARY KEY,
  episode_id INTEGER REFERENCES episodes(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium'
);
