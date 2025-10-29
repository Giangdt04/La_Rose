-- MySQL dump 10.13  Distrib 8.0.29, for Win64 (x86_64)
--
-- Host: localhost    Database: hotel_system
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_table` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `before_state` json DEFAULT NULL,
  `after_state` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_audit_user` (`user_id`),
  KEY `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `availability_calendar`
--

DROP TABLE IF EXISTS `availability_calendar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `availability_calendar` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_id` bigint unsigned NOT NULL,
  `dt` date NOT NULL,
  `is_booked` tinyint(1) DEFAULT '0',
  `booking_id` bigint unsigned DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_room_date` (`room_id`,`dt`),
  KEY `idx_avail_room` (`room_id`),
  KEY `fk_avail_booking` (`booking_id`),
  CONSTRAINT `fk_avail_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_avail_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `availability_calendar`
--

LOCK TABLES `availability_calendar` WRITE;
/*!40000 ALTER TABLE `availability_calendar` DISABLE KEYS */;
/*!40000 ALTER TABLE `availability_calendar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_events`
--

DROP TABLE IF EXISTS `booking_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_events` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned NOT NULL,
  `from_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `to_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_by_user_id` bigint unsigned DEFAULT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_be_booking` (`booking_id`),
  KEY `fk_be_user` (`changed_by_user_id`),
  CONSTRAINT `fk_be_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_be_user` FOREIGN KEY (`changed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_events`
--

LOCK TABLES `booking_events` WRITE;
/*!40000 ALTER TABLE `booking_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `room_id` bigint unsigned DEFAULT NULL,
  `room_type_id` smallint unsigned DEFAULT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `nights` int unsigned NOT NULL,
  `guests` int unsigned DEFAULT '1',
  `price_total` decimal(12,2) DEFAULT '0.00',
  `deposit_amount` decimal(12,2) DEFAULT '0.00',
  `status` enum('pending','confirmed','checked_in','checked_out','cancelled','no_show') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `cancel_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` datetime DEFAULT NULL,
  `policy_applied` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_room` (`room_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `fk_booking_roomtype` (`room_type_id`),
  KEY `idx_bookings_room_dates` (`room_id`,`check_in`,`check_out`),
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_roomtype` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (3,'BK1',NULL,7,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 07:44:23','2025-10-23 07:44:23'),(4,'BK2',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 07:56:23','2025-10-23 07:56:23'),(5,'BK3',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 07:58:04','2025-10-23 07:58:04'),(6,'BK4',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 08:07:13','2025-10-23 08:07:13'),(7,'BK5',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 08:09:01','2025-10-23 08:09:01'),(8,'BK6',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 08:10:21','2025-10-23 08:10:21'),(9,'BK7',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 08:11:46','2025-10-23 08:11:46'),(10,'BK8',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 08:13:33','2025-10-23 08:13:33'),(11,'BK9',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 08:14:24','2025-10-23 08:14:24'),(12,'BK10',NULL,8,1,'2025-10-25','2025-10-28',3,2,1500000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-23 09:06:56','2025-10-23 09:06:56'),(13,'BK11',NULL,42,2,'2025-10-25','2025-10-28',3,2,2100000.00,500000.00,'confirmed',NULL,NULL,NULL,'2025-10-24 07:34:17','2025-10-24 07:34:17');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `assigned_to_id` bigint unsigned DEFAULT NULL,
  `status` enum('open','pending','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'open',
  `last_message_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_conv_user` (`user_id`),
  KEY `fk_conv_assignee` (`assigned_to_id`),
  CONSTRAINT `fk_conv_assignee` FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `sender_user_id` bigint unsigned DEFAULT NULL,
  `sender_type` enum('user','agent','system','bot') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `attachments` json DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_msg_user` (`sender_user_id`),
  KEY `idx_messages_conv` (`conversation_id`),
  CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_user` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_templates`
--

DROP TABLE IF EXISTS `notification_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_templates` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` enum('email','sms') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `body_template` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `variables` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_templates`
--

