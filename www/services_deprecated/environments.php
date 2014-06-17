<?php
/**
 * Created by PhpStorm.
 * User: Alan
 * Date: 12/12/13
 * Time: 12:23 PM
 *
 * GET: Retrieve settings for all environments and credentials to each for the logged in user
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

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (!isset($_SESSION['sfUsername'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request');
    }
    if (!isset($_SESSION['sfToken'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request');
    }
    $dbStr = ("SELECT `env`.`ID`, `env`.`name`, `env`.`production`, `env`.`location`, `env`.`locked`, " .
                "`credentials`.`email`, AES_DECRYPT(`credentials`.`password`, '" . $_SESSION['sfToken'] . "') as `password`, AES_DECRYPT(`credentials`.`token`, '" . $_SESSION['sfToken'] . "') as `token` " .
                "FROM `environment` as `env` JOIN (SELECT `environmentID`, `email`, `password`, `token` " .
                "FROM `environmentCredential` WHERE `userID` = (SELECT `ID` FROM `user` " .
                "WHERE `auth_id` = '" . $_SESSION['sfUsername'] . "' LIMIT 1)) as `credentials` ON `env`.`ID` = `credentials`.`environmentID`");
    $result = $db_con->query($dbStr);
    if ($result->num_rows == 0) {
        header('HTTP/1.1 404 Not Found');
        die('HTTP/1.1 404 Not Found');
    } else {
        $returnJSON = "[";
        $first = true;
        while ($row = $result->fetch_assoc()) {
            $itemJSON = (!$first ? "," : "") . "{" .
                        '"id": "' . $row['ID'] . '",' .
                        '"credentialsOpen": false,' .
                        '"name": "' . $row['name'] . '",' .
                        '"production": ' . ($row['production'] ? 'true' : 'false') . ',' .
                        '"location": "' . $row['location'] . '",' .
                        '"locked": ' . ($row['locked'] ? 'true' : 'false') . ',' .
                        '"email": "' . $row['email'] . '",' .
                        '"password": "' . $row['password'] . '",' .
                        '"token": "' . $row['token'] . '"' .
                        "}";
            $returnJSON .= $itemJSON;
            $first = false;
        }
        $returnJSON .= "]";
        die ($returnJSON);
    }
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    die('HTTP/1.1 405 Method Not Allowed');
}
?>