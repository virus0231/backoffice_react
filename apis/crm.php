<?php
if (session_id() === "") session_start();
include('config.php');
ini_set('display_errors', '1'); 
ini_set('display_startup_errors', '1'); 
error_reporting(E_ALL);

try {

    if (isset($_POST['action'])) {
        if ($_POST['action'] == 'update') {
            $crmid = $_POST['crm_id'];
            $appid = $_POST['app_id'];
            $amntid = $_POST['amount_id'];
            $fundid = $_POST['fund_id'];
            $crmRelationid = fetch_crm_id($conn, $appid, $amntid, $fundid);

            if ($crmRelationid != '') {
                $stmt = $conn->prepare("UPDATE `wp_yoc_sf_relation` SET `sf_id` = :sf_id WHERE `ap_id` = :ap_id AND `findlist_id` = :findlist_id AND `amount_id` = :amount_id");
                $stmt->execute([
                    ':sf_id' => $crmid,
                    ':ap_id' => $appid,
                    ':findlist_id' => $fundid,
                    ':amount_id' => $amntid
                ]);
                echo 'Updated';
            } else {
                $stmt = $conn->prepare("INSERT INTO `wp_yoc_sf_relation` (`ap_id`, `findlist_id`, `amount_id`, `sf_id`) VALUES (:ap_id, :findlist_id, :amount_id, :sf_id)");
                $stmt->execute([
                    ':ap_id' => $appid,
                    ':findlist_id' => $fundid,
                    ':amount_id' => $amntid,
                    ':sf_id' => $crmid
                ]);
                echo 'Inserted';
            }
        }
    }

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

function fetch_crm_id($conn, $app_id, $amount_id, $fund_id) {
    $stmt = $conn->prepare("SELECT `id` FROM `wp_yoc_sf_relation` WHERE `ap_id` = :ap_id AND `findlist_id` = :findlist_id AND `amount_id` = :amount_id");
    $stmt->execute([
        ':ap_id' => $app_id,
        ':findlist_id' => $fund_id,
        ':amount_id' => $amount_id
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['id'] : '';
}

function fetch_give_crm_id($conn, $form_id, $fund_id, $amountid) {
    $stmt = $conn->prepare("SELECT `id` FROM `wp_yoc_give_sf_relation` WHERE `form_id` = :form_id AND `fund_id` = :fund_id AND `amount_level_id` = :amount_level_id");
    $stmt->execute([
        ':form_id' => $form_id,
        ':fund_id' => $fund_id,
        ':amount_level_id' => $amountid
    ]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['id'] : '';
}

function fetch_crm_data($conn, $crmDataName) {
    $stmt = $conn->prepare("SELECT `id` FROM `wp_yoc_sfdata` WHERE `name` = :name");
    $stmt->execute([':name' => $crmDataName]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? $row['id'] : '';
}
?>
