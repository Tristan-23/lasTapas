-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for restaurant
CREATE DATABASE IF NOT EXISTS `restaurant` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `restaurant`;

-- Dumping structure for table restaurant.customer
CREATE TABLE IF NOT EXISTS `customer` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `adult` tinyint(1) NOT NULL DEFAULT 0,
  `table_id` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_ibfk_1` (`table_id`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `customer_tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.customer: ~3 rows (approximately)
INSERT INTO `customer` (`id`, `name`, `adult`, `table_id`) VALUES
	(1, 'John Doe', 1, 1),
	(2, 'Jane Smith', 1, 2),
	(3, 'Emily Johnson', 0, 3);

-- Dumping structure for view restaurant.customer_details
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `customer_details` (
	`customer_id` INT(10) UNSIGNED NOT NULL,
	`customer_name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`customer_type` VARCHAR(5) NOT NULL COLLATE 'utf8mb4_general_ci',
	`table_status` ENUM('available','reserved','occupied') NULL COLLATE 'utf8mb4_unicode_ci',
	`customer_note` TEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`preferences` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci',
	`last_order_total` DECIMAL(10,2) NULL,
	`last_order_date` TIMESTAMP NULL
) ENGINE=MyISAM;

-- Dumping structure for table restaurant.customer_notes
CREATE TABLE IF NOT EXISTS `customer_notes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int(10) unsigned NOT NULL,
  `note` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_notes_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.customer_notes: ~3 rows (approximately)
INSERT INTO `customer_notes` (`id`, `customer_id`, `note`, `created_at`) VALUES
	(1, 1, 'Prefers meals without dairy and prefers vegan options', '2024-09-06 07:50:32'),
	(2, 2, 'Allergic to eggs but enjoys vegetarian dishes', '2024-09-06 07:50:32'),
	(3, 3, 'Needs peanut-free meals and gluten-free dishes', '2024-09-06 07:50:32');

-- Dumping structure for table restaurant.customer_orders
CREATE TABLE IF NOT EXISTS `customer_orders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` int(10) unsigned NOT NULL,
  `order_date` timestamp NULL DEFAULT current_timestamp(),
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_total_non_negative` CHECK (`total` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.customer_orders: ~3 rows (approximately)
INSERT INTO `customer_orders` (`id`, `customer_id`, `order_date`, `total`) VALUES
	(1, 1, '2024-09-06 07:50:32', 25.98),
	(2, 2, '2024-09-06 07:50:32', 18.99),
	(3, 3, '2024-09-06 07:50:32', 9.99);

-- Dumping structure for view restaurant.customer_orders_details
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `customer_orders_details` (
	`customer_id` INT(10) UNSIGNED NOT NULL,
	`customer_name` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`order_id` INT(10) UNSIGNED NOT NULL,
	`order_date` TIMESTAMP NULL,
	`menu_item` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`quantity` INT(11) NOT NULL,
	`price` DECIMAL(10,2) NOT NULL,
	`item_total` DECIMAL(20,2) NOT NULL,
	`order_total` DECIMAL(10,2) NOT NULL
) ENGINE=MyISAM;

-- Dumping structure for table restaurant.customer_preferences
CREATE TABLE IF NOT EXISTS `customer_preferences` (
  `customer_id` int(10) unsigned NOT NULL,
  `preference_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`customer_id`,`preference_id`),
  KEY `preference_id` (`preference_id`),
  CONSTRAINT `customer_preferences_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `customer_preferences_ibfk_2` FOREIGN KEY (`preference_id`) REFERENCES `our_preferences` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.customer_preferences: ~3 rows (approximately)
INSERT INTO `customer_preferences` (`customer_id`, `preference_id`) VALUES
	(1, 1),
	(2, 2),
	(3, 3);

-- Dumping structure for table restaurant.customer_tables
CREATE TABLE IF NOT EXISTS `customer_tables` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `seats` int(11) NOT NULL,
  `status` enum('available','reserved','occupied') DEFAULT 'available',
  `reservation_time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.customer_tables: ~3 rows (approximately)
INSERT INTO `customer_tables` (`id`, `seats`, `status`, `reservation_time`) VALUES
	(1, 4, 'occupied', NULL),
	(2, 2, 'occupied', '2024-09-15 17:30:00'),
	(3, 6, 'occupied', '2024-09-05 16:00:00');

