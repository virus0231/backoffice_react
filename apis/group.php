<?php
include('config.php');


if(isset($_POST['group'])) {
    $groupId = intval($_POST['group']);

    // Map group IDs to appeal IDs (this should be modified based on your actual data)
    $groupAppeals = [
        1 => [41,42,43,63,65], // Horn Africa Region
        2 => [44,45,46,64,66], // East Africa Region
        3 => [70,71,72]      // West Africa Region
    ];

    if(isset($groupAppeals[$groupId])) {
        $appealIds = implode(',', $groupAppeals[$groupId]);
        $query = "SELECT * FROM wp_yoc_appeal WHERE id IN ($appealIds) ORDER BY name ASC";
        $result = $conn->query($query);
        
        $appeals = [];
        while($row = $result->fetch_assoc()) {
            $name = $row['name'];
            if($name == "Per Share") {
                $name = "Cow Share";
            }
            $appeals[] = [
                'name' => $row['name'],
                'displayName' => $name
            ];
        }
        
        echo json_encode($appeals);
    } else {
        echo json_encode([]);
    }
}



?>