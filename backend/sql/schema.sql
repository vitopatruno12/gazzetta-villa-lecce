-- Testata giornalistica — schema PostgreSQL

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  subtitle     TEXT,
  body         TEXT NOT NULL DEFAULT '',
  type         TEXT NOT NULL DEFAULT 'notizia'
               CHECK (type IN ('notizia', 'evento', 'avviso', 'sponsorizzato')),
  status       TEXT NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft', 'published', 'archived')),
  cover_url    TEXT,
  location     TEXT,
  event_start  DATE,
  event_end    DATE,
  is_sponsored BOOLEAN NOT NULL DEFAULT FALSE,
  company_id   UUID,
  author_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX articles_status_published_idx ON articles (status, published_at DESC);
CREATE INDEX articles_type_idx ON articles (type);

CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  logo_url   TEXT,
  website    TEXT,
  email      TEXT,
  phone      TEXT,
  city       TEXT,
  notes      TEXT,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE articles
  ADD CONSTRAINT articles_company_fk
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- Slot pubblicitari sul sito (header, sidebar, sotto articolo, feed sponsor…)
CREATE TABLE ad_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  width       INT,
  height      INT
);

CREATE TABLE ad_campaigns (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  priority    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_creatives (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id  UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  slot_id      UUID NOT NULL REFERENCES ad_slots(id) ON DELETE CASCADE,
  title        TEXT,
  image_url    TEXT,
  html_body    TEXT,
  click_url    TEXT,
  kind         TEXT NOT NULL DEFAULT 'banner'
               CHECK (kind IN ('banner', 'sponsored_post', 'native')),
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_events (
  id          BIGSERIAL PRIMARY KEY,
  creative_id UUID NOT NULL REFERENCES ad_creatives(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ad_events_creative_idx ON ad_events (creative_id, event_type);
