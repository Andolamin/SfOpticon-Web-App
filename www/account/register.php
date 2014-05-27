<?php
	include_once 'accountFunctions.php';

	$showLogin = false;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<title>Register</title>
		<link rel="stylesheet" type="text/css" href="css/login.css" />
	</head>
	
	<body>
		<div id="stylized" class="myform">
			<form id="registerForm" name="registerForm" method="post">
				<input type="hidden" name="action" value="processRegistration" />
				<h1>Register</h1>
				<p>This page allows you to register with the system.<br />It requires administrative authentication.</p>

				<label>Username:
					<span class="small">Choose your username</span>
				</label>
				<input type="text" name="username" id="username" />

				<label>Password
					<span class="small">Min. size 6 chars</span>
				</label>
				<input type="password" name="password" id="password" />
				
				<label>Confirm
					<span class="small">Confirm your password</span>
				</label>
				<input type="password" name="passwordConfirmation" id="passwordConfirmation" />
				
				<label>Admin access code
					<span class="small"></span>
				</label>
				<input type="text" name="adminAccess" id="adminAccess" />

				<button type="submit">Submit</button>
				<div class="spacer"></div>
				
			</form>
		</div>
	</body>

</html>