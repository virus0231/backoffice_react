<?php
if(session_id() === "") session_start();

function get_new_donor_count($conn, $username) {
    $sql = "SELECT * FROM `wp_yoc_users` WHERE `user_login` = :username AND `user_status` = '0'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) > 0) {
        return $rows[0];
    } else {
        return array();
    }
}


function get_new_order_count($conn, $username) {
    $sql = "SELECT * FROM `wp_yoc_users` WHERE `user_login` = :username AND `user_status` = '0'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) > 0) {
        return $rows[0];
    } else {
        return array();
    }
}


function get_new_schedule_count($conn, $username) {
    $sql = "SELECT * FROM `wp_yoc_users` WHERE `user_login` = :username AND `user_status` = '0'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) > 0) {
        return $rows[0];
    } else {
        return array();
    }
}


function get_new_total_revenue($conn, $username) {
    $sql = "SELECT * FROM `wp_yoc_users` WHERE `user_login` = :username AND `user_status` = '0'";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':username', $username, PDO::PARAM_STR);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) > 0) {
        return $rows[0];
    } else {
        return array();
    }
}


//causes
function get_all_appeals($conn) {
    $sql = "SELECT * FROM `wp_yoc_appeal`";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}




function get_amounts($conn, $appeal_id) {
    $sql = "SELECT * FROM `wp_yoc_amount` WHERE `appeal_id` = :appeal_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':appeal_id', $appeal_id, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}


function get_funds($conn, $appeal_id) {
    $return = array();
    $sql = "SELECT * FROM `wp_yoc_fundlist` WHERE `appeal_id` = :appeal_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':appeal_id', $appeal_id, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($rows) > 0) {
        $return = $rows;
    }
    return $return;
}