-- Dumping structure for table restaurant.menu
CREATE TABLE IF NOT EXISTS `menu` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` enum('Tapas','Dessert','Drinks') DEFAULT 'Tapas',
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_price_non_negative` CHECK (`price` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.menu: ~5 rows (approximately)
INSERT INTO `menu` (`id`, `name`, `price`, `category`) VALUES
	(1, 'Grilled Chicken Salad', 12.99, 'Tapas'),
	(2, 'Vegetarian Pizza', 8.99, 'Dessert'),
	(3, 'Vegan Burger', 10.99, 'Drinks'),
	(4, 'Gluten-Free Pasta', 9.99, 'Tapas'),
	(5, 'Steak', 15.99, 'Tapas');

-- Dumping structure for table restaurant.menu_allergies
CREATE TABLE IF NOT EXISTS `menu_allergies` (
  `menu_id` int(10) unsigned NOT NULL,
  `allergy_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`menu_id`,`allergy_id`),
  KEY `allergy_id` (`allergy_id`),
  CONSTRAINT `menu_allergies_ibfk_1` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `menu_allergies_ibfk_2` FOREIGN KEY (`allergy_id`) REFERENCES `our_allergies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.menu_allergies: ~5 rows (approximately)
INSERT INTO `menu_allergies` (`menu_id`, `allergy_id`) VALUES
	(5, 1),
	(2, 2),
	(4, 3),
	(1, 4),
	(3, 5);

-- Dumping structure for view restaurant.menu_details
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `menu_details` (
	`menu_id` INT(10) UNSIGNED NOT NULL,
	`menu_item` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`menu_price` DECIMAL(10,2) NOT NULL,
	`menu_category` ENUM('Tapas','Dessert','Drinks') NULL COLLATE 'utf8mb4_unicode_ci',
	`allergies` MEDIUMTEXT NULL COLLATE 'utf8mb4_unicode_ci'
) ENGINE=MyISAM;

-- Dumping structure for table restaurant.order_items
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_id` int(10) unsigned NOT NULL,
  `menu_id` int(10) unsigned NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`order_id`,`menu_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `customer_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_quantity_non_negative` CHECK (`quantity` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.order_items: ~4 rows (approximately)
INSERT INTO `order_items` (`order_id`, `menu_id`, `quantity`) VALUES
	(1, 1, 1),
	(1, 2, 1),
	(2, 4, 1),
	(3, 5, 1);

-- Dumping structure for table restaurant.our_allergies
CREATE TABLE IF NOT EXISTS `our_allergies` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.our_allergies: ~5 rows (approximately)
INSERT INTO `our_allergies` (`id`, `label`) VALUES
	(2, 'Dairy'),
	(4, 'Eggs'),
	(1, 'Peanuts'),
	(3, 'Shellfish'),
	(5, 'Soy');

-- Dumping structure for table restaurant.our_preferences
CREATE TABLE IF NOT EXISTS `our_preferences` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `label` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `label` (`label`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.our_preferences: ~5 rows (approximately)
INSERT INTO `our_preferences` (`id`, `label`) VALUES
	(3, 'Gluten-Free'),
	(5, 'Halal'),
	(4, 'Low-Carb'),
	(1, 'Vegan'),
	(2, 'Vegetarian');

-- Dumping structure for table restaurant.storage
CREATE TABLE IF NOT EXISTS `storage` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `item_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `expiration_date` date NOT NULL,
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `old_location` enum('fridge','cooler','shelf') NOT NULL,
  `new_location` enum('fridge','cooler','shelf') NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `chk_quantity_non_negative` CHECK (`quantity` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.storage: ~3 rows (approximately)
INSERT INTO `storage` (`id`, `item_name`, `quantity`, `expiration_date`, `last_updated`, `old_location`, `new_location`) VALUES
	(1, 'Chicken Breast', 20, '2024-09-10', '2024-09-06 07:50:32', 'fridge', 'cooler'),
	(2, 'Lettuce', 50, '2024-09-07', '2024-09-06 07:50:32', 'cooler', 'fridge'),
	(3, 'Pasta', 30, '2025-01-01', '2024-09-06 07:50:32', 'shelf', 'shelf');

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `customer_details`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `customer_details` AS SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    CASE WHEN c.adult = 1 THEN 'Adult' ELSE 'Child' END AS customer_type,
    ct.status AS table_status,
    cn.note AS customer_note,
    GROUP_CONCAT(op.label SEPARATOR ', ') AS preferences,
    co.total AS last_order_total,
    co.order_date AS last_order_date
FROM 
    customer c
LEFT JOIN customer_tables ct ON c.table_id = ct.id
LEFT JOIN customer_notes cn ON c.id = cn.customer_id
LEFT JOIN customer_preferences cp ON c.id = cp.customer_id
LEFT JOIN our_preferences op ON cp.preference_id = op.id
LEFT JOIN customer_orders co ON c.id = co.customer_id
GROUP BY c.id ;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `customer_orders_details`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `customer_orders_details` AS SELECT 
    c.id AS customer_id,
    c.name AS customer_name,
    co.id AS order_id,
    co.order_date,
    m.name AS menu_item,
    oi.quantity,
    m.price,
    (oi.quantity * m.price) AS item_total,
    co.total AS order_total
FROM 
    customer c
JOIN customer_orders co ON c.id = co.customer_id
JOIN order_items oi ON co.id = oi.order_id
JOIN menu m ON oi.menu_id = m.id
ORDER BY co.order_date DESC ;

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `menu_details`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `menu_details` AS SELECT 
    m.id AS menu_id,
    m.name AS menu_item,
    m.price AS menu_price,
    m.category AS menu_category,
    GROUP_CONCAT(oa.label SEPARATOR ', ') AS allergies
FROM 
    menu m
LEFT JOIN menu_allergies ma ON m.id = ma.menu_id
LEFT JOIN our_allergies oa ON ma.allergy_id = oa.id
GROUP BY m.id ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
