<?php
if (session_id() === "") session_start();
include('config.php');
include('functions.php');
include('security.php');
ini_set('display_errors', '1'); 
ini_set('display_startup_errors', '1'); 
error_reporting(E_ALL);

try {
    if (isset($_POST['action'])) {
        if ($_POST['action'] == "add_appeal") {
            $stmt = $conn->prepare("INSERT INTO `wp_yoc_appeal`(`name`, `description`, `image`, `ishome_v`, `country`, `cause`, `category`, `goal`, `sort`, `isfooter`, `isdonate_v`, `isother_v`, `isquantity_v`, `isdropdown_v`, `isrecurring_v`, `recurring_interval`, `isassociate`, `type`) 
            VALUES (:name, :description, :image, :ishome_v, :country, :cause, :category, :goal, :sort, :isfooter, :isdonate_v, :isother_v, :isquantity_v, :isdropdown_v, :isrecurring_v, :recurring_interval, :isassociate, :type)");

            $stmt->execute([
                 ':name' => stripslashes($_POST['appeal_name']),
                ':description' => $_POST['appeal_description'],
                ':image' => $_POST['appeal_image'],
                ':ishome_v' => $_POST['appeal_home'],
                ':country' => $_POST['appeal_country'],
                ':cause' => $_POST['appeal_cause'],
                ':category' => $_POST['appeal_catagory'],
                ':goal' => $_POST['appeal_goal'],
                ':sort' => $_POST['appeal_sort'],
                ':isfooter' => $_POST['appeal_footer'],
                ':isdonate_v' => $_POST['appeal_donate'],
                ':isother_v' => $_POST['appeal_isother'],
                ':isquantity_v' => $_POST['appeal_isquantity'],
                ':isdropdown_v' => $_POST['appeal_isdropdown'],
                ':isrecurring_v' => $_POST['appeal_isrecurring'],
                ':recurring_interval' => implode(",", $_POST['recurring_interval']),
                ':isassociate' => $_POST['appeal_isassociate'],
                ':type' => $_POST['appeal_type']
            ]);

            $app_id = $conn->lastInsertId();
            security($_POST['appeal_name'] . " Appeal Inserted", $conn);
            $_SESSION['new_appeal_id'] = $app_id;
            echo "Inserted";
        }

        if ($_POST['action'] == "update_appeal") {
            $stmt = $conn->prepare("UPDATE `wp_yoc_appeal` SET `name`=:name, `description`=:description, `image`=:image, `ishome_v`=:ishome_v, `country`=:country, `cause`=:cause, `category`=:category, `goal`=:goal, `sort`=:sort, `isfooter`=:isfooter, `isdonate_v`=:isdonate_v, `isother_v`=:isother_v, `isquantity_v`=:isquantity_v, `isdropdown_v`=:isdropdown_v, `isrecurring_v`=:isrecurring_v, `recurring_interval`=:recurring_interval, `isassociate`=:isassociate, `type`=:type, `disable`=:disable WHERE id=:id");

            $stmt->execute([
                ':name' => stripslashes($_POST['appeal_name']),
                ':description' => $_POST['appeal_description'],
                ':image' => $_POST['appeal_image'],
                ':ishome_v' => $_POST['appeal_home'],
                ':country' => $_POST['appeal_country'],
                ':cause' => $_POST['appeal_cause'],
                ':category' => $_POST['appeal_catagory'],
                ':goal' => $_POST['appeal_goal'],
                ':sort' => $_POST['appeal_sort'],
                ':isfooter' => $_POST['appeal_footer'],
                ':isdonate_v' => $_POST['appeal_donate'],
                ':isother_v' => $_POST['appeal_isother'],
                ':isquantity_v' => $_POST['appeal_isquantity'],
                ':isdropdown_v' => $_POST['appeal_isdropdown'],
                ':isrecurring_v' => $_POST['appeal_isrecurring'],
                ':recurring_interval' => implode(",", $_POST['recurring_interval']),
                ':isassociate' => $_POST['appeal_isassociate'],
                ':type' => $_POST['appeal_type'],
                ':disable' => $_POST['appeal_status'],
                ':id' => $_SESSION['new_appeal_id']
            ]);

            security($_POST['appeal_name'] . " Appeal Updated", $conn);
            echo "Updated";
        }

        if ($_POST['action'] == "update_amount") {
            $amount_count = $_POST['amounts_count'];

            if ($amount_count > 0) {
                for ($i = 1; $i <= $amount_count; $i++) {
                    if (isset($_POST['amount_id_' . $i])) {
                        $stmt = $conn->prepare("UPDATE `wp_yoc_amount` SET `name`=:name, `amount`=:amount, `donationtype`=:donationtype, `sort`=:sort,`featured`=:featured, `disable`=:disable WHERE id=:id");
                        $stmt->execute([
                            ':name' => $_POST['amount_name_' . $i],
                            ':amount' => $_POST['amount_amount_' . $i],
                            ':donationtype' => $_POST['amount_donation_type_' . $i],
                            ':sort' => $_POST['amount_sort_' . $i],
                            ':featured' => $_POST['amount_featured_' . $i],
                            ':disable' => $_POST['amount_enable_' . $i],
                            ':id' => $_POST['amount_id_' . $i]
                        ]);
                   
                        security("Amount Updated", $conn);
                        echo "Updated";
                    } else if (isset($_POST['amount_name_' . $i])) {
                        $stmt = $conn->prepare("INSERT INTO `wp_yoc_amount`(`appeal_id`, `name`, `amount`, `donationtype`, `sort`, `featured`,`disable`) VALUES (:appeal_id, :name, :amount, :donationtype, :sort,:featured, :disable)");
                        $stmt->execute([
                            ':appeal_id' => $_SESSION['new_appeal_id'],
                            ':name' => $_POST['amount_name_' . $i],
                            ':amount' => $_POST['amount_amount_' . $i],
                            ':donationtype' => $_POST['amount_donation_type_' . $i],
                            ':sort' => $_POST['amount_sort_' . $i],
                            ':featured' => $_POST['amount_featured_' . $i],
                            ':disable' => $_POST['amount_enable_' . $i]
                        ]);
                        security("Amount Inserted", $conn);
                        echo "Inserted";
                    }
                }
            }
        }

        if ($_POST['action'] == "update_fund") {
            $fund_count = $_POST['funds_count'];

            if ($fund_count > 0) {
                for ($i = 1; $i <= $fund_count; $i++) {
                    if (isset($_POST['fund_id_' . $i])) {
                        $stmt = $conn->prepare("UPDATE `wp_yoc_fundlist` SET `name`=:name, `sort`=:sort, `disable`=:disable WHERE id=:id");
                        $stmt->execute([
                            ':name' => $_POST['fund_name_' . $i],
                            ':sort' => $_POST['fund_sort_' . $i],
                            ':disable' => $_POST['fund_enable_' . $i],
                            ':id' => $_POST['fund_id_' . $i]
                        ]);
                        security("Fund Updated", $conn);
                        echo "Updated";
                    } else if (isset($_POST['fund_name_' . $i])) {
                        $stmt = $conn->prepare("INSERT INTO `wp_yoc_fundlist`(`appeal_id`, `name`, `sort`, `disable`) VALUES (:appeal_id, :name, :sort, :disable)");
                        $stmt->execute([
                            ':appeal_id' => $_SESSION['new_appeal_id'],
                            ':name' => $_POST['fund_name_' . $i],
                            ':sort' => $_POST['fund_sort_' . $i],
                            ':disable' => $_POST['fund_enable_' . $i]
                        ]);
                        security("Fund Inserted", $conn);
                        echo "Inserted";
                    }
                }
            }
        }

        if ($_POST['action'] == "add_catagory") {
            $stmt = $conn->prepare("INSERT INTO `wp_yoc_category`(`name`, `image`) VALUES(:name, '')");
            $stmt->execute([
                ':name' => $_POST['catagory_name']
            ]);
            echo "Inserted";
        }

        if ($_POST['action'] == "update_catagory") {
            $stmt = $conn->prepare("UPDATE `wp_yoc_category` SET `name`=:name WHERE id=:id");
            $stmt->execute([
                ':name' => $_POST['catagory_name'],
                ':id' => $_POST['catagory_id']
            ]);
            echo "Updated";
        }

        if ($_POST['action'] == "add_country") {
            $stmt = $conn->prepare("INSERT INTO `wp_yoc_country`(`name`) VALUES(:name)");
            $stmt->execute([
                ':name' => $_POST['country_name']
            ]);
            echo "Inserted";
        }

        if ($_POST['action'] == "update_country") {
            $stmt = $conn->prepare("UPDATE `wp_yoc_country` SET `name`=:name WHERE id=:id");
            $stmt->execute([
                ':name' => $_POST['country_name'],
                ':id' => $_POST['country_id']
            ]);
            echo "Updated";
        }

        if ($_POST['action'] == "update_sort") {
            $stmt = $conn->prepare("UPDATE `wp_yoc_appeal` SET `sort`=:sort WHERE `id`=:id");
            $stmt->execute([
                ':sort' => $_POST['value'],
                ':id' => $_POST['id']
            ]);
            echo "updated";
        }

        if ($_POST['action'] == "update_amount_to_fund") {
            $fund_ids = $_POST['fund_ids'];
            $reversedArray = array_reverse($fund_ids, true);

            foreach ($reversedArray as $key => $value) {
                $ids = explode('_', $value);
                $request_id = $ids[1];
                if ($ids[0] == "amount") {
                    $stmt = $conn->prepare("DELETE FROM `wp_yoc_fund_amount_combo` WHERE `amountid`=:amountid");
                    $stmt->execute([':amountid' => $request_id]);
                } else if ($ids[0] == "fund") {
                    $stmt = $conn->prepare("DELETE FROM `wp_yoc_fund_amount_combo` WHERE `fundlistid`=:fundlistid");
                    $stmt->execute([':fundlistid' => $request_id]);
                } else {
                    $stmt = $conn->prepare("DELETE FROM `wp_yoc_fund_amount_combo` WHERE `amountid`=:amountid AND `fundlistid`=:fundlistid");
                    $stmt->execute([':amountid' => $ids[1], ':fundlistid' => $ids[2]]);
                }
            }

            foreach ($fund_ids as $id) {
                $ids = explode('_', $id);
                if ($ids[0] == "amount" || $ids[0] == "fund") {
                    continue;
                }

                $stmt = $conn->prepare("INSERT INTO `wp_yoc_fund_amount_combo` (`appealid`, `fundlistid`, `amountid`) VALUES (:appealid, :fundlistid, :amountid)");
                $stmt->execute([
                    ':appealid' => $ids[0],
                    ':fundlistid' => $ids[2],
                    ':amountid' => $ids[1]
                ]);
                echo "updated";
            }
        }
    
            if($_POST['action']=='single-cause') {
        $cause_id = $_POST['cause_id'];
        $causes   = get_appeal_data($conn,$cause_id);
        $amounts = get_amounts($conn,$cause_id);
        $funds   = get_funds($conn,$cause_id);
        
        foreach($causes as $cause){
            if(is_array($amounts) && count($amounts)>0) {
                echo '<div>
                        <label>Amount</label>
                        <select class="form-control" id="backend_select_amount_'.$cause['id'].'">';
                        $fixed_donation="";
                        foreach($amounts as $amount) {
                            if($amount['donationtype']!="" || $amount['SINGLE']){
                                $fixed_donation.='<input type="hidden" value="'.strtolower($amount['donationtype']).'" id="backend_fixed_donation_'.$amount['id'].'">';
                            }
                            echo '<option key="'.$amount['id'].'" value="'.$amount['amount'].'">$'.$amount['amount'] .'- '. $amount['name'].'</option>';
                        }
                    echo
                    '</select>
                    '.$fixed_donation.'
                </div></br>';
            }
            $display_fund="display:block;";
            if($cause['isassociate'] != '0') {
                $display_fund="display:none;";
                foreach($amounts as $amount) {
                    $ass_fundlists = get_associate_amount_fundlist($conn,$amount['id']);
                    
                    if(is_array($ass_fundlists) && count($ass_fundlists)>0) {
                    echo '<div>
                            <label>Asscoiate Fundlist</label>
                            <select class="form-control" id="backend_fundlist_'.$cause['id'].'_'.$amount['id'].'">';
                            
                            foreach($ass_fundlists as $ass_fund) {
                                echo '<option value="'.$ass_fund['id'].'">'.$ass_fund['name'].'</option>';
                            }
                        echo '</select>
                    </div>';
                    }
                }
            }
            
            if($cause['isother_v'] != '0') {
                if(is_array($funds) && count($funds)>0) {
                    echo '<div style="'.$display_fund.'">
                            <label>Fundlist</label>
                            <select class="form-control" id="backend_fundlist_'.$cause['id'].'">';
                            foreach($funds as $fund) {
                                echo '<option value="'.$fund['id'].'">'.$fund['name'].'</option>';
                            }
                        echo '</select>
                    </div></br>';
                }
            }
            
            if($cause['isrecurring_v']=='1'){
                $recuring_string=$cause['recurring_interval'];
                $recurring_interval = explode (",", $recuring_string);
                
                if(strtolower($cause['type']) !='fixed'){
                    echo '<label>Donation Type </label> <select class="form-control" id="backend_isrecurring_'.$cause['id'].'" >';
                    
                    foreach($recurring_interval as $donation){
                        echo '<option value="'.strtoupper($donation).'">'.strtoupper($donation).'</option>';
                    }
                    
                    echo '</select></br>';
                }
            }
            
            
            if($cause['isother_v'] != '0') {
                echo '<label>Custom Amount </label><input type="number" class="form-control backend_custom_amount" key="backend_'.$cause['id'].'" name="backend_custom_amount_'.$cause['id'].'" id="backend_custom_amount_'.$cause['id'].'" placeholder="Enter Custom Amount" min="5"></br>';
            }
            
            echo '<label>Quantity </label><input type="number" class="form-control" id="backend_quantity_'.$cause['id'].'" value="1" /></br>';
            
            
            $cardfee_checked="";
            if(isset($_SESSION['cccharges'])){
                if($_SESSION['cccharges']){
                    $cardfee_checked='checked="checkd"';
                }
            }
            echo '<input name="cbccfees" type="checkbox" id="cbccfees" '.$cardfee_checked.' onclick="toggleCardFee(this)"><label for="cbccfees">Add 3% to my donation to cover credit card fees.</label></br>';
            
            echo '
            <input type="hidden" id="backend_appealimage_'.$cause['id'].'" value="'.$cause['id'].'" />
            <input type="hidden" id="backend_appealname_'.$cause['id'].'" value="'.$cause['name'].'" />
            
            <div class="row">
                <div class="col-md-12">
                    <button class="btn btn-primary col-md-12 addtocart" style="border-radius: 4px;" id="backend_'.$cause['id'].'">DONATE NOW</button>
                </div>
            </div>';
            
        }
    }
    
    if($_POST['action']=='donor-cause') {
        $cause_id = $_POST['cause_id'];
        $causes   = get_appeal_data($conn,$cause_id);
        $amounts = get_amounts($conn,$cause_id);
        $funds   = get_funds($conn,$cause_id);
        
        foreach($causes as $cause){
            if(is_array($amounts) && count($amounts)>0) {
                echo '<div>
                        <label>Amount</label>
                        <select class="form-control" id="backend_select_amount_'.$cause['id'].'">';
                        $fixed_donation="";
                        foreach($amounts as $amount) {
                            if($amount['donationtype']!="" || $amount['SINGLE']){
                                $fixed_donation.='<input type="hidden" value="'.strtolower($amount['donationtype']).'" id="backend_fixed_donation_'.$amount['id'].'">';
                            }
                            echo '<option key="'.$amount['id'].'" value="'.$amount['amount'].'">$'.$amount['amount'] .'- '. $amount['name'].'</option>';
                        }
                    echo
                    '</select>
                    '.$fixed_donation.'
                </div></br>';
            }
            $display_fund="display:block;";
            if($cause['isassociate'] != '0') {
                $display_fund="display:none;";
                foreach($amounts as $amount) {
                    $ass_fundlists = get_associate_amount_fundlist($conn,$amount['id']);
                    
                    if(is_array($ass_fundlists) && count($ass_fundlists)>0) {
                    echo '<div>
                            <label>Asscoiate Fundlist</label>
                            <select class="form-control" id="backend_fundlist_'.$cause['id'].'_'.$amount['id'].'">';
                            
                            foreach($ass_fundlists as $ass_fund) {
                                echo '<option value="'.$ass_fund['id'].'">'.$ass_fund['name'].'</option>';
                            }
                        echo '</select>
                    </div>';
                    }
                }
            }
            
            if($cause['isother_v'] != '0') {
                if(is_array($funds) && count($funds)>0) {
                    echo '<div style="'.$display_fund.'">
                            <label>Fundlist</label>
                            <select class="form-control" id="backend_fundlist_'.$cause['id'].'">';
                            foreach($funds as $fund) {
                                echo '<option value="'.$fund['id'].'">'.$fund['name'].'</option>';
                            }
                        echo '</select>
                    </div></br>';
                }
            }
            
            if($cause['isrecurring_v']=='1'){
                $recuring_string=$cause['recurring_interval'];
                $recurring_interval = explode (",", $recuring_string);
                
                if(strtolower($cause['type']) !='fixed'){
                    echo '<label>Donation Type </label> <select class="form-control" id="backend_isrecurring_'.$cause['id'].'" >';
                    
                 
                        echo '<option value=daily>DAILY</option>
                        <option value=monthly>MONTHLY</option>
                        <option value=yearly>YEARLY</option>
                        <option value=weekly>WEEKLY</option>
                        <option value=quaterly>QUARTERLY</option>';
                  
                    
                    echo '</select></br>';
                }
            }
            
            
            if($cause['isother_v'] != '0') {
                echo '<label>Custom Amount </label><input type="number" class="form-control backend_custom_amount" key="backend_'.$cause['id'].'" name="backend_custom_amount_'.$cause['id'].'" id="backend_custom_amount_'.$cause['id'].'" placeholder="Enter Custom Amount" min="5"></br>';
            }
            
            echo '<label>Quantity </label><input type="number" class="form-control" id="backend_quantity_'.$cause['id'].'" value="1" /></br>';
            
            
            $cardfee_checked="";
            if(isset($_SESSION['cccharges'])){
                if($_SESSION['cccharges']){
                    $cardfee_checked='checked="checkd"';
                }
            }
             echo '<label>Start Date </label><input type="date" class="form-control" id="backend_start_date_'.$cause['id'].'" value="'.date('Y-m-d').'" /></br>';
            echo '<input name="cbccfees" type="checkbox" id="cbccfees" '.$cardfee_checked.' onclick="toggleCardFee(this)"><label for="cbccfees">Add 3% to my donation to cover credit card fees.</label></br>';
                       
            echo '
            <input type="hidden" id="backend_appealimage_'.$cause['id'].'" value="'.$cause['id'].'" />
            <input type="hidden" id="backend_appealname_'.$cause['id'].'" value="'.$cause['name'].'" />
            
            <div class="row">
                <div class="col-md-12">
                    <button class="btn btn-primary col-md-12 addtocart" style="border-radius: 4px;" id="backend_'.$cause['id'].'">Make Subcription</button>
                </div>
            </div>';
            
        }
    }
        
        
    }
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}

function DEBUGG($request)
{
    echo '<pre>';
    print_r($request);
    echo '</pre>';
}

?>