function get_catagory($conn) {
    $sql = "SELECT * FROM `wp_yoc_category` ORDER BY `id` ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}

function get_catagory_with_id($conn, $cat_id) {
    $sql = "SELECT * FROM `wp_yoc_category` WHERE `id` = :cat_id ORDER BY `id` ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':cat_id', $cat_id, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}


function get_country($conn) {
    $sql = "SELECT * FROM `wp_yoc_country` ORDER BY `id` ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}


function get_country_with_id($conn, $country_id) {
    $sql = "SELECT * FROM `wp_yoc_country` WHERE `id` = :country_id ORDER BY `id` ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':country_id', $country_id, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}


function get_asso_funds($conn, $amount_id) {
    $sql = "SELECT fundlistid FROM `wp_yoc_fund_amount_combo` WHERE amountid = :amount_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':amount_id', $amount_id, PDO::PARAM_INT);
    $stmt->execute();
    $fundlistid = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $fundlistid[] = $row['fundlistid'];
    }
    return $fundlistid;
}

function get_asso_amounts($conn, $fund_id) {
    $sql = "SELECT amountid FROM `wp_yoc_fund_amount_combo` WHERE fundlistid = :fund_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':fund_id', $fund_id, PDO::PARAM_INT);
    $stmt->execute();
    $amountlistid = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $amountlistid[] = $row['amountid'];
    }
    return $amountlistid;
}


//CRM
function get_all_crm_appeals($conn) {
    $sql = "SELECT * FROM `wp_yoc_appeal` WHERE `type` != 'Give_form' ORDER BY id DESC";
    $stmt = $conn->query($sql);
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


function fetch_crm_id($conn, $app_id, $amount_id, $fund_id) {
    $sql = "SELECT `sf_id` FROM `wp_yoc_sf_relation` WHERE `ap_id` = :app_id AND `findlist_id` = :fund_id AND `amount_id` = :amount_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':app_id', $app_id, PDO::PARAM_INT);
    $stmt->bindParam(':fund_id', $fund_id, PDO::PARAM_INT);
    $stmt->bindParam(':amount_id', $amount_id, PDO::PARAM_INT);
    $stmt->execute();
    $id = '';
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $id = $row['sf_id'];
    }
    return $id;
}

function fetch_crm_data($conn) {
    $sql = "SELECT * FROM `wp_yoc_sfdata`";
    $stmt = $conn->query($sql);
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}

function fetch_crm_amount_data($conn, $appeal_id) {
    $sql = "SELECT `wp_yoc_amount`.`id` as amount_id, `wp_yoc_amount`.`name` as amount_name, `wp_yoc_fundlist`.`id` as fund_id, `wp_yoc_fundlist`.`name` as fund_name 
            FROM `wp_yoc_amount` 
            LEFT JOIN `wp_yoc_fundlist` ON `wp_yoc_amount`.`appeal_id` = `wp_yoc_fundlist`.`appeal_id` 
            WHERE `wp_yoc_amount`.`appeal_id` = :appeal_id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':appeal_id', $appeal_id, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}

function fetch_crm_only_amount_data($conn, $appeal_id) {
    $sql = "SELECT * FROM `wp_yoc_amount` WHERE `appeal_id` = :appeal_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':appeal_id', $appeal_id, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


// Utility: find the first existing table from a list of candidates
function find_first_existing_table($conn, $candidates) {
    foreach ($candidates as $table) {
        $stmt = $conn->prepare("SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = :table LIMIT 1");
        $stmt->bindParam(':table', $table, PDO::PARAM_STR);
        $stmt->execute();
        if ($stmt->fetchColumn()) {
            return $table;
        }
    }
    return null;
}

// Helper function to get all common table names with dual prefix support
function get_table_names($conn) {
    static $tables = null;

    if ($tables !== null) {
        return $tables;
    }

    $tables = [
        'transactions' => find_first_existing_table($conn, ['pw_transactions', 'wp_yoc_transactions']),
        'transaction_details' => find_first_existing_table($conn, ['pw_transaction_details', 'wp_yoc_transaction_details']),
        'donors' => find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']),
        'appeal' => find_first_existing_table($conn, ['pw_appeal', 'wp_yoc_appeal']),
        'amount' => find_first_existing_table($conn, ['pw_amount', 'wp_yoc_amount']),
        'fundlist' => find_first_existing_table($conn, ['pw_fundlist', 'wp_yoc_fundlist']),
        'category' => find_first_existing_table($conn, ['pw_category', 'wp_yoc_category']),
        'country' => find_first_existing_table($conn, ['pw_country', 'wp_yoc_country']),
        'schedule' => find_first_existing_table($conn, ['pw_schedule', 'wp_yoc_schedule']),
        'fund_amount_combo' => find_first_existing_table($conn, ['pw_fund_amount_combo', 'wp_yoc_fund_amount_combo']),
    ];

    return $tables;
}

//users
function get_all_users($conn) {
    // Support both prefixed table sets (pw_* or wp_yoc_*)
    $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
    $roleTable = find_first_existing_table($conn, ['pw_user_role', 'wp_yoc_user_role']);

    if (!$userTable || !$roleTable) {
        // Return empty array instead of fatal error when tables are missing
        return [];
    }

    // Alias role name to avoid clobbering the numeric role id from the users table
    $sql = "SELECT `$userTable`.*, `$roleTable`.`user_role` AS role_name
            FROM `$userTable`
            INNER JOIN `$roleTable` ON `$roleTable`.`id` = `$userTable`.`user_role`
            WHERE `$userTable`.`user_role` != 1";

    $stmt = $conn->query($sql);
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


function get_usersss($conn, $id) {
    $userTable = find_first_existing_table($conn, ['pw_users', 'wp_yoc_users']);
    if (!$userTable) return null;
    $sql = "SELECT * FROM `$userTable` WHERE ID = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}

function get_user_role($conn) {
    $sql = "SELECT * FROM `wp_yoc_user_role`";
    $stmt = $conn->query($sql);
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


// donor
function get_all_donors_count($conn) {
    $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);
    if (!$donorTable) return 0;

    $sql_total = "SELECT COUNT(*) as total FROM `$donorTable`";
    $stmt_total = $conn->query($sql_total);
    $total_rows = $stmt_total->fetch(PDO::FETCH_ASSOC)['total'];
    $total_pages = ceil($total_rows / 25);
    return $total_pages;
}




function get_all_donors($conn, $start) {
    $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);
    if (!$donorTable) return [];

    $sql = "SELECT * FROM `$donorTable` ORDER BY id DESC LIMIT :start, 25";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':start', $start, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}



function get_donor($conn, $id) {
    $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);
    if (!$donorTable) return [];

    $sql = "SELECT * FROM `$donorTable` WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


function search_donor($conn, $email) {
    $donorTable = find_first_existing_table($conn, ['pw_donors', 'wp_yoc_donors', 'donors']);
    if (!$donorTable) return [];

    $sql = "SELECT * FROM `$donorTable` WHERE email = :email";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $email, PDO::PARAM_STR);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}

function get_donor_donations($conn, $id) {
    $sql = "SELECT * FROM `wp_yoc_transactions` WHERE `DID` = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


function get_donor_donation_details($conn, $id) {
    $sql = "SELECT wp_yoc_appeal.name AS app_name,
                   wp_yoc_amount.name AS amount_name,
                   wp_yoc_fundlist.name AS fund_name,
                   wp_yoc_transaction_details.amount AS td_amount,
                   wp_yoc_transaction_details.quantity AS td_quantity,
                   wp_yoc_transaction_details.freq AS td_freq
            FROM `wp_yoc_transactions`
            INNER JOIN wp_yoc_transaction_details ON wp_yoc_transactions.id = wp_yoc_transaction_details.TID
            INNER JOIN wp_yoc_appeal ON wp_yoc_transaction_details.appeal_id = wp_yoc_appeal.id
            INNER JOIN wp_yoc_amount ON wp_yoc_amount.id = wp_yoc_transaction_details.amount_id
            INNER JOIN wp_yoc_fundlist ON wp_yoc_fundlist.id = wp_yoc_transaction_details.fundlist_id
            WHERE wp_yoc_transactions.id = :id";
    
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $return = '';
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $freq = "Single";
        if ($row['td_freq'] == "1") {
            $freq = "Monthly";
        } elseif ($row['td_freq'] == "2") {
            $freq = "Yearly";
        } elseif ($row['td_freq'] == "3") {
            $freq = "Daily";
        }
        
        $return .= "<tr class='donation_" . $id . "' style='display:none;'>";
        $return .= "<td><i class='mdi mdi-chevron-right'></i></td>";
        $return .= "<td>" . htmlspecialchars($row['app_name']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['amount_name']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['fund_name']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['td_amount']) . "</td>";
        $return .= "<td>Qty " . htmlspecialchars($row['td_quantity']) . "</td>";
        $return .= "<td>" . htmlspecialchars($freq) . "</td>";
        $return .= "<td></td><td></td></tr>";
    }
    
    return $return;
}


function get_donor_subscription_details($conn, $id, $order_id) {
    $sql = "SELECT wp_yoc_appeal.name AS app_name,
                   wp_yoc_amount.name AS amount_name,
                   wp_yoc_fundlist.name AS fund_name,
                   wp_yoc_transaction_details.amount AS td_amount,
                   wp_yoc_transaction_details.quantity AS td_quantity,
                   wp_yoc_transaction_details.freq AS td_freq,
                   `wp_yoc_transactions`.order_id AS app_order_id
            FROM `wp_yoc_transactions`
            INNER JOIN wp_yoc_transaction_details ON wp_yoc_transactions.id = wp_yoc_transaction_details.TID
            INNER JOIN wp_yoc_appeal ON wp_yoc_transaction_details.appeal_id = wp_yoc_appeal.id
            INNER JOIN wp_yoc_amount ON wp_yoc_amount.id = wp_yoc_transaction_details.amount_id
            INNER JOIN wp_yoc_fundlist ON wp_yoc_fundlist.id = wp_yoc_transaction_details.fundlist_id 
            WHERE wp_yoc_transactions.order_id LIKE :order_id";

    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':order_id', $order_id, PDO::PARAM_STR);
    $stmt->execute();
    
    $return = '';
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $freq = "Single";
        if ($row['td_freq'] == "1") {
            $freq = "Monthly";
        } elseif ($row['td_freq'] == "2") {
            $freq = "Yearly";
        } elseif ($row['td_freq'] == "3") {
            $freq = "Daily";
        }
        
        $return .= "<tr class='subscription_" . $id . "' style='display:none;'>";
        $return .= "<td><i class='mdi mdi-chevron-right'></i></td>";
        $return .= "<td>" . htmlspecialchars($row['app_order_id']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['app_name']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['amount_name']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['fund_name']) . "</td>";
        $return .= "<td>" . htmlspecialchars($row['td_amount']) . "</td>";
        $return .= "<td>Qty " . htmlspecialchars($row['td_quantity']) . "</td>";
        $return .= "<td>" . htmlspecialchars($freq) . "</td>";
        $return .= "<td></td><td></td></tr>";
    }
    
    return $return;
}


function get_donor_subscriptions($conn, $id) {
    $sql = "SELECT * FROM `wp_yoc_schedule` WHERE `did` = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $return = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $return[] = $row;
    }
    
    return $return;
}


