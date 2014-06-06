<?php
    include_once('../functions.php');
    global $userInfo;

    try {
        $db_con = connectDBi();
    } catch (Exception $e) {
        if ($e->getMessage() == "100") {
            $error = mysql_error();
            die("Error connecting to the database");
        } else if ($e->getMessage() == "101") {
            $error = mysql_error();
            die("Error selecting the database");
        }
    }

    $tokenHash = hash('sha512', $_SESSION['sfToken']);

    $dbStr = "INSERT INTO `User` (`SFUserID`, `Username`, `FullName`, `Email`, `TokenHash`) VALUES " .
             "('" . $userInfo->userId . "', '" . $userInfo->userName . "', '" . $userInfo->userFullName . "', '" . $userInfo->userEmail . "', '" . $tokenHash . "') " .
             "ON DUPLICATE KEY UPDATE `Username` = '" . $userInfo->userName . "', `FullName` = '" . $userInfo->userFullName . "', `Email` = '" . $userInfo->userEmail . "', `TokenHash` = '" . $tokenHash . "'";
    $result = $db_con->query($dbStr);
?>
