<?php
/**
 * Created by PhpStorm.
 * User: Alan
 * Date: 12/12/13
 * Time: 1:02 PM
 *
 * PUT: Save credentials for logged in user to specified environment
 */

require_once('../functions.php');

$bypassAuth = false;
$debug = false;

// Work-around for cURL vs REST client methods for passing PUT parameters
$phpInput = file_get_contents('php://input');
if (isset($phpInput) && $phpInput != "") {
    parse_str($phpInput, $_REQUEST);
}

if (isset($_REQUEST['sid'])) {
//    echo $_REQUEST['sid'];
    session_id($_REQUEST['sid']);
}

// Start the session
session_start();
// Read only session access in services, so close the session write immediately
session_write_close();

//var_dump($_SESSION);

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

if (!$bypassAuth && verifyLogin("../enterprise.wsdl.xml") == false) {
    header('HTTP/1.1 401 Unauthorized');
    die('Unauthorized');
}

if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
    if (!isset($_SESSION['sfUsername'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (sfUsername)');
    }
    if (!isset($_SESSION['sfToken'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (sfUsername)');
    }
    if (!isset($_REQUEST['email'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (email)');
    }
    if (!isset($_REQUEST['password'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (password)');
    }
    if (!isset($_REQUEST['token'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (token)');
    }
    if (!isset($_REQUEST['environment'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (environment)');
    }
    $dbStr = "UPDATE `environmentCredential` SET `email`='" . $_REQUEST['email'] . "'," .
             "`password`=AES_ENCRYPT('" . $_REQUEST['password'] . "', '" . $_SESSION['sfToken'] . "'), " .
             "`token`=AES_ENCRYPT('" . $_REQUEST['token'] . "', '" . $_SESSION['sfToken'] . "') " .
             "WHERE `environmentID` = " . $_REQUEST['environment'] . " AND " .
             "`userID`=(SELECT `ID` FROM `user` WHERE `auth_id` = '" . $_SESSION['sfUsername'] . "' LIMIT 1)";
    $result = $db_con->query($dbStr);
    if (!$result) {
        die("Error saving credentials");
    } else {
        die ("Success");
    }
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    die('HTTP/1.1 405 Method Not Allowed');
}

?>