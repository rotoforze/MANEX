<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Owner Login</title>
  <link rel="stylesheet" href="../css/styles.css">
</head>

<body>

<h2 class="title">Owner Login</h2>

<form action="authenticate.php" method="POST" style="max-width:300px;margin:auto;">
  <input type="email" name="email" placeholder="Email" required><br><br>
  <input type="password" name="password" placeholder="Password" required><br><br>
  <button class="btn" type="submit">Login</button>
</form>

</body>
</html>
