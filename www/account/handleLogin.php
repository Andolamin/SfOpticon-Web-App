<?php
	include_once 'accountFunctions.php';

	// echo "Handling login";

	// Check login
	if (checkLoginValid()) {
		require_once ('soapclient/SforceEnterpriseClient.php');

		define("USERNAME", $_POST["username"]);
		define("PASSWORD", $_POST["password"]);
		define("SECURITY_TOKEN", $_POST["token"]);

		try {
			$sfConnection = new SforceEnterpriseClient();
			$sfConnection->createConnection("enterprise.wsdl.xml");

			//echo "Logging in";
			$result = $sfConnection->login(USERNAME, PASSWORD.SECURITY_TOKEN);

            global $userInfo;
			$userInfo = $sfConnection->getUserInfo();

			$query = "SELECT Name, Id FROM PermissionSet WHERE Id IN (SELECT PermissionSetId FROM PermissionSetAssignment WHERE AssigneeID = '" . $userInfo->userId . "')";
			$response = $sfConnection->query($query);

			$hasPermissionSet = false;
			foreach ($response->records as $record) {
				if ($record->Name == "SfOpticon_User") {
					$hasPermissionSet = true;
				}
			}

            if ($hasPermissionSet) {
//                echo 'Creating profile<br/>';

                $_SESSION['enterpriseLocation'] = $sfConnection->getLocation();
                $_SESSION['enterpriseSessionId'] = $sfConnection->getSessionId();
                $_SESSION['sfUsername'] = USERNAME;
                $_SESSION['sfToken'] = SECURITY_TOKEN;
                session_write_close();

                include_once('storeProfile.php');

                if(!$result) {
                    die("Couldn't update user profile");
                }
            }

//            die();

			$loggedIn = $hasPermissionSet;
			// $showLogin = !$hasPermissionSet;
			$noAccess = !$hasPermissionSet;

		} catch (Exception $e) {
			$badCredentials = true;
			$showLogin = true;
		}
	} else {
		$showLogin = true;
	}

    $showLogin = true;
?>