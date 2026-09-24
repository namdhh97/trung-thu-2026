CREATE TABLE IF NOT EXISTS voucher_wins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_hash TEXT NOT NULL,
  claim_token TEXT NOT NULL UNIQUE,
  prize_key TEXT NOT NULL DEFAULT 'mid_autumn_voucher',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  lead_submitted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_voucher_wins_device ON voucher_wins(device_hash, id DESC);

CREATE TABLE IF NOT EXISTS voucher_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  claim_token TEXT NOT NULL UNIQUE,
  device_hash TEXT NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_voucher_leads_created ON voucher_leads(created_at DESC);
