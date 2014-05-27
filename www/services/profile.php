<?php
/**
 * Created by PhpStorm.
 * User: Alan
 * Date: 12/9/13
 * Time: 1:49 PM
 *
 * GET: Retrieve profile settings for the logged in user
 * PUT: Create/update profile settings for the logged in user
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
// This service is does have to write to the session, in order to flag the application if the security token has changed
// session_write_close();

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

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    session_write_close();
    if (!isset($_SESSION['sfUsername'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request');
    }if (!isset($_SESSION['sfToken'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request');
    }
    $result = $db_con->query("SELECT `ID`, `auth_id`, `gitEmail`, `gitName`, `rcsUsername`, AES_DECRYPT(`rcsPassword`, '" . $_SESSION['sfToken'] . "') as `rcsPassword` FROM `user` WHERE `auth_id` = '" . $_SESSION['sfUsername'] . "' LIMIT 1");
    if (!$result) {
        die('{status: "error"}');
        // outputLine($db_con->error);
    } else {
        if ($result->num_rows == 0) {
            header('HTTP/1.1 404 Not Found');
            die('HTTP/1.1 404 Not Found');
        }
        $row = $result->fetch_assoc();
//        var_dump($row);
        $return = '{' .
            '"auth_id": "' . $row['auth_id'] . '",' .
            '"gitEmail": "' . $row['gitEmail'] . '",' .
            '"gitName": "' . $row['gitName'] . '",' .
            '"rcsUsername": "' . $row['rcsUsername'] . '",' .
            '"rcsPassword": "' . $row['rcsPassword'] . '"' .
            '}';
        die($return);
    }
    // echo $_SESSION['sfUsername'];
} else if ($_SERVER['REQUEST_METHOD'] == 'PUT') {
//    var_dump($_REQUEST);
//    echo "<br />";
//    var_dump($_POST);
//    echo "<br />";
//    var_dump($_GET);
//    echo "<br />";
    if (!isset($_SESSION['sfUsername'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request');
    }
    if (!isset($_SESSION['sfToken'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request');
    }
    $authId = $_SESSION['sfUsername'];
    outputLine('Found authId: ' . $authId);
    $token = $_SESSION['sfToken'];
    outputLine('Found token: ' . $token);
    $tokenHash = hash('sha512', $token);
    $gitEmail = (isset($_REQUEST['gitEmail']) ? $_REQUEST['gitEmail'] : '');
    if ($gitEmail != '') {
        outputLine('Found gitEmail: ' . $gitEmail);
    }
    $gitName = (isset($_REQUEST['gitName']) ? $_REQUEST['gitName'] : '');
    if ($gitName != '') {
        outputLine('Found gitName: ' . $gitName);
    }
    $rcsUsername = (isset($_REQUEST['rcsUsername']) ? $_REQUEST['rcsUsername'] : '');
    if ($rcsUsername != '') {
        outputLine('Found rcsUsername: ' . $rcsUsername);
    }
    $rcsPassword = (isset($_REQUEST['rcsPassword']) ? $_REQUEST['rcsPassword'] : '');
    if ($rcsPassword != '') {
        outputLine('Found rcsPassword: ' . $rcsPassword);
    }
    $result = $db_con->query("SELECT `ID`, `auth_id`, `token_hash`, `gitEmail`, `gitName`, `rcsUsername`, `rcsPassword` FROM `user` WHERE `auth_id` = '" . $_SESSION['sfUsername'] . "' LIMIT 1");
    if (!$result) {
        die('Error querying user table');
        // outputLine($db_con->error);
    } else {
        if ($result->num_rows == 0) {
            session_write_close();
            outputLine('Creating user profile');
            $dbStr = "INSERT INTO `user` (`auth_id`, `token_hash`, `gitEmail`, `gitName`, `rcsUsername`, `rcsPassword`) VALUES ('"
                . $authId .
                ($token != "" ? "', '" . hash('sha512', $token) : "', '") .
                ($gitEmail != "" ? "', '" . $gitEmail : "', '") .
                ($gitName != "" ? "', '" . $gitName : "', '") .
                ($rcsUsername != "" ? "', '" . $rcsUsername : "', '") .
                (($token != "" && $rcsPassword != "") ? "', AES_ENCRYPT('" . $rcsPassword . "', '" . $token . "'))" : "', '')");
            $result = $db_con->query($dbStr);
            if (!$result) {
                echo('Error creating user record: ' . $dbStr);
                echo $db_con->error;
                die();
            }
            else {
                die('Success');
            }
        } else {
            outputLine('Updating user profile');
            $row = $result->fetch_assoc();
            if ($tokenHash != $row['token_hash']) {
                $_SESSION['tokenChanged'] = true;
                session_write_close();
            }
            $dbStr = ("UPDATE `user` SET `auth_id`='" . $authId . "', `token_hash`='" . $tokenHash .
                ($gitEmail != "" ? "', `gitEmail`='". $gitEmail : "") .
                ($gitName != "" ? "', `gitName`='". $gitName : "") .
                ($rcsUsername != "" ? "', `rcsUsername`='". $rcsUsername : "") .
                (($token != "" && $rcsPassword != "") ? "', `rcsPassword`=AES_ENCRYPT('" . $rcsPassword . "', '" . $token . "')" : "'") .
                " WHERE `auth_id`='"
                . $authId .
                "'");
            // die($dbStr);
            $result = $db_con->query($dbStr);
            if (!$result) {
                die('Error updating user record');
            }
            else {
                die('Success');
            }
        }
    }
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    die('HTTP/1.1 405 Method Not Allowed');
}

?>