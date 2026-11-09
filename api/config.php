<?php
/* =============================================
   api/config.php — database + shared helpers
   Default XAMPP: user "root", empty password.
   ============================================= */
declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_NAME = 'portfolio_db';
const DB_USER = 'root';
const DB_PASS = '';

// true while testing on XAMPP: shows the real error message. Set to false when going live.
const DEBUG = true;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);
session_start();

set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok'    => false,
        'error' => DEBUG ? 'Server error: ' . $e->getMessage() : 'Server error. Please try again.',
    ]);
    exit;
});

function respond(array $payload, int $code = 200): void {
    http_response_code($code);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $error, int $code = 400): void {
    respond(['ok' => false, 'error' => $error], $code);
}

function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            fail('Database connection failed. Check that MySQL is running and database.sql was imported.' . (DEBUG ? ' (' . $e->getMessage() . ')' : ''), 500);
        }
    }
    return $pdo;
}

/** Reads the JSON body of a POST request. */
function input(): array {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST required.', 405);
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function clean(mixed $v, int $max = 255): string {
    return mb_substr(trim((string)($v ?? '')), 0, $max);
}

function client_ip(): string {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
