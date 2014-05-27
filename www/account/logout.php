<?php
    include_once 'accountFunctions.php';

	// Handle logout
	logout('enterprise.wsdl.xml');
	$showLogin = false;
	
	// Show logout confirmation
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<title>Logout</title>
		<link rel="stylesheet" type="text/css" href="css/login.css" />
		<meta name="viewport" content="width=device-width, user-scalable=no"/>
	</head>
	
	<body>
		<div id="stylized" class="myform">
			<form id="logoutForm" name="logoutForm" action="../index.html" method="post">
				<input type="hidden" name="action" value="loggedOut" />
				<h1>Logout</h1>
				<p>You have been successfully logged out. Thank you!</p>
				<button type="submit">Return</button>
			</form>
		</div>
	</body>

</html>