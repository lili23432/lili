DROP DATABASE IF EXISTS library_db;
CREATE DATABASE library_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE library_db;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_users_role CHECK (role IN ('admin', 'student'))
) ENGINE=InnoDB;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE books (
  id INT PRIMARY KEY AUTO_INCREMENT,
  book_name VARCHAR(100) NOT NULL,
  author VARCHAR(50) NOT NULL,
  publisher VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category_id INT NOT NULL,
  CONSTRAINT uk_books_name_author UNIQUE (book_name, author),
  CONSTRAINT chk_books_price CHECK (price >= 0),
  CONSTRAINT chk_books_stock CHECK (stock >= 0),
  CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE borrow_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  book_id INT NOT NULL,
  borrow_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  return_time DATETIME NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'BORROWED',
  CONSTRAINT chk_borrow_status CHECK (status IN ('BORROWED', 'RETURNED')),
  CONSTRAINT chk_return_time CHECK (return_time IS NULL OR return_time >= borrow_time),
  CONSTRAINT fk_records_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_records_book FOREIGN KEY (book_id) REFERENCES books(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;
