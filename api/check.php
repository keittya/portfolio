<?php
/* =============================================
   api/check.php — "Is my data being saved?" page
   Open: http://localhost/portfolio/api/check.php
   Works from localhost only. Delete before going live.
   ============================================= */
require __DIR__ . '/config.php';
header('Content-Type: text/html; charset=utf-8');

if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', ['127.0.0.1', '::1'], true)) {
    http_response_code(403);
    exit('Forbidden: this page only works on localhost.');
}

function h($v): string { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
function row(bool $ok, string $label, string $detail = ''): void {
    echo '<p class="' . ($ok ? 'ok' : 'bad') . '">' . ($ok ? '✔' : '✘') . ' <b>' . h($label) . '</b> ' . h($detail) . '</p>';
}
function table(array $rows): void {
    if (!$rows) { echo '<p class="muted">No rows yet.</p>'; return; }
    echo '<table><tr>';
    foreach (array_keys($rows[0]) as $k) echo '<th>' . h($k) . '</th>';
    echo '</tr>';
    foreach ($rows as $r) { echo '<tr>'; foreach ($r as $v) echo '<td>' . h($v) . '</td>'; echo '</tr>'; }
    echo '</table>';
}
?><!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Database check</title>
<style>
body{font-family:Arial,sans-serif;background:#1E1A1D;color:#EDE0E6;max-width:900px;margin:40px auto;padding:0 20px}
h1{color:#D8A7B1} h2{color:#C38D94;margin-top:32px}
.ok{color:#7dcea0} .bad{color:#e88b8b} .muted{color:#aaa}
table{border-collapse:collapse;width:100%;font-size:14px} th,td{border:1px solid #444;padding:6px 10px;text-align:left} th{background:#332A2F}
code{background:#332A2F;padding:2px 6px;border-radius:4px}
</style></head><body>
<h1>Database check</h1>
<?php
row(true, 'PHP is running', 'version ' . PHP_VERSION);
row(true, 'Config', 'host=' . DB_HOST . '  database=' . DB_NAME . '  user=' . DB_USER);

try {
    $pdo = new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    row(true, 'Connected to MySQL database', DB_NAME);
} catch (PDOException $e) {
    row(false, 'Cannot connect', $e->getMessage());
    echo '<p class="muted">Fix: start MySQL in XAMPP, run database.sql in phpMyAdmin, and check DB_USER / DB_PASS in <code>api/config.php</code>.</p>';
    exit('</body></html>');
}

$missing = false;
foreach (['users', 'login_attempts', 'contact_messages'] as $t) {
    try { $n = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn(); row(true, "Table $t", "$n row(s)"); }
    catch (PDOException $e) { row(false, "Table $t", 'missing — run database.sql'); $missing = true; }
}
if ($missing) exit('</body></html>');

echo '<h2>Latest accounts (users)</h2>';
table($pdo->query('SELECT id, name, email, created_at, last_login FROM users ORDER BY id DESC LIMIT 10')->fetchAll());
echo '<h2>Latest contact messages</h2>';
table($pdo->query('SELECT id, first_name, last_name, email, LEFT(message, 60) AS message, created_at FROM contact_messages ORDER BY id DESC LIMIT 10')->fetchAll());
?>
<p class="muted">Refresh this page after signing up or sending a message to see new rows.</p>
</body></html>
