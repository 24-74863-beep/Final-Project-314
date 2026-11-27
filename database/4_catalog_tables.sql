-- Runs after the files with a smaller number (foreign keys).

CREATE TABLE IF NOT EXISTS services (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at VARCHAR(30)  NOT NULL,
  extra      JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS parts (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock      INT NOT NULL DEFAULT 0,
  created_at VARCHAR(30)  NOT NULL,
  extra      JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