//Digital Marketing

function get_all_dm_services($conn) {
    $sql = "SELECT * FROM `wp_yoc_dm_services`";
    $stmt = $conn->query($sql);
    $return = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $return[] = $row;
    }
    
    return $return;
}


function get_dm_service($conn, $id) {
    $sql = "SELECT * FROM `wp_yoc_dm_services` WHERE id = :id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();
    
    $return = array();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $return[] = $row;
    }
    
    return $return;
}


//reports

function reports_get_all_payment_type($conn)
{
    $sql = "SELECT DISTINCT paymenttype FROM `wp_yoc_transactions` ORDER BY paymenttype ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
}


function reports_get_all_status($conn)
{
    $sql = "SELECT DISTINCT status FROM `wp_yoc_transactions` ORDER BY `status` ASC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
}


function status_wp_yoc_myTenNight($conn)
{
    $sql = "SELECT DISTINCT status FROM `wp_yoc_myTenNight` ORDER BY `status` ASC";
     $stmt = $conn->prepare($sql);
     $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
}

function status_wp_yoc_myTenDays($conn)
{
    $sql = "SELECT DISTINCT status FROM `wp_yoc_myTenDays` ORDER BY `status` ASC";
     $stmt = $conn->prepare($sql);
     $stmt->execute();
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $result;
    
   
}


