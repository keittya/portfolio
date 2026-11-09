<?php
require __DIR__ . '/config.php';

respond(['ok' => true, 'user' => $_SESSION['user'] ?? null]);
