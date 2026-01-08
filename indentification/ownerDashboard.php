<?php
session_start();

if (!isset($_SESSION['access_token'])) {
    header('Location: ownerLogin.php');
    exit;
}

$user = $_SESSION['user'];
?>

<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Owner Panel</title>
</head>
<body>

<h1>Owner Panel</h1>
<p>Logged in as: <?= htmlspecialchars($user['email']) ?></p>

<a href="logout.php">Logout</a>

</body>
</html>
