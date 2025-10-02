<?php
// config.php
if ($_SERVER['HTTP_HOST'] === 'localhost' || $_SERVER['SERVER_PORT'] == '8085') {
    // Entorno local
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'ciberseguridad');
} else {
    // Entorno producción (ajusta según tu hosting)
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_NAME', 'ciberseguridad');
}
?>