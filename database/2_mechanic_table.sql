-- Runs after the files with a smaller number (foreign keys).

CREATE TABLE IF NOT EXISTS mechanics (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  phone      VARCHAR(20)  NOT NULL DEFAULT '',
  skills     JSON NOT NULL,
  created_at VARCHAR(30)  NOT NULL,
  extra      JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
