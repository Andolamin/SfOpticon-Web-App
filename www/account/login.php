<?php
	include_once '../functions.php';
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<title>Login</title>
		<link rel="stylesheet" type="text/css" href="css/login.css" />
		<script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
		<link rel="stylesheet" type="text/css" href="font-awesome/css/font-awesome.min.css" />
		<meta name="viewport" content="width=device-width, user-scalable=no"/>
		<script type="text/javascript">
            function revealDown() {
                $(this).siblings('input').attr('type', 'text');
            };

            function revealUp() {
                $(this).siblings('input').attr('type', 'password');
            };

            $(function() {
                $('.reveal').bind("touchstart", function (e) { revealDown.call(this, e); e.stopPropagation(); e.preventDefault(); });
                $('.reveal').bind("mousedown", function (e) { revealDown.call(this, e); });
            });

            $(function() {
                $('.reveal').bind("touchend", function (e) { revealUp.call(this, e); e.stopPropagation(); e.preventDefault(); });
                $('.reveal').bind("mouseup", function (e) { revealUp.call(this, e); });
            });
        </script>
	</head>

	<body>
		<div id="stylized" class="myform">
			<form id="loginForm" name="loginForm" method="post">
				<input type="hidden" name="action" value="login" />
				<input type="hidden" name="return" value="<?php echo $_GET['return'] ?>" />
				<h1>Login</h1>
				<?php
					if (isset($badCredentials) && $badCredentials == true) {
					    auditLog($_POST['username'], 'Bad Credentials');
				?>
				<p style="color:red">Bad username/password combination.</p>
				<?php
					} else if (isset($loggedIn) && $loggedIn == true) {
					    auditLog(null, 'Logged In');
				?>
				<p style="color:green">Success! You will be redirected to your previous location in 2 seconds.</p>
				<script type="text/javascript">
					setTimeout(function() {
						window.location = '<?php echo "http://" . $_SERVER['HTTP_HOST'] . "/" . $_GET['return']; ?>';
					}, 2000);
				</script>
				<?php
					} else if (isset($noAccess) && $noAccess == true) {
					    auditLog(null, 'Logged In - Denied Access');
				?>
				<p style="color:green">Sorry, but you do not have access to this application</p>
				<?php
					} else {
				?>
				<p>This page requires authentication. Please login to continue.</p>
				<?php
					}
					if (!isset($loggedIn) || $loggedIn != true) { // Only show the form if you didn't just log in
				?>

				<label>Email:
					<?php
						if (valueEquals("action", "login") && strlen($_POST['username']) < 1){
					?>
						<span class="small" style="color:red;">Must specify a username</span>
					<?php
						}
					?>
				</label>
				<input type="email" name="username" id="username" <?php if (isset($_POST['username'])) { echo ('value="'.$_POST['username'].'"'); }?> />

				<label>Password
					<?php
						if (valueEquals("action", "login") && strlen($_POST['password']) < 6){
					?>
						<span class="small" style="color:red;">Password is too short</span>
					<?php
						}
					?>
				</label>
				<span style="position: relative">
				<input type="password" name="password" id="password" />
				<span class="reveal" style="position: absolute; right: 22px; z-index: 2; font-size: 17px; top: 0px;"><i class="fa fa-eye"></i></span>
				</span>

				<label>Security Token
					<?php
						if (isset($badCredentials) && $badCredentials == true && (!isset($_POST['token']) || $_POST['token'] == '')) {
					?>
						<span class="small" style="color:red;">Try including your security token</span>
					<?php
						}
					?>
				</label>
				<input type="text" name="token" id="token" <?php if (isset($_POST['token'])) { echo ('value="'.$_POST['token'].'"'); }?> />

				<?php
				if (false) { // Remove this check to allow users to stay logged in via cookies
				?>
				<label>Stay logged in:
				<span class="small">Cookies are less secure.</span>
				</label>
				<input type="checkbox" name="setCookie" value="set" class="checkbox" <?php if (valueEquals("action", "login") && $_POST['setCookie'] == "set"){ echo 'checked="checked"'; }?> />
				<?php
					}
				?>

				<button type="submit">Login</button>
				<div class="spacer"></div>
				<?php
					}
				?>
			</form>
		</div>
	</body>

</html>