LOCK TABLES `notification_templates` WRITE;
/*!40000 ALTER TABLE `notification_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `type` enum('email','sms','push','system') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `body` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('queued','sent','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'queued',
  `sent_at` datetime DEFAULT NULL,
  `provider_msg_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_status` (`status`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `transaction_id` bigint unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `refunded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `provider_ref_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_refund_tx` (`transaction_id`),
  CONSTRAINT `fk_refund_tx` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refunds`
--

LOCK TABLES `refunds` WRITE;
/*!40000 ALTER TABLE `refunds` DISABLE KEYS */;
/*!40000 ALTER TABLE `refunds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reports_cache`
--

DROP TABLE IF EXISTS `reports_cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reports_cache` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` json NOT NULL,
  `generated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_report_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reports_cache`
--

LOCK TABLES `reports_cache` WRITE;
/*!40000 ALTER TABLE `reports_cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `reports_cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_responses`
--

DROP TABLE IF EXISTS `review_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_responses` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `review_id` bigint unsigned NOT NULL,
  `responder_id` bigint unsigned DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_rr_review` (`review_id`),
  KEY `fk_rr_user` (`responder_id`),
  CONSTRAINT `fk_rr_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rr_user` FOREIGN KEY (`responder_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_responses`
--

LOCK TABLES `review_responses` WRITE;
/*!40000 ALTER TABLE `review_responses` DISABLE KEYS */;
INSERT INTO `review_responses` VALUES (1,1,NULL,'Cảm ơn quý khách đã quan tâm.','2025-10-24 19:47:08'),(2,2,NULL,'Cảm ơn quý khách đã quan tâm.','2025-10-24 19:49:58');
/*!40000 ALTER TABLE `review_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `room_id` bigint unsigned DEFAULT NULL,
  `rating` tinyint unsigned NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('published','pending','hidden') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_room` (`room_id`),
  KEY `idx_reviews_user` (`user_id`),
  KEY `fk_review_booking` (`booking_id`),
  CONSTRAINT `fk_review_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_review_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,13,NULL,42,5,'Phòng sạch sẽ và rất yên tĩnh','Mình cực kỳ hài lòng với chất lượng và thái độ phục vụ.','published','2025-10-24 19:03:26','2025-10-24 19:47:08'),(2,12,NULL,8,5,'Phòng sạch sẽ và rất yên tĩnh','Mình cực kỳ hài lòng với chất lượng và thái độ phục vụ.','published','2025-10-24 19:41:28','2025-10-24 19:49:58'),(3,12,NULL,8,5,'Phòng sạch sẽ và rất yên tĩnh','Mình cực kỳ hài lòng với chất lượng và thái độ phục vụ.','pending','2025-10-25 02:25:36','2025-10-25 02:25:36');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN',NULL,'2025-10-25 01:54:51','2025-10-25 01:54:51'),(2,'USER',NULL,'2025-10-25 01:54:51','2025-10-25 01:54:51'),(3,'STAFF',NULL,'2025-10-25 01:54:51','2025-10-25 01:54:51'),(4,'MANAGER',NULL,'2025-10-25 01:54:51','2025-10-25 01:54:51');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_images`
--

DROP TABLE IF EXISTS `room_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_images` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `room_id` bigint unsigned NOT NULL,
  `url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `sort_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_room_images_room` (`room_id`),
  CONSTRAINT `fk_room_image_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_images`
--

LOCK TABLES `room_images` WRITE;
/*!40000 ALTER TABLE `room_images` DISABLE KEYS */;
INSERT INTO `room_images` VALUES (19,8,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,1,'2025-10-22 11:41:22'),(20,8,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,2,'2025-10-22 11:41:22'),(21,9,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,1,'2025-10-22 11:41:22'),(22,9,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,2,'2025-10-22 11:41:22'),(23,9,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,3,'2025-10-22 11:41:22'),(24,10,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,1,'2025-10-22 11:41:22'),(25,10,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,2,'2025-10-22 11:41:22'),(26,11,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,1,'2025-10-22 11:41:22'),(27,11,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,2,'2025-10-22 11:41:22'),(28,11,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,3,'2025-10-22 11:41:22'),(29,12,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,1,'2025-10-22 11:41:22'),(30,12,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,2,'2025-10-22 11:41:22'),(31,15,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,0,'2025-10-23 13:56:22'),(32,15,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 13:56:22'),(33,16,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:06:31'),(34,16,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:06:31'),(35,17,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:07:25'),(36,17,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:07:25'),(37,18,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:08:20'),(38,18,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:08:20'),(39,19,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:08:52'),(40,19,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:08:52'),(41,20,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:11:45'),(42,20,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:11:45'),(43,21,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:12:52'),(44,21,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:12:52'),(45,22,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:19:04'),(46,22,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:19:04'),(47,23,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:21:26'),(48,24,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:21:44'),(49,25,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:22:23'),(50,26,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:23:26'),(51,26,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:23:26'),(52,26,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:23:26'),(53,27,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:25:04'),(54,27,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:25:04'),(55,27,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:25:04'),(56,28,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:26:20'),(57,28,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:26:20'),(58,28,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:26:20'),(59,28,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:26:20'),(60,28,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:26:20'),(61,28,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:26:20'),(62,30,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:37:35'),(63,30,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:37:35'),(64,30,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:37:35'),(65,30,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:37:35'),(66,30,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:37:35'),(67,30,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:37:35'),(68,31,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:07'),(69,31,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:07'),(70,31,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:07'),(71,31,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:07'),(72,31,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:07'),(73,31,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:07'),(74,32,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:22'),(75,32,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:39:22'),(76,33,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-23 14:43:11'),(77,33,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:43:11'),(78,33,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:43:11'),(79,33,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-23 14:43:11'),(80,34,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:28:11'),(81,34,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:28:11'),(82,34,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:28:11'),(83,34,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:28:11'),(84,34,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:28:11'),(85,35,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:41:05'),(86,35,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270057/avatars/avatars/a1.jpg.jpg',0,0,'2025-10-24 01:41:05'),(87,35,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270059/avatars/avatars/classic.jpg.jpg',0,0,'2025-10-24 01:41:05'),(88,35,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:41:05'),(89,35,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270065/avatars/avatars/logo_light.jpg.jpg',0,0,'2025-10-24 01:41:05'),(90,36,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:41:26'),(91,36,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270057/avatars/avatars/a1.jpg.jpg',0,0,'2025-10-24 01:41:26'),(92,36,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270059/avatars/avatars/classic.jpg.jpg',0,0,'2025-10-24 01:41:26'),(93,36,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:41:26'),(94,36,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270065/avatars/avatars/logo_light.jpg.jpg',0,0,'2025-10-24 01:41:26'),(95,37,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:42:29'),(96,37,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270057/avatars/avatars/a1.jpg.jpg',0,0,'2025-10-24 01:42:29'),(97,37,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270059/avatars/avatars/classic.jpg.jpg',0,0,'2025-10-24 01:42:29'),(98,37,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',0,0,'2025-10-24 01:42:29'),(99,37,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270065/avatars/avatars/logo_light.jpg.jpg',0,0,'2025-10-24 01:42:29'),(100,38,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:46:40'),(101,38,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270057/avatars/avatars/a1.jpg.jpg',0,0,'2025-10-24 01:46:40'),(102,38,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270400/avatars/avatars/logo_black.jpg.jpg',0,0,'2025-10-24 01:46:40'),(103,39,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:49:31'),(104,39,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270057/avatars/avatars/a1.jpg.jpg',0,0,'2025-10-24 01:49:31'),(105,39,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270400/avatars/avatars/logo_black.jpg.jpg',0,0,'2025-10-24 01:49:31'),(106,40,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270053/avatars/avatars/a2.jpg.jpg',1,0,'2025-10-24 01:54:11'),(107,40,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270057/avatars/avatars/a1.jpg.jpg',0,0,'2025-10-24 01:54:11'),(108,40,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761270400/avatars/avatars/logo_black.jpg.jpg',0,0,'2025-10-24 01:54:11'),(109,41,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271158/avatars/a2.jpg',1,0,'2025-10-24 01:59:25'),(110,41,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271162/avatars/a1.jpg',0,0,'2025-10-24 01:59:25'),(111,41,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271165/avatars/logo_black.jpg',0,0,'2025-10-24 01:59:25'),(114,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271304/avatars/logo_black.jpg.jpg',0,0,'2025-10-24 02:01:44'),(115,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271298/avatars/a2.jpg.jpg',1,0,'2025-10-24 02:18:18'),(116,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271302/avatars/a1.jpg.jpg',0,0,'2025-10-24 02:18:18'),(117,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271304/avatars/logo_black.jpg.jpg',0,0,'2025-10-24 02:18:18'),(118,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271298/avatars/a2.jpg.jpg',0,0,'2025-10-24 02:19:28'),(119,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271302/avatars/a1.jpg.jpg',0,0,'2025-10-24 02:19:28'),(120,42,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271304/avatars/logo_black.jpg.jpg',0,0,'2025-10-24 02:19:28'),(121,52,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761537486/avatars/pngtree-a-couple-sits-together-under-starry-sky-enjoying-serene-moments-by-picture-image_16259709.jpg.png',1,0,'2025-10-27 03:58:07'),(122,53,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761537486/avatars/pngtree-a-couple-sits-together-under-starry-sky-enjoying-serene-moments-by-picture-image_16259709.jpg.png',1,0,'2025-10-27 03:58:57'),(123,53,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271304/avatars/logo_black.jpg.jpg',0,0,'2025-10-27 03:58:57'),(124,54,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761537486/avatars/pngtree-a-couple-sits-together-under-starry-sky-enjoying-serene-moments-by-picture-image_16259709.jpg.png',1,0,'2025-10-27 04:00:18'),(125,54,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761271304/avatars/logo_black.jpg.jpg',0,0,'2025-10-27 04:00:18'),(126,54,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761537617/avatars/logo_light.jpg.jpg',0,0,'2025-10-27 04:00:18'),(127,55,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761537486/avatars/pngtree-a-couple-sits-together-under-starry-sky-enjoying-serene-moments-by-picture-image_16259709.jpg.png',1,0,'2025-10-28 09:09:42'),(128,56,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644886/avatars/new-home.png.png',1,0,'2025-10-28 09:48:10'),(129,56,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,0,'2025-10-28 09:48:10'),(147,7,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',1,0,'2025-10-29 03:17:37'),(148,7,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761703927/avatars/gundam3.png.png',0,0,'2025-10-29 03:17:37'),(149,7,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761700569/avatars/gundam4.png.png',0,0,'2025-10-29 03:17:37'),(150,57,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761707854/avatars/717760.jpg.jpg',1,0,'2025-10-29 03:47:22'),(151,57,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761644889/avatars/gundam2.png.png',0,0,'2025-10-29 03:47:22'),(152,57,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761703927/avatars/gundam3.png.png',0,0,'2025-10-29 03:47:22'),(153,57,'https://res.cloudinary.com/dvxobkvcx/image/upload/v1761700569/avatars/gundam4.png.png',0,0,'2025-10-29 03:47:22');
/*!40000 ALTER TABLE `room_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `room_types`
--

DROP TABLE IF EXISTS `room_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `room_types` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_guests` int unsigned DEFAULT '1',
  `base_price` decimal(10,2) DEFAULT '0.00',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `room_types`
--

LOCK TABLES `room_types` WRITE;
/*!40000 ALTER TABLE `room_types` DISABLE KEYS */;
INSERT INTO `room_types` VALUES (1,'Standard','Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản.',2,450000.00,'2025-10-22 11:35:50','2025-10-22 11:35:50'),(2,'Deluxe','Phòng deluxe rộng rãi, có ban công và tầm nhìn đẹp.',3,700000.00,'2025-10-22 11:35:50','2025-10-22 11:35:50'),(3,'Suite','Phòng suite cao cấp với phòng khách riêng và tiện nghi sang trọng.',4,1200000.00,'2025-10-22 11:35:50','2025-10-22 11:35:50'),(4,'Family','Phòng gia đình với không gian lớn và nhiều giường.',5,1000000.00,'2025-10-22 11:35:50','2025-10-22 11:35:50'),(5,'Presidential','Phòng tổng thống cao cấp nhất với đầy đủ dịch vụ riêng.',6,2500000.00,'2025-10-22 11:35:50','2025-10-22 11:35:50');
/*!40000 ALTER TABLE `room_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rooms` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type_id` smallint unsigned NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `capacity` int unsigned DEFAULT '1',
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('available','maintenance','offline') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `amenities` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_rooms_type` (`room_type_id`),
  KEY `idx_rooms_price` (`price`),
  CONSTRAINT `fk_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (7,'RM1',1,'Standard Room 101','Phòng tiêu chuẩn ấm cúng với đầy đủ tiện nghi cơ bản.',1,450000.00,'available','{\"tv\": false, \"wifi\": false, \"bathtub\": false, \"air_conditioner\": false}','2025-10-22 11:36:16','2025-10-23 20:55:55',NULL),(8,'RM2',1,'Standard Room 102','Phòng tiêu chuẩn nhìn ra vườn.',2,470000.00,'offline','{\"tv\": true, \"view\": \"garden\", \"wifi\": true, \"balcony\": true, \"air_conditioner\": true}','2025-10-22 11:36:16','2025-10-23 20:55:55',NULL),(9,'RM3',2,'Deluxe Room 201','Phòng deluxe rộng rãi, có ban công và view biển.',1,750000.00,'available','{\"tv\": false, \"wifi\": false, \"bathtub\": false, \"air_conditioner\": false}','2025-10-22 11:36:16','2025-10-23 20:55:55',NULL),(10,'RM4',2,'Deluxe Room 202','Phòng deluxe với giường king và phòng tắm riêng.',2,720000.00,'available','{\"tv\": true, \"view\": \"pool\", \"wifi\": true, \"minibar\": true, \"air_conditioner\": true}','2025-10-22 11:36:16','2025-10-23 20:55:55',NULL),(11,'RM5',3,'Suite Room 301','Phòng suite sang trọng với phòng khách riêng.',4,1200000.00,'available','{\"tv\": true, \"view\": \"sea\", \"wifi\": true, \"jacuzzi\": true, \"kitchen\": true, \"minibar\": true, \"air_conditioner\": true}','2025-10-22 11:36:16','2025-10-23 20:55:55',NULL),(12,'RM6',3,'Suite Room 302','Phòng suite cao cấp dành cho gia đình.',5,1300000.00,'maintenance','{\"tv\": true, \"view\": \"city\", \"wifi\": true, \"bathtub\": true, \"kitchen\": true, \"minibar\": true, \"air_conditioner\": true}','2025-10-22 11:36:16','2025-10-23 20:55:55',NULL),(15,'RM7',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(16,'RM8',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(17,'RM9',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(18,'RM10',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(19,'RM11',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(20,'RM12',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(21,'RM13',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(22,'RM14',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(23,'RM15',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(24,'RM16',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(25,'RM17',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(26,'RM18',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(27,'RM19',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(28,'RM20',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(30,'RM21',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(31,'RM22',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(32,'RM23',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(33,'RM24',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(34,'RM25',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(35,'RM26',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(36,'RM27',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(37,'RM28',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(38,'RM29',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(39,'RM30',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(40,'RM31',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(41,'RM32',1,'Room test','Nice room',2,100.00,'available','{\"tv\": true, \"view\": \"city\", \"wifi\": true}',NULL,NULL,NULL),(42,'RM33',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(43,'RM34',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(44,'RM35',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(45,'RM36',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(46,'RM37',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(47,'RM38',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(48,'RM39',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(49,'RM40',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(50,'RM41',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(51,'RM42',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(52,'RM43',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(53,'RM44',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(54,'RM45',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(55,'RM46',2,'Phòng Deluxe 2 giường','Phòng có view hướng biển, diện tích 40m2.',2,1200000.00,'offline','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL),(56,'RM47',1,'Phòng vip','',2,900.00,'available','{\"tv\": true, \"wifi\": true, \"bathtub\": true, \"air_conditioner\": true}',NULL,NULL,NULL),(57,'RM48',2,'abc123','',2,450000.00,'available','{\"tv\": true, \"wifi\": true, \"bathtub\": false, \"air_conditioner\": true}',NULL,NULL,NULL);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `provider` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provider_transaction_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `currency` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `status` enum('initiated','success','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'initiated',
  `type` enum('payment','refund','payout') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'payment',
  `metadata` json DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tx_status` (`status`),
  KEY `idx_tx_provider` (`provider`),
  KEY `fk_tx_booking` (`booking_id`),
  KEY `fk_tx_user` (`user_id`),
  CONSTRAINT `fk_tx_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,3,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 07:44:23','2025-10-23 07:44:23'),(2,4,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 07:56:23','2025-10-23 07:56:23'),(3,5,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 07:58:04','2025-10-23 07:58:04'),(4,6,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 08:07:13','2025-10-23 08:07:13'),(5,7,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 08:09:01','2025-10-23 08:09:01'),(6,8,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 08:10:21','2025-10-23 08:10:21'),(7,9,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 08:11:46','2025-10-23 08:11:46'),(8,10,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 08:13:33','2025-10-23 15:15:33'),(9,11,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 08:15:11','2025-10-23 15:15:33'),(10,12,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-23 09:06:56','2025-10-23 09:06:56'),(11,13,NULL,'VNPAY','TXN123456',1500000.00,'VND','success','payment','{\"note\": \"Online payment via VNPAY\"}','2025-10-24 07:34:17','2025-10-24 07:34:17');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint unsigned NOT NULL,
  `role_id` smallint unsigned NOT NULL,
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `fk_ur_role` (`role_id`),
  CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (5,2,'2025-10-26 11:39:10'),(6,1,'2025-10-28 15:54:49');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `full_name` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `email_verification_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email_verification_sent_at` datetime DEFAULT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `oauth_provider` enum('none','google','facebook') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `oauth_provider_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauth_token` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauth_refresh_token` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oauth_expires_at` datetime DEFAULT NULL,
  `profile_data` json DEFAULT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `password_reset_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_token_sent_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (4,'giangdaica10x@gmail1.com','$2a$10$d7hKCvoYq2DjRf/iJ0TYxeO.eR1wUwZihPS7zxl.DyqjCjtO65jbm','Ngu','0123456789',1,0,'ba125c34-f7d2-49b5-b2da-2fe65e61a6c5','2025-10-25 09:01:24',NULL,'none',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-25 09:01:24','2025-10-27 09:33:03',NULL,NULL,NULL),(5,'giangdtph40542@fpt.edu.vn','$2a$10$NpINGIRR4xtIbJjRlrNR4uQU3wViFFmCLlFu6OVgEBwx3gAvKfk5u','admin','0325762818',1,1,NULL,'2025-10-26 04:39:05','2025-10-26 04:39:49','none',NULL,NULL,NULL,NULL,NULL,'2025-10-28 09:08:37','2025-10-26 04:39:05','2025-10-28 09:08:37',NULL,NULL,NULL),(6,'giangdaica10x@gmail.com','$2a$10$BfKkGjLxezSwlq8rXN0kpuK95dZyhvLqCz6XSh5livTsqkxNNJLqW','Giang Đỗ','0369849958',1,1,NULL,'2025-10-28 08:51:12','2025-10-28 08:51:39','none',NULL,NULL,NULL,NULL,NULL,'2025-10-29 04:23:05','2025-10-28 08:51:12','2025-10-29 04:23:05',NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-29 11:27:15
