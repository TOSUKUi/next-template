-- Next.js Template Database Initialization

-- Create sample table for demonstration
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create sample products table
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(10, 2),
  `category` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO `users` (`name`, `email`) VALUES 
('テストユーザー1', 'user1@example.com'),
('テストユーザー2', 'user2@example.com');

INSERT INTO `products` (`name`, `description`, `price`, `category`) VALUES 
('サンプル商品1', 'これはサンプル商品です', 1000.00, 'electronics'),
('サンプル商品2', 'もう一つのサンプル商品', 2000.00, 'books');