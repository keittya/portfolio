<?php
require __DIR__ . '/config.php';

$in       = input();
$email    = strtolower(clean($in['email'] ?? '', 150));
$password = (string)($in['password'] ?? '');
$remember = !empty($in['remember']);
$ip       = client_ip();
$pdo      = db();

// Throttle: max 5 failed attempts per 15 minutes (per email + IP)
$stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts
                       WHERE email = ? AND ip_address = ? AND attempted_at > (NOW() - INTERVAL 15 MINUTE)');
$stmt->execute([$email, $ip]);
if ((int)$stmt->fetchColumn() >= 5) fail('Too many failed attempts. Please try again in 15 minutes.', 429);

$stmt = $pdo->prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    $pdo->prepare('INSERT INTO login_attempts (email, ip_address) VALUES (?, ?)')->execute([$email, $ip]);
    fail('Incorrect email or password.', 401);
}

// Success
$pdo->prepare('DELETE FROM login_attempts WHERE email = ?')->execute([$email]);
$pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?')->execute([$user['id']]);

session_regenerate_id(true);
$_SESSION['user'] = ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email']];

if ($remember) { // keep the login cookie for 30 days
    setcookie(session_name(), session_id(), [
        'expires' => time() + 60 * 60 * 24 * 30,
        'path' => '/', 'httponly' => true, 'samesite' => 'Lax',
    ]);
}

respond(['ok' => true, 'user' => $_SESSION['user']]);
