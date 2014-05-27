<?php
    // session_start() has to go right at the top, before any output!
    session_start();
    // Application will not be writing to the session, so we'll go ahead and close session write just like in services
    session_write_close();

    require_once("functions.php");

    if (verifyLogin("account/enterprise.wsdl.xml") == false) {
        header( 'Location: http://' . $_SERVER['HTTP_HOST'] . '/account/account.php?return=' . $_GET['fn']);
    }

    if (isset($_GET['fn'])) {
        if ($_GET['fn'] == '') {
            $_GET['fn'] = 'index.html'; // FIXME: Should be handled in the .htaccess file, but this is a fallback
        }
        if (EndsWith($_GET['fn'], '.css')) {
            header('Content-type: text/css');
        } else if (EndsWith($_GET['fn'], '.js')) {
            header('Content-type: text/javascript');
        } else if (EndsWith($_GET['fn'], '.woff')) {
            header('Content-type: application/font-woff');
        }
        // echo mime_content_type($_GET['fn']);
        // header('Content-type: ' . mime_content_type($_GET['fn']));
        include($_GET['fn']);
        exit();
    } else {
        header('HTTP/1.0 404 Not Found');
?>
<html>

    <head>
        <title>404 Not Found</title>
    </head>

    <body>
        <h1>404 Not Found</h1>
        The page that you have requested could not be found.
    </body>

</html>
<?php
        exit();
    }
?>