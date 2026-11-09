<?php
require __DIR__ . '/config.php';

$in       = input();
$name     = clean($in['name'] ?? '', 100);
$email    = strtolower(clean($in['email'] ?? '', 150));
$password = (string)($in['password'] ?? '');

if ($name === '' || $email === '' || $password === '') fail('Please fill in all fields.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))         fail('Please enter a valid email.');
if (strlen($password) < 6)                              fail('Password must be at least 6 characters.');
if (strlen($password) > 200)                            fail('Password is too long.');

$pdo  = db();
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) fail('An account with this email already exists.', 409);

$pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);

session_regenerate_id(true);
$_SESSION['user'] = ['id' => (int)$pdo->lastInsertId(), 'name' => $name, 'email' => $email];

respond(['ok' => true, 'user' => $_SESSION['user']]);
