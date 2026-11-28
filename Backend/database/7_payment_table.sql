-- Runs after the files with a smaller number (foreign keys).

CREATE TABLE IF NOT EXISTS payments (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  repair_id  INT UNSIGNED NOT NULL,
  amount     DECIMAL(10,2) NOT NULL,
  method     VARCHAR(30)  NOT NULL,
  date       VARCHAR(10)  NOT NULL,
  note       VARCHAR(255) NOT NULL DEFAULT '',
  created_at VARCHAR(30)  NOT NULL,
  extra      JSON NULL,
  KEY ix_payments_date (date),
  CONSTRAINT fk_pay_repair FOREIGN KEY (repair_id) REFERENCES repairs(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
