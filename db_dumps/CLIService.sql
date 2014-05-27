-- MySQL dump 10.13  Distrib 5.5.37, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: CLIService
-- ------------------------------------------------------
-- Server version	5.5.37-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audit_log`
--

DROP TABLE IF EXISTS `audit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `action` varchar(255) NOT NULL,
  `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_log`
--

LOCK TABLES `audit_log` WRITE;
/*!40000 ALTER TABLE `audit_log` DISABLE KEYS */;
INSERT INTO `audit_log` VALUES (1,'alan.stice@petroskills.com','Logged In','2014-05-15 20:42:44'),(2,'alan.stice@petroskills.com','Logged Out','2014-05-15 21:05:26'),(3,'alan.stice@petroskills.com','Logged In','2014-05-16 13:15:28'),(4,'alan.stice@petroskills.com','Logged Out','2014-05-16 13:34:45'),(5,'alan.stice@petroskills.com','Logged In','2014-05-16 13:34:55'),(6,'alan.stice@petroskills.com','Logged Out','2014-05-16 13:35:33'),(7,'alan.stice@petroskills.com','Logged In','2014-05-16 13:35:42'),(8,'alan.stice@petroskills.com','Logged In','2014-05-16 16:11:18'),(9,'alan.stice@petroskills.com','Updated credentials for env <a href=\"org.html?orgId=18\">#18</a>','2014-05-16 16:51:32'),(10,'alan.stice@petroskills.com','Updated credentials for env <a href=\"org.html?orgId=19\">#19</a>','2014-05-16 16:52:16'),(11,'alan.stice@petroskills.com','Logged In','2014-05-16 19:39:10'),(12,'alan.stice@petroskills.com','Logged In','2014-05-17 00:26:36'),(13,'alan.stice@petroskills.com','Logged In','2014-05-18 21:07:30'),(14,'alan.stice@petroskills.com','Logged In','2014-05-19 14:02:55'),(15,'alan.stice@petroskills.com','Logged In','2014-05-20 20:09:47'),(16,'alan.stice@petroskills.com','Logged Out','2014-05-20 20:10:07'),(17,'alan.stice@petroskills.com','Logged In','2014-05-23 14:37:39'),(18,'alan.stice@petroskills.com','Logged Out','2014-05-23 15:14:57'),(19,'alan.stice@petroskills.com','Logged In','2014-05-23 15:18:44'),(20,'alan.stice@petroskills.com','Logged Out','2014-05-23 15:18:56');
/*!40000 ALTER TABLE `audit_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `no_update_log` BEFORE UPDATE ON `audit_log` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unable to update logs' */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `no_delete_log` BEFORE DELETE ON `audit_log` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unable to delete logs' */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `environment`
--

DROP TABLE IF EXISTS `environment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `environment` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `production` tinyint(1) NOT NULL DEFAULT '0',
  `location` varchar(255) NOT NULL,
  `locked` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `environment`
--

LOCK TABLES `environment` WRITE;
/*!40000 ALTER TABLE `environment` DISABLE KEYS */;
INSERT INTO `environment` VALUES (18,'ps-salesforce',1,'petroskills.my.salesforce.com',0),(19,'development',0,'test.salesforce.com',0);
/*!40000 ALTER TABLE `environment` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `createCredentials_environment` AFTER INSERT ON `environment` FOR EACH ROW INSERT INTO `environmentCredential` (`userId`, `environmentId`) (SELECT `ID` as `userId`, new.ID as `environmentId` FROM `user` WHERE 1) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `removeCredentials_environment` BEFORE DELETE ON `environment` FOR EACH ROW DELETE FROM `environmentCredential` WHERE `environmentId` = old.ID */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `environmentCredential`
--

DROP TABLE IF EXISTS `environmentCredential`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `environmentCredential` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `userID` bigint(20) NOT NULL,
  `environmentID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `userID` (`userID`,`environmentID`),
  KEY `env` (`environmentID`),
  CONSTRAINT `env` FOREIGN KEY (`environmentID`) REFERENCES `environment` (`ID`),
  CONSTRAINT `usr` FOREIGN KEY (`userID`) REFERENCES `user` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=93 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `environmentCredential`
--

LOCK TABLES `environmentCredential` WRITE;
/*!40000 ALTER TABLE `environmentCredential` DISABLE KEYS */;
INSERT INTO `environmentCredential` VALUES (91,'alan.stice@petroskills.com.optprod','L\\y:wÈ9ö-Æ[Âs','L\\y:wÈ9ö-Æ[Âs',13,18),(92,'alan.stice@petroskills.com.optdev','L\\y:wÈ9ö-Æ[Âs','L\\y:wÈ9ö-Æ[Âs',13,19);
/*!40000 ALTER TABLE `environmentCredential` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `status` varchar(255) NOT NULL,
  `progress` decimal(10,0) NOT NULL,
  `start` datetime DEFAULT NULL,
  `environmentID` bigint(20) DEFAULT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `environment` (`environmentID`),
  CONSTRAINT `environment` FOREIGN KEY (`environmentID`) REFERENCES `environment` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job`
--

LOCK TABLES `job` WRITE;
/*!40000 ALTER TABLE `job` DISABLE KEYS */;
/*!40000 ALTER TABLE `job` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `setStartTime` BEFORE INSERT ON `job` FOR EACH ROW SET NEW.`start` = NOW() */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `jobLog`
--

DROP TABLE IF EXISTS `jobLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobLog` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `jobID` bigint(20) NOT NULL,
  `text` varchar(255) NOT NULL,
  `time` datetime NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `job` (`jobID`),
  CONSTRAINT `job` FOREIGN KEY (`jobID`) REFERENCES `job` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobLog`
--

LOCK TABLES `jobLog` WRITE;
/*!40000 ALTER TABLE `jobLog` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobLog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `auth_id` varchar(255) NOT NULL,
  `token_hash` varchar(128) NOT NULL,
  `gitEmail` varchar(255) NOT NULL,
  `gitName` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (13,'alan.stice@petroskills.com','dd32f97cefcb0bc82c876ac0dcdd341cbce5342faa1d587a790b662d317d9ab47b3bead1120d7786a4bb82ad5ae9793551fda986cfa74b23c8d54d49d629a114','alan@associativeintelligence.org','Alan Stice');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `createCredentials_user` AFTER INSERT ON `user` FOR EACH ROW INSERT INTO `environmentCredential` (`userId`, `environmentId`) (SELECT new.id as `userId`, `ID` as `environmentId` FROM `environment` WHERE 1) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = '' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `removeCredentials_user` BEFORE DELETE ON `user` FOR EACH ROW DELETE FROM environmentCredential WHERE `userId` = old.ID */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-05-23 13:08:03
