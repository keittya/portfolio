<?php
/* =============================================
   api/setup.php — creates the database + tables
   Open ONCE: http://localhost/portfolio/api/setup.php
   (localhost only — safe to run again anytime)
   ============================================= */
require __DIR__ . '/config.php';
header('Content-Type: text/html; charset=utf-8');

if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit('Forbidden: setup only works on localhost.');
}

$steps = [
    'Create database' => 'CREATE DATABASE IF NOT EXISTS `' . DB_NAME . '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
    'Use database'    => 'USE `' . DB_NAME . '`',
    'Table: users' => 'CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB',
    'Table: login_attempts' => 'CREATE TABLE IF NOT EXISTS login_attempts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_lookup (email, ip_address, attempted_at)
    ) ENGINE=InnoDB',
    'Table: contact_messages' => 'CREATE TABLE IF NOT EXISTS contact_messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(80) NOT NULL,
        last_name VARCHAR(80) NOT NULL DEFAULT \'\',
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        is_read TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB',
];
?><!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Database setup</title>
<style>
body{font-family:Arial,sans-serif;background:#1E1A1D;color:#EDE0E6;max-width:700px;margin:40px auto;padding:0 20px}
h1{color:#D8A7B1} .ok{color:#7dcea0} .bad{color:#e88b8b}
a.btn{display:inline-block;margin:10px 10px 0 0;padding:10px 22px;border-radius:30px;background:#C38D94;color:#1E1A1D;text-decoration:none;font-weight:bold}
</style></head><body>
<h1>Database setup</h1>
<?php
try {
    // connect to MySQL itself first (the database may not exist yet)
    $pdo = new PDO('mysql:host=' . DB_HOST . ';charset=utf8mb4', DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo '<p class="ok">✔ Connected to MySQL</p>';
} catch (PDOException $e) {
    echo '<p class="bad">✘ Cannot connect to MySQL: ' . htmlspecialchars($e->getMessage()) . '</p>';
    echo '<p>Open the XAMPP Control Panel and click <b>Start</b> next to <b>MySQL</b>, then refresh this page.<br>
          If you set a MySQL password, put it in <code>DB_PASS</code> inside <code>api/config.php</code>.</p>';
    exit('</body></html>');
}

$allOk = true;
foreach ($steps as $label => $sql) {
    try { $pdo->exec($sql); echo '<p class="ok">✔ ' . htmlspecialchars($label) . '</p>'; }
    catch (PDOException $e) { $allOk = false; echo '<p class="bad">✘ ' . htmlspecialchars($label) . ' — ' . htmlspecialchars($e->getMessage()) . '</p>'; }
}

if ($allOk) {
    echo '<h2 class="ok">All done — your database is ready.</h2>';
    echo '<a class="btn" href="../login.html">Go to Login / Sign Up</a>';
    echo '<a class="btn" href="check.php">See saved data</a>';
}
?>
</body></html>
