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

//              $_REQUEST['authID'] = USERNAME;
                $data = array("sid"=>session_id());
                $ch = curl_init('http://localhost/' . 'services/profile.php');
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));

                $response = curl_exec($ch);
                if(!$response) {
//                  var_dump($response);
                    die("Couldn't cURL profile service");
                }
//                echo $response;
//                echo "<br />";
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