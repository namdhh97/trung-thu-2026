ALTER TABLE wishes ADD COLUMN device_hash TEXT NOT NULL DEFAULT 'legacy';
CREATE INDEX IF NOT EXISTS idx_wishes_device_hash ON wishes(device_hash, id DESC);
