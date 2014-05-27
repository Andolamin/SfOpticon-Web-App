<?php
	include_once 'accountFunctions.php';
	
	$showLogin = true;
	// Pull in the correct page
	if (valueEquals("action", "login")) {
		include_once 'handleLogin.php';
	} else if (valueEquals("action", "logout")) {
		include_once 'logout.php';
	}
		
	if ($showLogin) {
		include_once 'login.php';
	}