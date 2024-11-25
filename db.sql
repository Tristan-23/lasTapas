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


-- Dumping database structure for tapas
CREATE DATABASE IF NOT EXISTS `tapas` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `tapas`;

-- Dumping structure for table tapas.customer
CREATE TABLE IF NOT EXISTS `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `dietaryPreferences` varchar(50) DEFAULT 'NONE',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.customer: ~0 rows (approximately)

-- Dumping structure for table tapas.customer_tables
CREATE TABLE IF NOT EXISTS `customer_tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(50) DEFAULT NULL,
  `seats` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `reserved` int(11) DEFAULT NULL,
  `activity` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.customer_tables: ~0 rows (approximately)

-- Dumping structure for table tapas.menu_items
CREATE TABLE IF NOT EXISTS `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.menu_items: ~5 rows (approximately)
INSERT INTO `menu_items` (`id`, `name`, `tags`, `price`, `image`) VALUES
	(2, 'Vegan Pizza', 'Gluten Free', 12.99, NULL),
	(3, 'Chicken Salad', 'gluten-free, dairy-free', 10.99, NULL),
	(4, 'Spicy Tofu Stir Fry', 'vegan, spicy, organic', 11.49, NULL),
	(5, 'Beef Tacos', 'spicy, dairy-free', 9.99, NULL),
	(6, 'Fruit Smoothie', 'vegan, organic', 7.99, NULL);

-- Dumping structure for table tapas.menu_item_tags
CREATE TABLE IF NOT EXISTS `menu_item_tags` (
  `menu_item_id` int(11) NOT NULL,
  `menu_tag_id` int(11) NOT NULL,
  PRIMARY KEY (`menu_item_id`,`menu_tag_id`),
  KEY `fk_menu_tag` (`menu_tag_id`),
  CONSTRAINT `fk_menu_item` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_tag` FOREIGN KEY (`menu_tag_id`) REFERENCES `menu_tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.menu_item_tags: ~11 rows (approximately)
INSERT INTO `menu_item_tags` (`menu_item_id`, `menu_tag_id`) VALUES
	(2, 1),
	(4, 1),
	(6, 1),
	(2, 2),
	(3, 2),
	(3, 3),
	(5, 3),
	(4, 4),
	(5, 4),
	(4, 6),
	(6, 6);

-- Dumping structure for table tapas.menu_tags
CREATE TABLE IF NOT EXISTS `menu_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(50) DEFAULT NULL,
  `value` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.menu_tags: ~6 rows (approximately)
INSERT INTO `menu_tags` (`id`, `label`, `value`) VALUES
	(1, 'Vegan', 'vegan'),
	(2, 'Gluten Free', 'gluten-free'),
	(3, 'Dairy Free', 'dairy-free'),
	(4, 'Spicy', 'spicy'),
	(5, 'Nut Free', 'nut-free'),
	(6, 'Organic', 'organic');

-- Dumping structure for view tapas.menu_view
-- Creating temporary table to overcome VIEW dependency errors
CREATE TABLE `menu_view` (
	`menu_item_id` INT(11) NOT NULL,
	`menu_item_name` VARCHAR(100) NOT NULL COLLATE 'latin1_swedish_ci',
	`menu_item_price` DECIMAL(10,2) NOT NULL,
	`tag_labels` MEDIUMTEXT NULL COLLATE 'latin1_swedish_ci',
	`tag_values` MEDIUMTEXT NULL COLLATE 'latin1_swedish_ci'
) ENGINE=MyISAM;

-- Dumping structure for table tapas.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `menu_item_id` (`menu_item_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.orders: ~0 rows (approximately)

-- Dumping structure for table tapas.reservations
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL,
  `reservation_time` datetime NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `table_id` (`table_id`),
  CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`table_id`) REFERENCES `customer_tables` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.reservations: ~0 rows (approximately)

-- Dumping structure for table tapas.table_status
CREATE TABLE IF NOT EXISTS `table_status` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.table_status: ~3 rows (approximately)
INSERT INTO `table_status` (`id`, `label`) VALUES
	(1, 'Available'),
	(2, 'Reserved'),
	(3, 'Occupied');

-- Dumping structure for table tapas.workers
CREATE TABLE IF NOT EXISTS `workers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `label` varchar(50) DEFAULT NULL,
  `username` varchar(250) DEFAULT NULL,
  `secret_password` varchar(500) DEFAULT NULL,
  `permission_level` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table tapas.workers: ~0 rows (approximately)
INSERT INTO `workers` (`id`, `label`, `username`, `secret_password`, `permission_level`) VALUES
	(1, 'Tristán', 'test@gmail.com', 'dd9ffcd5e11f88d32c0dece551695eee', 50);

-- Removing temporary table and create final VIEW structure
DROP TABLE IF EXISTS `menu_view`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `menu_view` AS SELECT 
    mi.id AS menu_item_id,
    mi.name AS menu_item_name,
    mi.price AS menu_item_price,
    GROUP_CONCAT(mt.label ORDER BY mt.label SEPARATOR ', ') AS tag_labels,
    GROUP_CONCAT(mt.value ORDER BY mt.label SEPARATOR ', ') AS tag_values
FROM 
    menu_items mi
LEFT JOIN 
    menu_item_tags mit ON mi.id = mit.menu_item_id
LEFT JOIN 
    menu_tags mt ON mit.menu_tag_id = mt.id
GROUP BY 
    mi.id, mi.name, mi.price ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
