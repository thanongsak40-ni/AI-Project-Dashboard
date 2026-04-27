-- AI Project Dashboard schema

CREATE TABLE IF NOT EXISTS projects (
  project_id   TEXT PRIMARY KEY,
  project_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS electric_billings (
  id              BIGSERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  project_id      TEXT NOT NULL REFERENCES projects(project_id),
  total_billing   NUMERIC(14,2) NOT NULL,
  cms_doc_number  TEXT
);
CREATE INDEX IF NOT EXISTS idx_electric_date       ON electric_billings(date);
CREATE INDEX IF NOT EXISTS idx_electric_project    ON electric_billings(project_id);

CREATE TABLE IF NOT EXISTS water_billings (
  id              BIGSERIAL PRIMARY KEY,
  date            DATE NOT NULL,
  project_id      TEXT NOT NULL REFERENCES projects(project_id),
  total_billing   NUMERIC(14,2) NOT NULL,
  cms_doc_number  TEXT
);
CREATE INDEX IF NOT EXISTS idx_water_date    ON water_billings(date);
CREATE INDEX IF NOT EXISTS idx_water_project ON water_billings(project_id);

CREATE TABLE IF NOT EXISTS common_fees (
  id                              BIGSERIAL PRIMARY KEY,
  period                          TEXT NOT NULL,           -- 'YYYY-MM'
  project_id                      TEXT NOT NULL REFERENCES projects(project_id),
  common_fee_totalroom            INTEGER DEFAULT 0,
  common_fee_amount               NUMERIC(14,2) DEFAULT 0,
  water_meter_fee_totalroom       INTEGER DEFAULT 0,
  water_meter_fee_amount          NUMERIC(14,2) DEFAULT 0,
  insurance_fee_totalroom         INTEGER DEFAULT 0,
  insurance_fee_amount            NUMERIC(14,2) DEFAULT 0,
  funding_fee_totalroom           INTEGER DEFAULT 0,
  funding_fee_amount              NUMERIC(14,2) DEFAULT 0,
  water_fee_totalroom             INTEGER DEFAULT 0,
  water_fee_amount                NUMERIC(14,2) DEFAULT 0,
  water_promotion_fee_totalroom   INTEGER DEFAULT 0,
  water_promotion_fee_amount      NUMERIC(14,2) DEFAULT 0,
  UNIQUE(period, project_id)
);
CREATE INDEX IF NOT EXISTS idx_common_period  ON common_fees(period);
CREATE INDEX IF NOT EXISTS idx_common_project ON common_fees(project_id);
