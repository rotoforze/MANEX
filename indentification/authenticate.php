<?php
session_start();
require 'config.php';

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

$url = SUPABASE_URL . '/auth/v1/token?grant_type=password';

$data = json_encode([
    'email' => $email,
    'password' => $password
]);

$headers = [
    'Content-Type: application/json',
    'apikey: ' . SUPABASE_ANON_KEY
];

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_POSTFIELDS => $data
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    $result = json_decode($response, true);

    $_SESSION['access_token'] = $result['access_token'];
    $_SESSION['user'] = $result['user'];

    header('Location: ownerDashboard.php');
    exit;
}

echo "Invalid email or password";
