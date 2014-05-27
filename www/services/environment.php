<?php
/**
 * Created by PhpStorm.
 * User: Alan
 * Date: 12/12/13
 * Time: 1:02 PM
 *
 * PUT: Save settings for an environment
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
    if (!isset($_REQUEST['name'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (name)');
    }
    if (!isset($_REQUEST['id'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (id)');
    }
    if (!isset($_REQUEST['location'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (location)');
    }
    if (!isset($_REQUEST['production'])) {
        header('HTTP/1.1 400 Bad Request');
        die('HTTP/1.1 400 Bad Request (production)');
    }
    if ($_REQUEST['id'] == -1) {
        // ID of -1 indicates that we should be creating a new environment
        if (!isset($_REQUEST['username'])) {
            header('HTTP/1.1 400 Bad Request');
            die('HTTP/1.1 400 Bad Request (username)');
        }
        if (!isset($_REQUEST['password'])) {
            header('HTTP/1.1 400 Bad Request');
            die('HTTP/1.1 400 Bad Request (password)');
        }
        if (!isset($_REQUEST['token'])) {
            header('HTTP/1.1 400 Bad Request');
            die('HTTP/1.1 400 Bad Request (token)');
        }
        /* Create a TCP/IP socket. */
        $socket = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);
        socket_set_block($socket);
        if ($socket === false) {
            header('HTTP/1.1 500 Internal Server Error');
            die('HTTP/1.1 500 Internal Server Error (socket)');
        }
        $result = socket_connect($socket, "localhost", 43442);
        if ($result === false) {
            header('HTTP/1.1 500 Internal Server Error');
            die('HTTP/1.1 500 Internal Server Error (result)');
        }
        $out = '';
        while (($out = socket_read($socket, 2048, PHP_NORMAL_READ)) === '') {}
        echo $out;
        $out = trim($out);
        if ($out !== "Ready!") {
            header('HTTP/1.1 500 Internal Server Error');
            die('HTTP/1.1 500 Internal Server Error (!ready)');
        }
        $message = "environment create " .
            "--name=" . $_REQUEST['name'] ." " .
            "--location=" . $_REQUEST['location'] ." " .
            "--production=" . $_REQUEST['production'] . " " .
            "--username=" . $_REQUEST['username'] . " " .
            "--password=" . $_REQUEST['password'] . " " .
            "--token=" . $_REQUEST['token'] . " " .
            "--userAuthId=". $_SESSION['sfUsername'] ." " .
            "--userSecurityToken=" . $_SESSION['sfToken'] . "\r\n";
        socket_write($socket, $message, strlen($message));
        $out = socket_read($socket, 2048, PHP_NORMAL_READ);
        if ($out != "SUCCESS") {
            header('HTTP/1.1 500 Internal Server Error');
            echo $out;
            die('HTTP/1.1 500 Internal Server Error (!success)');
        } else {
            die('SUCCESS');
        }
    } else {
        // Any other id should indicate that we're updating the record
        // TODO
        header('HTTP/1.1 501 Not Implemented');
        die('HTTP/1.1 501 Not Implemented');
    }
} else {
    header('HTTP/1.1 405 Method Not Allowed');
    die('HTTP/1.1 405 Method Not Allowed');
}

?>