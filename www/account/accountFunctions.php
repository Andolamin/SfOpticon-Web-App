<?php
	include_once '../functions.php';

	// Connect to the database
	// connectDB();
	session_start();
	
	// An administrator code to allow registrations.
	// Can be replaced with a formula to calculate the code.
	// However the codes will need to match for the registration to work.
	// Still will be vulnerable to brute force attacks, though.
	function getAdminCode(){
		return "someAdminCode";
	}

	// Salt to make passwords harder to crack.
	// Can be replaced with any value that is consistent between logins.
	// Usually best to just leave it something static.
	function getSalt(){
		return "sticeCraftAdministrationS@lT123";
	}
	
	// Second salt for redundancy, making passwords harder to crack.
	// Can be replaced with any value that is consistent between logins.
	// Usually best to just leave it something static.
	function getSecondSalt(){
		return "superAwesomeSalt123";
	}

	// Conditions:
	//
	// Username exists
	// Password exists
	function checkLoginValid(){
		return (strlen($_POST['username']) > 0 && strlen($_POST['password']) > 0 && strlen($_POST['token']) > 0);
	}
	
	// Returns a hashed password based on the original
	// Hash is designed to be as unreversable as possible
	// Because the hash uses two salts, one placed in the center of the original string
	// the hash is impossible to reverse without knowing the length of the original.
	function getHashedPassword($original) {
		$salted = substr($original, 0, (strlen($original)/2)) . getSalt() . substr($original, (strlen($original)/2), -1) . substr($original, -1) . getSecondSalt();
		// echo $salted;
		$hashed = hash("sha256", $salted);
		return $hashed;
	}
	
	// Conditions:
	//
	// Username exists
	// Password exists
	// Password is at least 6 characters in length
	// Password confirmation exists
	// Password confirmation matches password
	// Admin access exists
	// Admin access matches preset key
	function checkRegistrationValid(){
		if (!(strlen($_POST['username']) > 0)){
			echo "Username doesn't exist";
			return false;
		}
		if (!(strlen($_POST['password']) > 5)){
			echo "Password is too short";
			return false;
		}
		if (!($_POST['password'] == $_POST['passwordConfirmation'])){
			echo "Passwords don't match";
			return false;
		}
		if (!($_POST['adminAccess'] == getAdminCode())){
			echo $_POST['adminAccess']." - ".getAdminCode();
			return false;
		}
		return true;
	}
	
?>