function get_appeal_data($conn, $appeal_id) {
    $sql = "SELECT * FROM `wp_yoc_appeal` WHERE id = :appeal_id";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':appeal_id', $appeal_id, PDO::PARAM_INT);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}

function get_associate_amount_fundlist($conn, $amount_id) {
    $query = "SELECT `wp_yoc_fundlist`.`id`, `wp_yoc_fundlist`.`name` 
              FROM `wp_yoc_fund_amount_combo` 
              INNER JOIN `wp_yoc_fundlist` ON `wp_yoc_fundlist`.`id` = `wp_yoc_fund_amount_combo`.`fundlistid` 
              WHERE `wp_yoc_fund_amount_combo`.`amountid` = :amount_id 
              AND `wp_yoc_fundlist`.`disable` = '0'";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':amount_id', $amount_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $result = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $result[] = $row;
    }
    
    return $result;
}


function get_all_ipaddress($conn) {
    $sql = "SELECT * FROM `wp_yoc_ipaddress` ORDER BY id DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}


function get_all_featured($conn) {
    $sql = "SELECT * FROM `wp_yoc_amount` where featured=1 ORDER BY id DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $return = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $return;
}

function getYesterdayDonationStats($conn)
{
    $query = "
        SELECT
            DATE_FORMAT(date, '%Y-%m-%d') AS transaction_date,
            SUM(totalamount) AS total_donation_value,
            COUNT(id) AS number_of_donations,
            AVG(totalamount) AS average_donation_value
        FROM
            wp_yoc_transactions
        WHERE
            status = 'Completed'
            AND DATE(date) = CURDATE() - INTERVAL 1 DAY
        GROUP BY
            transaction_date
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($result)
    {
        return $result;
    }
    else
    {
        return ['total_donation_value' => 0, 'number_of_donations' => 0, 'average_donation_value' => 0];
    }
}


function getYesterdayAppealStats($conn)
{
    $yesterday_top = "SELECT
                        DATE_FORMAT(wp_yoc_transactions.date, '%Y-%m-%d') AS transaction_date,
                        wp_yoc_appeal.name AS appeal_name,
                        wp_yoc_appeal.image AS appeal_image,
                        SUM(wp_yoc_transaction_details.amount) AS total_donation_amount,
                        COUNT(wp_yoc_transactions.id) AS donation_count
                    FROM
                        wp_yoc_transactions
                    INNER JOIN
                        wp_yoc_transaction_details ON wp_yoc_transactions.id = wp_yoc_transaction_details.TID
                    INNER JOIN
                        wp_yoc_appeal ON wp_yoc_transaction_details.appeal_id = wp_yoc_appeal.id
                    WHERE
                        wp_yoc_transactions.status = 'Completed'
                        AND DATE(wp_yoc_transactions.date) = CURDATE() - INTERVAL 1 DAY
                    GROUP BY
                        transaction_date, 
                        wp_yoc_appeal.name,
                        wp_yoc_appeal.image
                    ORDER BY
                        total_donation_amount DESC
                    LIMIT 10";

            $stmt = $conn->prepare($yesterday_top);
            $stmt->execute();
            return $stmt; 
}
function get_all_seasons($conn) {
    $sql = "SELECT * FROM `wp_yoc_season`";
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}

function get_season_with_id($conn, $cat_id) {
    $sql = "SELECT * FROM `wp_yoc_season` WHERE `id` = :cat_id ORDER BY `id` ASC";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':cat_id', $cat_id, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    return $rows;
}
function get_all_posts($conn){
    try {
        $sql = "SELECT ID AS id, post_title AS title 
                FROM wp_posts where post_type='appeals'  or   post_type='appeals' or post_type='programs'  
                ORDER BY ID DESC";

        $stmt = $conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        return [];
    }
}


?>
