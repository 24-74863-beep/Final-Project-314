-- Runs after the files with a smaller number (foreign keys).

-- Services and parts used on a job are stored as JSON snapshots (name and price at the time) so past jobs keep their original prices
CREATE TABLE IF NOT EXISTS repairs (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  motorcycle_id  INT UNSIGNED NOT NULL,
  customer_id    INT UNSIGNED NOT NULL,
  problem        TEXT NOT NULL,
  mechanic_id    INT UNSIGNED NULL,
  status         VARCHAR(30) NOT NULL DEFAULT 'Waiting',
  is_emergency   TINYINT(1)  NOT NULL DEFAULT 0,
  services       JSON NOT NULL,
  parts          JSON NOT NULL,
  notes          TEXT NOT NULL,
  requested      TINYINT(1)  NOT NULL DEFAULT 0,
  preferred_date VARCHAR(10) NOT NULL DEFAULT '',
  created_at     VARCHAR(30) NOT NULL,
  updated_at     VARCHAR(30) NOT NULL DEFAULT '',
  extra          JSON NULL,
  KEY ix_repairs_mechanic_day (mechanic_id, created_at),
  KEY ix_repairs_status (status),
  CONSTRAINT fk_repairs_moto     FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id),
  CONSTRAINT fk_repairs_customer FOREIGN KEY (customer_id)   REFERENCES customers(id),
  CONSTRAINT fk_repairs_mechanic FOREIGN KEY (mechanic_id)   REFERENCES mechanics(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
