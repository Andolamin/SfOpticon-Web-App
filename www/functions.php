<?php
	$servers = array(
		"local" => array(
			"db_host" => 'localhost',
			"db_root" => 'CLIService',
			"db_user" => 'root',
			"db_pass" => 'B:D>hx=E>bz!42ZbZy/Z'
		)
	);

    function auditLog($user, $action) {
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
        $user = ($user ? $user : ($userInfo ? $userInfo->userName : "Unknown"));
        $dbStr = "INSERT INTO audit_log (username, action) values ('" . $user . "', '" . $action . "')";
        // echo $dbStr;
        $result = $db_con->query($dbStr);
        if ($result !== true) {
            die("Error writing to audit log");
        }
        $db_con->close();
    }

	// Returns true if the searched string ends with the key
	function EndsWith($Haystack, $Needle){
	    // Recommended version, using strpos
	    return (strrpos($Haystack, $Needle) == (strlen($Haystack)-strlen($Needle)));
	};
	
	// Parses the base URL and returns the current server - for use with database functions
	function getServer() {
		return "local";
	}
	
	// Gets the base URL for the current page
	function getBase() {
		$url = "http://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
		$baseURL = "";
		if (EndsWith($url,".php")){
			for ($x = 0; $x < strlen($url); $x += 1){
				if (substr($url, (0-$x), 1) == "/"){
					$baseURL = substr($url, 0, ((strlen($url)-$x)+1));
					break;
				}
			}
		} else {
			$baseURL = $url;
		}
		return $baseURL;
	};
	
	// Connect to the mysql database using new mysqli extension
	function connectDBi() {
		$server = getServer();
	
		global $servers;
		
		// Definitions
		$database_host = $servers[$server]["db_host"];
		$database_root = $servers[$server]["db_root"];
		$database_user = $servers[$server]["db_user"];
		$database_pass = $servers[$server]["db_pass"];
		
		// Connect to the server
		$connection = new mysqli($database_host, $database_user, $database_pass, $database_root);
		if ($connection->connect_errno) {
			throw new Exception("100"); 
		}
		
		// Return the connect to the requester
		return $connection;
	}
	
	function verifyLogin($wsdlLocation) {
		// var_dump($_SESSION);

		require_once ('account/soapclient/SforceEnterpriseClient.php');

		try {
//            echo "Connecting to SF<br />";
			$sfConnection = new SforceEnterpriseClient();
			$sfConnection->createConnection($wsdlLocation);

			// Simple example of session management - first call will do
			// login, refresh will use session ID and location cached in
			// PHP session
			if (isset($_SESSION['enterpriseSessionId'])) {
//				echo "Using session<br />";
				$location = $_SESSION['enterpriseLocation'];
				$sessionId = $_SESSION['enterpriseSessionId'];

//                echo "Setting connection endpoint <br />";
				$sfConnection->setEndpoint($location);
				$sfConnection->setSessionHeader($sessionId);

//                echo "Getting user info <br />";
				global $userInfo;
				$userInfo = $sfConnection->getUserInfo();

//                echo "Querying for permission set<br />";
				$query = "SELECT Name, Id FROM PermissionSet WHERE Id IN (SELECT PermissionSetId FROM PermissionSetAssignment WHERE AssigneeID = '" . $userInfo->userId . "')";
				$response = $sfConnection->query($query);

//                echo "Iterating...<br />";
				$hasPermissionSet = false;
				foreach ($response->records as $record) {
					if ($record->Name == "SfOpticon_User") {
//                        echo "Found permission set.<br />";
                        $hasPermissionSet = true;
					}
				}
//                echo "Done iterating.<br />";

//                echo "Good credentials: " . $hasPermissionSet . "<br />";
				return $hasPermissionSet;
			} else {
				/*
				echo "Logging in";
				$result = $sfConnection->login(USERNAME, PASSWORD.SECURITY_TOKEN);

				$_SESSION['enterpriseLocation'] = $sfConnection->getLocation();
				$_SESSION['enterpriseSessionId'] = $sfConnection->getSessionId();
				*/
				return false;
			}
		} catch (Exception $e) {
			return false;
		}
	}
	
	function logout($wsdlLocation) {
		// session_start();
		require_once ('account/soapclient/SforceEnterpriseClient.php');
        global $userInfo;

		try {
			$sfConnection = new SforceEnterpriseClient();
			$sfConnection->createConnection($wsdlLocation);

			// Simple example of session management - first call will do
			// login, refresh will use session ID and location cached in
			// PHP session
			if (isset($_SESSION['enterpriseSessionId'])) {
			    // echo 'Session set';
				$location = $_SESSION['enterpriseLocation'];
				$sessionId = $_SESSION['enterpriseSessionId'];

				$sfConnection->setEndpoint($location);
				$sfConnection->setSessionHeader($sessionId);

                $userInfo = $sfConnection->getUserInfo();

				$sfConnection->logout();
			}
		} catch (Exception $e) {
			// Ignore if the session is expired or invalid
			// echo "Error";
		}
		// var_dump($userInfo);
		auditLog(null, 'Logged Out');
        unset($userInfo);
		// echo "Unsetting session";
		session_unset();
	}
	
	// Checks both POST and GET for the value and then checks it against the value
	// Defaults to POST
	function valueEquals($value, $toCheck){
		$toReturn = false;
		if (isset($_POST[$value])){
		 	if($_POST[$value] == $toCheck){
				$toReturn = true;
			}
		} else if (isset($_GET[$value])){
			if ($_GET[$value] == $toCheck){
				$toReturn = true;
			}
		}
		return $toReturn;
	}
	
	function getValue($value) {
		$toReturn = false;
		if (isset($_POST[$value])){
			$toReturn = $_POST[$value];
		} else if (isset($_GET[$value])){
			$toReturn = $_GET[$value];
		}
		return $toReturn;
	}
	
	function issetEither($value) {
		if (isset($_POST[$value])){
			return true;
		} else if (isset($_GET[$value])){
			return true;
		}
		return false;
	}
	
	function JSONError($errorText) {
		die('{"returnValue": false, "errorText": "' . $errorText . '"}');
	}
	
	function formError($errorTitle, $errorText, $errorString = "", $queryString = "") {
		echo '<div id="stylized" class="myform">
			<form id="registerForm" name="registerForm" method="post">
				<input type="hidden" name="action" value="processRegistration" />
				<h1>' . $errorTitle . '</h1>
				<p>' . $errorText .'</p>' .
				($errorString == "" ? '' : '<p>' . $errorString . '</p>') .
				($queryString == "" ? '' : '<p>' . $queryString . '</p>') .
				'<div class="spacer"></div>
			</form>
		</div>';
		exit();
	};

    function output($toOutput) {
        global $debug;
        if ($debug) {
            echo $toOutput;
        }
    }

    function outputLine($toOutput) {
        output($toOutput . '<br />');
    }

?>