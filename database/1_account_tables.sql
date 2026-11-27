-- Bobby's Motorcycle Repair System - MySQL / MariaDB schema
-- The server (backend/config/db.js) creates the database and runs the files in this folder on start-up.
-- Manual setup (phpMyAdmin or mysql CLI): CREATE DATABASE bobbys_repair CHARACTER SET utf8mb4; USE bobbys_repair; then run the files in number order.
-- Timestamps are stored as ISO-8601 text (e.g. 2026-11-20T08:05:00.000Z) because the app sorts and groups them as strings.
-- `extra` stores fields that do not have a dedicated column yet.
-- The server (backend/config/db.js) runs every file in this folder, in number order, on start-up.

CREATE TABLE IF NOT EXISTS customers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  phone      VARCHAR(20)  NOT NULL DEFAULT '',
  address    VARCHAR(255) NOT NULL DEFAULT '',
  email      VARCHAR(120) NOT NULL DEFAULT '',
  user_id    INT UNSIGNED NULL,
  created_at VARCHAR(30)  NOT NULL,
  extra      JSON NULL,
  KEY ix_customers_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- customers.user_id references users but has no foreign key, to avoid a circular dependency between the two tables
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role        VARCHAR(20)  NOT NULL,
  name        VARCHAR(120) NOT NULL,
  username    VARCHAR(60)  NOT NULL,
  pass_hash   CHAR(64)     NOT NULL,
  phone       VARCHAR(20)  NOT NULL DEFAULT '',
  customer_id INT UNSIGNED NULL,
  created_at  VARCHAR(30)  NOT NULL,
  extra       JSON NULL,
  UNIQUE KEY uq_users_username (username),
  CONSTRAINT fk_users_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
