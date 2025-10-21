<?php
header('Content-Type: application/json');

$user = $_POST["u"] ?? null;
$pass = $_POST["p"] ?? null;

$servername = "localhost";
$database = "usuarios_manex";
$username = "phpselect";
$password = "gfww0tFgIytk175c";
$port = 3307;

$conn = mysqli_connect($servername, $username, $password, $database, $port);

if (!$conn) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Fallo al conectar con la base de datos'
    ]);
    exit;
}

$sql = "SELECT pass FROM usuarios WHERE user = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 's', $user);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'credenciales incorrectos'
    ]);
    exit;
}

$row = mysqli_fetch_assoc($result);

if ($pass === $row['pass']) {
    echo json_encode([
        'status' => 'success',
        'message' => 'Inicio de sesión exitoso'
    ]);
    exit;
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'credenciales incorrectos'
    ]);
    exit;
}
?>
