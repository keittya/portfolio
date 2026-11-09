<?php
require __DIR__ . '/config.php';

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    setcookie(session_name(), '', time() - 3600, '/');
}
session_destroy();
respond(['ok' => true]);
