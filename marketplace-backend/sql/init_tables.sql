-- create database
CREATE DATABASE IF NOT EXISTS marketplace_db;
USE marketplace_db;

-- users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_user_name VARCHAR(200) NOT NULL,
  user_email_id VARCHAR(200) NOT NULL UNIQUE,
  user_secret_key VARCHAR(200) NOT NULL,
  contact_number VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- products table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id INT NOT NULL,
  item_title VARCHAR(255) NOT NULL,
  item_cost DECIMAL(12,2) NOT NULL,
  item_gallery VARCHAR(1024), -- store comma separated URLs/paths for simplicity
  item_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE
);
