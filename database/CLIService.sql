SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE DATABASE IF NOT EXISTS `CLIService` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `CLIService`;

DELIMITER $$
DROP PROCEDURE IF EXISTS `clearData`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `clearData`()
    NO SQL
    DETERMINISTIC
    SQL SECURITY INVOKER
BEGIN
SET FOREIGN_KEY_CHECKS = 0; 
TRUNCATE TABLE `CronTable`;
TRUNCATE TABLE `Environment`; 
TRUNCATE TABLE `EnvironmentCredential`;
TRUNCATE TABLE `EnvironmentJob`;
TRUNCATE TABLE `Job`;
TRUNCATE TABLE `JobLog`;
SET FOREIGN_KEY_CHECKS = 1;
END$$

DROP PROCEDURE IF EXISTS `gitConfigured`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `gitConfigured`(IN `un` VARCHAR(255))
    NO SQL
SELECT NOT(ISNULL(`GitName`) OR `GitName` = '' OR ISNULL(`GitEmail`) OR `GitEmail` = '' OR ISNULL(`GitUsername`) OR `GitUsername` = '' OR ISNULL(`GitPassword`) OR `GitPassword` = '') as `gitConfigured` FROM `User` WHERE `Username` = un$$

DELIMITER ;

DROP TABLE IF EXISTS `AuditLog`;
CREATE TABLE IF NOT EXISTS `AuditLog` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `UserID` bigint(20) NOT NULL,
  `Username` varchar(100) NOT NULL,
  `Action` varchar(255) NOT NULL,
  `Time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`ID`),
  KEY `fk_AuditLog_User_idx` (`UserID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=14 ;
DROP TRIGGER IF EXISTS `no_delete_log`;
DELIMITER //
CREATE TRIGGER `no_delete_log` BEFORE DELETE ON `AuditLog`
 FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unable to delete logs'
//
DELIMITER ;
DROP TRIGGER IF EXISTS `no_update_log`;
DELIMITER //
CREATE TRIGGER `no_update_log` BEFORE UPDATE ON `AuditLog`
 FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Unable to update logs'
//
DELIMITER ;

