<?php
header('Content-Type: application/json');
require '../../env/bbdd.credentials.php';

$user = $_POST["user"] ?? null;
$pass = $_POST["pass"] ?? null;

if (!$user && !$pass) {
    echo json_encode([
        'status' => 'error',
        'message' => 'null credentials'
    ]);
    exit;
}

$servername = Credentials::$bbdd_hostname;
$username = Credentials::$bbdd_username;
$password = Credentials::$bbdd_password;
$database = Credentials::$bbdd_table_users;
$port = Credentials::$bbdd_port;

$conn = mysqli_connect($servername, $username, $password, $database, $port);

if (!$conn) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Fallo al conectar con la base de datos'
    ]);
    exit;
}

$sql = "SELECT password FROM Empleado WHERE email = ?";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 's', $user);
mysqli_stmt_execute($stmt);
;
$result = mysqli_stmt_get_result($stmt);
if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'credenciales incorrectos'
    ]);
    exit;
}

$row = mysqli_fetch_assoc($result);
$finalpassword = $row['password'];

if ($pass == $finalpassword) {
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