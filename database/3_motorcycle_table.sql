-- Runs after the files with a smaller number (foreign keys).

CREATE TABLE IF NOT EXISTS motorcycles (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  brand       VARCHAR(60)  NOT NULL,
  model       VARCHAR(60)  NOT NULL,
  plate       VARCHAR(20)  NOT NULL,
  type        VARCHAR(30)  NOT NULL DEFAULT 'Other',
  created_at  VARCHAR(30)  NOT NULL,
  extra       JSON NULL,
  UNIQUE KEY uq_motorcycles_plate (plate),
  CONSTRAINT fk_moto_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
