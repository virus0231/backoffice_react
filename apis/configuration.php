<?php
include('config.php');

$domain = $_SERVER['HTTP_HOST'];

// 1) check if table exists
$checkTableQuery = "SHOW TABLES LIKE 'wp_yoc_dm_services'";
$stmt = $conn->query($checkTableQuery);

if ($stmt->rowCount() > 0) {
    // table exists, go back to index
    header("Location: ../index.php");
    exit();
} else {
    // delete images from company folder
    $companyFolder = __DIR__ . "/../assets/images/company"; // make it absolute
    $files = glob($companyFolder . '/*');
    foreach ($files as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
}

if (isset($_POST["submit"])) {

    $company_name   = $_POST["company_name"];
    $website_url    = $_POST["website_url"];
    $user_name      = $_POST["username"];
    $password       = $_POST["password"];

    // hash password
    $expected_password = hash_hmac("sha256", $password, $company_name);

    $site_logo   = $_FILES["site_logo"];
    $site_loader = $_FILES["site_loader"];

    // helper fns
    function isImage($file) {
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return in_array($file['type'], $allowedTypes, true);
    }

    function isFileSizeValid($file) {
        $maxSize = 10 * 1024 * 1024; // 10MB
        return $file['size'] <= $maxSize;
    }

    // validate images
    if (!isImage($site_logo) || !isFileSizeValid($site_logo)) {
        echo "<script>alert('Invalid site logo file. Please upload a valid image (max 10 MB).');</script>";
        exit();
    }

    if (!isImage($site_loader) || !isFileSizeValid($site_loader)) {
        echo "<script>alert('Invalid site loader file. Please upload a valid image (max 10 MB).');</script>";
        exit();
    }

    // UPLOADS
    // make sure folder exists
    $uploadDir = __DIR__ . '/../assets/images/company/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $logoRandomName   = uniqid() . '_' . bin2hex(random_bytes(8)) . '_logo.'   . pathinfo($site_logo['name'], PATHINFO_EXTENSION);
    $loaderRandomName = uniqid() . '_' . bin2hex(random_bytes(8)) . '_loader.' . pathinfo($site_loader['name'], PATHINFO_EXTENSION);

    move_uploaded_file($site_logo['tmp_name'], $uploadDir . $logoRandomName);
    move_uploaded_file($site_loader['tmp_name'], $uploadDir . $loaderRandomName);

    // 2) create user (wp_yoc_users)
    $userSQL = "INSERT INTO wp_yoc_users (user_login, display_name, user_pass, user_role, user_status)
                VALUES (:user_login, 'superadmin', :user_pass, '1', '0')";
    $stmtUser = $conn->prepare($userSQL);
    $stmtUser->execute([
        ':user_login' => $user_name,
        ':user_pass'  => $expected_password,
    ]);

    // 3) create services table
    $createQuery = "CREATE TABLE wp_yoc_dm_services (
                        id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        account_key VARCHAR(255) NOT NULL,
                        status VARCHAR(255) NOT NULL
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    try {
        $conn->exec($createQuery);
    } catch (PDOException $e) {
        echo "Error creating table: " . $e->getMessage();
        exit();
    }

    // 4) insert settings rows
    $data = [
        'site_name'   => $company_name,
        'site_url'    => $website_url,
        'site_logo'   => $logoRandomName,
        'site_loader' => $loaderRandomName,
    ];

    $insertQuery = "INSERT INTO wp_yoc_dm_services (name, account_key, status)
                    VALUES (:name, :account_key, '1')";
    $stmtInsert = $conn->prepare($insertQuery);

    foreach ($data as $key => $val) {
        $stmtInsert->execute([
            ':name'        => $key,
            ':account_key' => $val,
        ]);
    }

    header("Location: /index.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Company</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  <style>
    #my_form{
      background-color: #fff;
      border-radius: 20px;
      border: 0 solid rgba(0,0,0,0.125);
    }
  </style>
</head>
<body style="background: #c8c8c8">
  <form class="col-5 mx-auto mt-4 p-4" id="my_form" action="" method="post" enctype="multipart/form-data">
    <div class="container" id="form1">
      <h2 class="text-center" style="font-family: arial;">Configuration</h2>
      <label class="form-label mt-2">Company Name</label>
      <input type="text" class="form-control" name="company_name" placeholder="Company Name" required>

      <label class="form-label mt-2">Website URL</label>
      <input type="text" class="form-control" name="website_url" placeholder="<?php echo htmlspecialchars($domain); ?>" required value="<?php echo htmlspecialchars($domain); ?>">

      <label class="form-label mt-2">Site Logo</label>
      <input type="file" class="form-control" name="site_logo" required>

      <label class="form-label mt-2">Site Loader</label>
      <input type="file" class="form-control" name="site_loader" required>

      <button type="button" class="btn btn-primary col-4 ms-auto d-block mt-4" onclick="nextForm()">Next</button>
    </div>

    <div class="container" id="form2" style="display: none;">
      <h2 class="text-center" style="font-family: arial;">User</h2>
      <label class="form-label mt-2">User Name</label>
      <input type="text" class="form-control" name="username" placeholder="User Name" required>

      <label class="form-label mt-2">Password</label>
      <input type="text" class="form-control" name="password" placeholder="password" required>

      <div style="display: flex; justify-content: space-between;" class="mt-5">
        <button type="button" class="btn btn-primary col-4" onclick="backForm()">Back</button>
        <button type="submit" name="submit" class="btn btn-primary col-4">Submit</button>
      </div>
    </div>
  </form>

  <script>
    function nextForm() {
      document.getElementById('form1').style.display = 'none';
      document.getElementById('form2').style.display = 'block';
    }
    function backForm() {
      document.getElementById('form1').style.display = 'block';
      document.getElementById('form2').style.display = 'none';
    }
  </script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" crossorigin="anonymous"></script>
</body>
</html>
