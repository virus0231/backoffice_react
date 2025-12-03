<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing Model Relationships ===\n\n";

try {
    // Test 1: Appeal->Category relationship (via method to avoid attribute conflict)
    echo "1. Testing Appeal->Category relationship:\n";
    $appeal = App\Models\Appeal::first();
    if ($appeal) {
        echo "   ✓ Appeal: {$appeal->name}\n";
        $category = $appeal->category()->first();
        if ($category) {
            echo "   ✓ Category (via relationship): {$category->name}\n";
        } else {
            echo "   ⚠ No category found\n";
        }
    } else {
        echo "   ⚠ No appeals found in database\n";
    }
    echo "\n";

    // Test 2: Appeal->Country relationship (via method to avoid attribute conflict)
    echo "2. Testing Appeal->Country relationship:\n";
    $appeal = App\Models\Appeal::first();
    if ($appeal) {
        echo "   ✓ Appeal: {$appeal->name}\n";
        $country = $appeal->country()->first();
        if ($country) {
            echo "   ✓ Country (via relationship): {$country->name}\n";
        } else {
            echo "   ⚠ No country found\n";
        }
    } else {
        echo "   ⚠ No appeals found\n";
    }
    echo "\n";

    // Test 3: Appeal->Amounts relationship
    echo "3. Testing Appeal->Amounts relationship:\n";
    $appeal = App\Models\Appeal::with('amounts')->first();
    if ($appeal) {
        $count = $appeal->amounts->count();
        echo "   ✓ Appeal: {$appeal->name}\n";
        echo "   ✓ Amounts count: {$count}\n";
    } else {
        echo "   ⚠ No appeals found\n";
    }
    echo "\n";

    // Test 4: Appeal->Funds relationship
    echo "4. Testing Appeal->Funds relationship:\n";
    $appeal = App\Models\Appeal::with('funds')->first();
    if ($appeal) {
        $count = $appeal->funds->count();
        echo "   ✓ Appeal: {$appeal->name}\n";
        echo "   ✓ Funds count: {$count}\n";
    } else {
        echo "   ⚠ No appeals found\n";
    }
    echo "\n";

    // Test 5: Category->Appeals relationship
    echo "5. Testing Category->Appeals relationship:\n";
    $category = App\Models\Category::with('appeals')->first();
    if ($category) {
        $count = $category->appeals->count();
        echo "   ✓ Category: {$category->name}\n";
        echo "   ✓ Appeals count: {$count}\n";
    } else {
        echo "   ⚠ No categories found\n";
    }
    echo "\n";

    // Test 6: Donor->Transactions relationship
    echo "6. Testing Donor->Transactions relationship:\n";
    $donor = App\Models\Donor::with('transactions')->first();
    if ($donor) {
        $count = $donor->transactions->count();
        echo "   ✓ Donor: {$donor->firstname} {$donor->lastname}\n";
        echo "   ✓ Transactions count: {$count}\n";
    } else {
        echo "   ⚠ No donors found\n";
    }
    echo "\n";

    // Test 7: Donor->Schedules relationship
    echo "7. Testing Donor->Schedules relationship:\n";
    $donor = App\Models\Donor::with('schedules')->first();
    if ($donor) {
        $count = $donor->schedules->count();
        echo "   ✓ Donor: {$donor->firstname} {$donor->lastname}\n";
        echo "   ✓ Schedules count: {$count}\n";
    } else {
        echo "   ⚠ No donors found\n";
    }
    echo "\n";

    // Test 8: Transaction->Donor relationship
    echo "8. Testing Transaction->Donor relationship:\n";
    $transaction = App\Models\Transaction::with('donor')->first();
    if ($transaction && $transaction->donor) {
        echo "   ✓ Transaction ID: {$transaction->id}\n";
        echo "   ✓ Donor: {$transaction->donor->firstname} {$transaction->donor->lastname}\n";
    } else {
        echo "   ⚠ No transaction with donor found\n";
    }
    echo "\n";

    // Test 9: Schedule->Donor relationship
    echo "9. Testing Schedule->Donor relationship:\n";
    $schedule = App\Models\Schedule::with('donor')->first();
    if ($schedule && $schedule->donor) {
        echo "   ✓ Schedule ID: {$schedule->id}\n";
        echo "   ✓ Donor: {$schedule->donor->firstname} {$schedule->donor->lastname}\n";
    } else {
        echo "   ⚠ No schedule with donor found\n";
    }
    echo "\n";

    // Test 10: User->Role relationship
    echo "10. Testing User->Role relationship:\n";
    $user = App\Models\User::with('role')->first();
    if ($user) {
        echo "   ✓ User: {$user->user_email}\n";
        if ($user->role) {
            echo "   ✓ Role ID: {$user->role->id}\n";
        } else {
            echo "   ⚠ No role found for user\n";
        }
    } else {
        echo "   ⚠ No users found\n";
    }
    echo "\n";

    echo "=== All Relationship Tests Complete ===\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