DROP TABLE IF EXISTS `CronTable`;
CREATE TABLE IF NOT EXISTS `CronTable` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `ScheduleTime` varchar(20) NOT NULL,
  `Parameters` text NOT NULL,
  `Executed` tinyint(1) NOT NULL DEFAULT '0',
  `JobID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

DROP TABLE IF EXISTS `Environment`;
CREATE TABLE IF NOT EXISTS `Environment` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) NOT NULL,
  `Production` tinyint(1) NOT NULL DEFAULT '0',
  `Location` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `name` (`Name`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;
DROP TRIGGER IF EXISTS `create_credentials_environment`;
DELIMITER //
CREATE TRIGGER `create_credentials_environment` AFTER INSERT ON `Environment`
 FOR EACH ROW INSERT INTO `EnvironmentCredential` (`UserId`, `EnvironmentId`) (SELECT `ID` as `UserId`, new.ID as `EnvironmentId` FROM `User` WHERE 1)
//
DELIMITER ;
DROP TRIGGER IF EXISTS `delete_credentials_environment`;
DELIMITER //
CREATE TRIGGER `delete_credentials_environment` AFTER DELETE ON `Environment`
 FOR EACH ROW DELETE FROM `EnvironmentCredential` WHERE `EnvironmentID` = old.ID
//
DELIMITER ;
DROP TRIGGER IF EXISTS `prevent_multiple_production_environments_insert`;
DELIMITER //
CREATE TRIGGER `prevent_multiple_production_environments_insert` BEFORE INSERT ON `Environment`
 FOR EACH ROW BEGIN
		IF (NEW.production = 1 AND (SELECT COUNT(`ID`) FROM `Environment`
                           		   WHERE `Production` = 1) > 0)
		THEN
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot add row: Only one production environment is allowed';
		END IF;
	END
//
DELIMITER ;
DROP TRIGGER IF EXISTS `prevent_multiple_production_environments_update`;
DELIMITER //
CREATE TRIGGER `prevent_multiple_production_environments_update` BEFORE UPDATE ON `Environment`
 FOR EACH ROW BEGIN
		IF (NEW.production = 1 AND (SELECT COUNT(`ID`) FROM `Environment`
                           		   WHERE `Production` = 1) > 0)
		THEN
			SIGNAL SQLSTATE '45000'
				SET MESSAGE_TEXT = 'Cannot update row: Only one production environment is allowed';
		END IF;
	END
//
DELIMITER ;

DROP TABLE IF EXISTS `EnvironmentCredential`;
CREATE TABLE IF NOT EXISTS `EnvironmentCredential` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Token` varchar(255) DEFAULT NULL,
  `UserID` bigint(20) NOT NULL,
  `EnvironmentID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_EnvironmentCredential_Environment_idx` (`EnvironmentID`),
  KEY `fk_EnvironmentCredential_User_idx` (`UserID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

DROP TABLE IF EXISTS `EnvironmentJob`;
CREATE TABLE IF NOT EXISTS `EnvironmentJob` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `EnvironmentID` bigint(20) NOT NULL,
  `JobID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_EnvironmentJob_Environment_idx` (`EnvironmentID`),
  KEY `fk_EnvironmentJob_Job_idx` (`JobID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

DROP TABLE IF EXISTS `Job`;
CREATE TABLE IF NOT EXISTS `Job` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `Status` varchar(255) NOT NULL,
  `Progress` decimal(10,0) NOT NULL,
  `ReceivedTime` timestamp(6) NULL DEFAULT NULL,
  `StartTime` timestamp(6) NULL DEFAULT NULL,
  `LastModified` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `Type` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=8 ;
DROP TRIGGER IF EXISTS `setStartTime`;
DELIMITER //
CREATE TRIGGER `setStartTime` BEFORE INSERT ON `Job`
 FOR EACH ROW SET new.`StartTime` = NOW()
//
DELIMITER ;

DROP TABLE IF EXISTS `JobLog`;
CREATE TABLE IF NOT EXISTS `JobLog` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `JobID` bigint(20) NOT NULL,
  `Value` varchar(255) NOT NULL,
  `Time` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`ID`),
  KEY `fk_JobLog_Job_idx` (`JobID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=49 ;

DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `SFUserID` varchar(18) NOT NULL,
  `FullName` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Username` varchar(255) NOT NULL,
  `TokenHash` varchar(128) NOT NULL,
  `GitName` varchar(255) DEFAULT NULL,
  `GitEmail` varchar(255) DEFAULT NULL,
  `GitUsername` varchar(255) DEFAULT NULL,
  `GitPassword` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `SFUserID` (`SFUserID`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=31 ;
DROP TRIGGER IF EXISTS `create_credentials_user`;
DELIMITER //
CREATE TRIGGER `create_credentials_user` AFTER INSERT ON `User`
 FOR EACH ROW INSERT INTO `EnvironmentCredential` (`UserID`, `EnvironmentID`) (SELECT new.id as `UserID`, `ID` as `EnvironmentID` FROM `Environment` WHERE 1)
//
DELIMITER ;
DROP TRIGGER IF EXISTS `remove_credentials_user`;
DELIMITER //
CREATE TRIGGER `remove_credentials_user` BEFORE DELETE ON `User`
 FOR EACH ROW DELETE FROM `EnvironmentCredential` WHERE `UserID` = old.ID
//
DELIMITER ;
DROP TRIGGER IF EXISTS `verify_token`;
DELIMITER //
CREATE TRIGGER `verify_token` BEFORE UPDATE ON `User`
 FOR EACH ROW BEGIN
	IF (NEW.`TokenHash` != OLD.`TokenHash`)
	THEN
		SET New.`GitPassword` = '';
		UPDATE `EnvironmentCredential` SET `Password` = '', `Token` = '' WHERE `UserID` = NEW.`ID`;
	END IF;
END
//
DELIMITER ;


ALTER TABLE `AuditLog`
  ADD CONSTRAINT `fk_AuditLog_User` FOREIGN KEY (`UserID`) REFERENCES `User` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `EnvironmentCredential`
  ADD CONSTRAINT `fk_EnvironmentCredential_Environment` FOREIGN KEY (`EnvironmentID`) REFERENCES `Environment` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_EnvironmentCredential_User` FOREIGN KEY (`UserID`) REFERENCES `User` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `EnvironmentJob`
  ADD CONSTRAINT `fk_EnvironmentJob_Environment` FOREIGN KEY (`EnvironmentID`) REFERENCES `Environment` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_EnvironmentJob_Job` FOREIGN KEY (`JobID`) REFERENCES `Job` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `JobLog`
  ADD CONSTRAINT `fk_JobLog_Job` FOREIGN KEY (`JobID`) REFERENCES `Job` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
