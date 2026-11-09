<?php
require __DIR__ . '/config.php';

$in      = input();
$first   = clean($in['fname'] ?? '', 80);
$last    = clean($in['lname'] ?? '', 80);
$email   = strtolower(clean($in['email'] ?? '', 150));
$message = clean($in['message'] ?? '', 3000);

if ($first === '' || $email === '' || $message === '') fail('Please fill in the required fields.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL))         fail('Please enter a valid email.');

db()->prepare('INSERT INTO contact_messages (first_name, last_name, email, message, ip_address)
               VALUES (?, ?, ?, ?, ?)')
    ->execute([$first, $last, $email, $message, client_ip()]);

respond(['ok' => true]);
