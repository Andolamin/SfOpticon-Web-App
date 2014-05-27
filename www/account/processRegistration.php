<?php
	include_once 'accountFunctions.php';

	$showLogin = false;
	if (checkRegistrationValid()){
		// Registration form was valid, insert into database
		// Username is encrypted using a nearly impossible algorithm to hack.
		// While not impossible, it would take several millenia to find the pattern 
		// A hacker would probably just compromise your ftp server to look at your source code
		// You can uncomment the echos to see the process
		$user = $_POST['username']; // Easier to use
		$originalPassword = $_POST['password']; // Same
		$encryptedPassword = getHashedPassword($originalPassword); // The hashed password to store in the database
		// Insert the user into the database, doing nothing if the user already exists
		$sql = "INSERT INTO users (username, password) VALUES ('".$user."','".$encryptedPassword."')";
		$result = mysql_query($sql);
		if ($result == 1){
			?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<title>Registration Success</title>
		<link rel="stylesheet" type="text/css" href="css/login.css" />
	</head>
	
	<body>
		<div id="stylized" class="myform">
			<form id="registeredForm" name="form" method="post">
				<input type="hidden" name="action" value="registered" />
				<h1>Success!</h1>
				<p>The user is now added to the database.</p>
			</form>
		</div>
	</body>

</html>
<?php
		} else {
		// User already existed
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<title>Register</title>
		<link rel="stylesheet" type="text/css" href="css/login.css" />
	</head>
	
	<body>
		<div id="stylized" class="myform">
			<form id="previouslyRegisteredForm" name="previouslyRegisteredForm" method="post">
				<input type="hidden" name="action" value="processRegistration" />
				<h1>Register</h1>
				<p style="color:red;">The username already exists in the database.</p>

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
<?php
		}
	} else {
		echo "bad registration";
	}
?>
	