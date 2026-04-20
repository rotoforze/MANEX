<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: http://localhost:5173");
require '../../env/bbdd.credentials.php';

$recivedUser = $_POST["usuario"] ?? null;
$recivedPass = $_POST["pass"] ?? null;
$recivedKeepSession = $_POST["keepSession"] ?? null;
$recivedToken = $_POST["token"] ?? null;


if (!$recivedUser && !$recivedPass && !$recivedToken) {
    echo json_encode([
        'status' => 'error',
        'message' => 'null credentials'
    ]);
    exit;
}

$servername = Credentials::$bbdd_hostname;
$username = Credentials::$bbdd_username;
$bbddPassword = Credentials::$bbdd_password;
$database = Credentials::$bbdd_table_users;
$port = Credentials::$bbdd_port;

$conn = mysqli_connect($servername, $username, $bbddPassword, $database, $port);

if ($recivedToken && $recivedToken != '' && !$recivedPass && !$recivedUser) {
    $sqlToken = "SELECT username, token FROM auth_token WHERE token = ? AND expires_at > NOW()";
    $stmtToken = mysqli_prepare($conn, $sqlToken);
    mysqli_stmt_bind_param($stmtToken, 's', $recivedToken);
    mysqli_stmt_execute($stmtToken);
    $resToken = mysqli_stmt_get_result($stmtToken);

    if (mysqli_num_rows($resToken) > 0) {
        $rowToken = mysqli_fetch_assoc($resToken);
        echo json_encode([
            'status' => 'success',
            'message' => 'Inicio de sesión exitoso',
            'token' => [$recivedKeepSession, $rowToken["token"], $rowToken["username"]]
        ]);
        exit;
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'token incorrecto o expirado'
        ]);
        exit;
    }
}

if (!$conn) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Fallo al conectar con la base de datos'
    ]);
    exit;
}

$sql = "SELECT PASSWORD FROM usuario WHERE USERNAME = ?";

$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 's', $recivedUser);
mysqli_stmt_execute($stmt);;
$result = mysqli_stmt_get_result($stmt);
if (mysqli_num_rows($result) === 0) {
    echo json_encode([
        'status' => 'error',
        'message' => 'credenciales incorrectos1'
    ]);
    exit;
}

$row = mysqli_fetch_assoc($result);
$finalpassword = $row['PASSWORD'];

if ($recivedPass == $finalpassword) {
    $token = '';
    if ($recivedKeepSession) {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $sqlUpsert = "INSERT INTO auth_token (username, token, expires_at) 
                      VALUES (?, ?, ?) 
                      ON DUPLICATE KEY UPDATE token = VALUES(token), expires_at = VALUES(expires_at)";

        $stmtUpsert = mysqli_prepare($conn, $sqlUpsert);
        mysqli_stmt_bind_param($stmtUpsert, 'sss', $recivedUser, $token, $expires);
        mysqli_stmt_execute($stmtUpsert);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Inicio de sesión exitoso',
        'token' => [$recivedKeepSession, $token]
    ]);
    exit;
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'credenciales incorrectos'
    ]);
    exit;
}
