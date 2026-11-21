-- Выполняй в новой отдельной учебной базе.
CREATE DATABASE IF NOT EXISTS exam_repairs
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE exam_repairs;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(18) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description VARCHAR(300) NOT NULL DEFAULT '',
  address VARCHAR(500) NOT NULL,
  visit_date VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);