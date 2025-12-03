# Phase 3.2: Old-API Migration - Codex Execution Prompt

## Objective
Migrate remaining unmigrated endpoints from `old-apis/` directory to Laravel 12 API with Service Layer + Repository Pattern + FormRequest validation.

## Priority 1: Manual Transaction Endpoint

### 1. Create ManualTransactionController

**File**: `app/Http/Controllers/Api/ManualTransactionController.php`

Create a new controller that handles manual transaction creation (for backoffice staff to manually enter donations):

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\CreateManualTransactionRequest;
use App\Services\ManualTransactionService;
use Illuminate\Http\JsonResponse;

class ManualTransactionController extends Controller
{
    public function __construct(private readonly ManualTransactionService $manualTransactionService)
    {
    }

    public function store(CreateManualTransactionRequest $request): JsonResponse
    {
        $result = $this->manualTransactionService->createManualTransaction($request->validated());
        $status = $result['success'] ? 201 : ($result['error'] === 'validation' ? 400 : 500);

        return response()->json($result, $status);
    }
}
```

### 2. Create ManualTransactionService

**File**: `app/Services/ManualTransactionService.php`

```php
<?php

namespace App\Services\ManualTransactionService;

use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Repositories\Contracts\TransactionRepositoryInterface;
use App\Repositories\Contracts\TransactionDetailRepositoryInterface;
use App\Repositories\Contracts\ScheduleRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ManualTransactionService
{
    public function __construct(
        private readonly DonorRepositoryInterface $donorRepository,
        private readonly TransactionRepositoryInterface $transactionRepository,
        private readonly TransactionDetailRepositoryInterface $transactionDetailRepository,
        private readonly ScheduleRepositoryInterface $scheduleRepository
    ) {
    }

    public function createManualTransaction(array $data): array
    {
        try {
            DB::beginTransaction();

            // 1. Get or create donor
            $donor = $this->getOrCreateDonor($data);
            if (!$donor) {
                throw new Exception('Failed to get or create donor');
            }

            // 2. Calculate total amount from line items
            $totalAmount = 0;
            $transactionDetails = [];

            foreach ($data['items'] as $item) {
                $itemTotal = $item['amount'] * $item['quantity'];
                $totalAmount += $itemTotal;
                $transactionDetails[] = $item;
            }

            // 3. Create transaction
            $transaction = $this->createTransaction($donor['id'], $data, $totalAmount);

            // 4. Create transaction details
            foreach ($transactionDetails as $detail) {
                $tdId = $this->createTransactionDetail($transaction['id'], $detail, $data['date']);

                // 5. Create schedule if recurring
                if ($detail['freq'] !== 'onetime') {
                    $this->createSchedule(
                        $donor['id'],
                        $transaction['id'],
                        $tdId,
                        $transaction['tr_no'],
                        $transaction['order_id'],
                        $detail,
                        $data['date']
                    );
                }
            }

            DB::commit();

            return [
                'success' => true,
                'message' => 'Manual transaction created successfully',
                'data' => [
                    'transaction_id' => $transaction['id'],
                    'order_id' => $transaction['order_id'],
                    'tr_no' => $transaction['tr_no'],
                ],
            ];

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Manual transaction creation failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to create manual transaction: ' . $e->getMessage(),
            ];
        }
    }

    private function getOrCreateDonor(array $data): ?array
    {
        // Check if donor exists by email and lastname
        $existing = $this->donorRepository->findByEmailAndLastname(
            $data['email'],
            $data['last_name']
        );

        if ($existing) {
            return $existing;
        }

        // Create new donor
        return $this->donorRepository->create([
            'firstname' => $data['first_name'],
            'lastname' => $data['last_name'],
            'email' => $data['email'],
            'add1' => $data['add1'] ?? '',
            'add2' => $data['add2'] ?? '',
            'city' => $data['city'] ?? '',
            'country' => $data['country'] ?? '',
            'state' => $data['state'] ?? '',
            'postcode' => $data['zip'] ?? '',
            'phone' => $data['phone'] ?? '',
            'fourdigit' => $data['card_digits'] ?? '',
            'stripe_id' => $data['customer_id'] ?? '',
            'Date_Added' => $data['date'],
        ]);
    }

    private function createTransaction(int $donorId, array $data, float $totalAmount): array
    {
        $invoiceId = uniqid('acc-');
        $orderId = date('mdYHis', time()) . rand(0, 1000);

        $paymentIntent = $data['payment_intent'] ?? $data['charge_id'] ?? '';
        $chargeId = !empty($data['payment_intent']) ? ($data['charge_id'] ?? '') : '';

        $transaction = $this->transactionRepository->create([
            'DID' => $donorId,
            'TID' => $invoiceId,
            'order_id' => $orderId,
            'paya_reference' => $paymentIntent,
            'charge_id' => $chargeId,
            'paymenttype' => $data['payment_type'] ?? 'manual',
            'charge_amount' => $totalAmount,
            'totalamount' => $totalAmount,
            'refund' => 'success',
            'reason' => 'approved',
            'status' => 'completed',
            'date' => $data['date'],
        ]);

        return [
            'id' => $transaction['id'],
            'tr_no' => $invoiceId,
            'order_id' => $orderId,
        ];
    }

    private function createTransactionDetail(int $transactionId, array $detail, string $date): int
    {
        $freqN = match($detail['freq']) {
            'monthly' => 1,
            'yearly' => 2,
            default => 0,
        };

        $interval = match($freqN) {
            1 => 60,   // monthly: 60 payments
            2 => 1825, // yearly: ~5 years in days
            default => 0,
        };

        $transactionDetail = $this->transactionDetailRepository->create([
            'TID' => $transactionId,
            'appeal_id' => $detail['appeal_id'],
            'amount_id' => $detail['amount_id'] ?? 0,
            'fundlist_id' => $detail['fundlist_id'] ?? 0,
            'amount' => $detail['amount'],
            'quantity' => $detail['quantity'],
            'freq' => $freqN,
            'startdate' => $date,
            'totalcount' => $interval,
            'currency' => 'USD',
        ]);

        return $transactionDetail['id'];
    }

    private function createSchedule(
        int $donorId,
        int $transactionId,
        int $tdId,
        string $trNo,
        string $orderId,
        array $detail,
        string $date
    ): void {
        $isMonthly = $detail['freq'] === 'monthly';
        $interval = $isMonthly ? 1 : 12;
        $totalCount = $isMonthly ? 60 : 5;
        $remainingCount = $totalCount - 1;

        $nextRunDate = $isMonthly
            ? date('Y-m-d', strtotime('+1 month', strtotime($date)))
            : date('Y-m-d', strtotime('+12 months', strtotime($date)));

        $this->scheduleRepository->create([
            'did' => $donorId,
            'tid' => $transactionId,
            'tr_no' => $trNo,
            'td_id' => $tdId,
            'order_id' => $orderId,
            'plan_id' => $detail['plan_id'] ?? '',
            'sub_id' => $detail['sub_id'] ?? '',
            'amount' => $detail['amount'],
            'quantity' => $detail['quantity'],
            'frequency' => $detail['freq'],
            'startdate' => $date,
            'r_interval' => $interval,
            'totalcount' => $totalCount,
            'remainingcount' => $remainingCount,
            'nextrun_date' => $nextRunDate,
            'status' => 'active',
        ]);
    }
}
```

### 3. Create FormRequest

**File**: `app/Http/Requests/Transaction/CreateManualTransactionRequest.php`

```php
<?php

namespace App\Http\Requests\Transaction;

use Illuminate\Foundation\Http\FormRequest;

class CreateManualTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'charge_id' => 'nullable|string|max:255',
            'payment_intent' => 'nullable|string|max:255',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'add1' => 'nullable|string|max:255',
            'add2' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:50',
            'phone' => 'nullable|string|max:50',
            'customer_id' => 'nullable|string|max:255',
            'date' => 'required|date',
            'card_digits' => 'nullable|string|max:4',
            'payment_type' => 'nullable|string|max:50',
            'items' => 'required|array|min:1',
            'items.*.appeal_id' => 'required|integer',
            'items.*.amount_id' => 'nullable|integer',
            'items.*.fundlist_id' => 'nullable|integer',
            'items.*.amount' => 'required|numeric|min:0',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.freq' => 'required|in:onetime,monthly,yearly',
            'items.*.plan_id' => 'required_if:items.*.freq,monthly,yearly|nullable|string',
            'items.*.sub_id' => 'required_if:items.*.freq,monthly,yearly|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required',
            'last_name.required' => 'Last name is required',
            'email.required' => 'Email is required',
            'email.email' => 'Invalid email format',
            'date.required' => 'Transaction date is required',
            'items.required' => 'At least one transaction item is required',
            'items.*.appeal_id.required' => 'Appeal ID is required for each item',
            'items.*.amount.required' => 'Amount is required for each item',
            'items.*.quantity.required' => 'Quantity is required for each item',
            'items.*.freq.required' => 'Frequency is required for each item',
            'items.*.plan_id.required_if' => 'Plan ID is required for recurring transactions',
            'items.*.sub_id.required_if' => 'Subscription ID is required for recurring transactions',
        ];
    }
}
```

### 4. Add Repository Methods

**Add to `DonorRepositoryInterface`** (`app/Repositories/Contracts/DonorRepositoryInterface.php`):
```php
public function findByEmailAndLastname(string $email, string $lastname): ?array;
```

**Add to `DonorRepository`** (`app/Repositories/DonorRepository.php`):
```php
public function findByEmailAndLastname(string $email, string $lastname): ?array
{
    $donor = DB::table($this->table)
        ->where('email', $email)
        ->where('lastname', $lastname)
        ->first();

    return $donor ? (array)$donor : null;
}
```

### 5. Register Service in ServiceProvider

**File**: `app/Providers/RepositoryServiceProvider.php`

Add to the `register()` method:
```php
$this->app->singleton(\App\Services\ManualTransactionService::class, function ($app) {
    return new \App\Services\ManualTransactionService(
        $app->make(\App\Repositories\Contracts\DonorRepositoryInterface::class),
        $app->make(\App\Repositories\Contracts\TransactionRepositoryInterface::class),
        $app->make(\App\Repositories\Contracts\TransactionDetailRepositoryInterface::class),
        $app->make(\App\Repositories\Contracts\ScheduleRepositoryInterface::class)
    );
});
```

### 6. Add Route

**File**: `routes/api.php`

Add inside the `auth:sanctum` middleware group:
```php
Route::post('transactions/manual', [ManualTransactionController::class, 'store']);
```

---

## Priority 2: Missing Amount/Fund Actions

These actions from `cause.php` need to be migrated but may already partially exist. Review and add only what's missing:

### Update AmountController

Add bulk update/insert method if not exists (similar to existing bulkUpdate).

### Update FundController

Add bulk update/insert method if not exists (similar to existing bulkUpdate).

---

## Priority 3: Missing Endpoints (Lower Priority)

Review these files and create controllers/services as needed following the same pattern:

- `component.php` → ComponentController
- `configuration.php` → ConfigurationController
- `dm.php` → DigitalMarketingController
- `security.php` → Activity log middleware (Phase 4)
- `verification.php` → VerificationController
- `crm.php` → CrmIntegrationController
- `export_optimized.php` → Merge into DonationExportController
- `get_season_dates.php` → SeasonController

---

## Implementation Checklist

- [ ] Create ManualTransactionController
- [ ] Create ManualTransactionService
- [ ] Create CreateManualTransactionRequest
- [ ] Add findByEmailAndLastname to DonorRepository
- [ ] Register ManualTransactionService in ServiceProvider
- [ ] Add manual transaction route
- [ ] Test manual transaction endpoint

---

## Testing After Implementation

Test with curl:
```bash
TOKEN=$(cat /tmp/tok.txt)
curl -X POST "http://127.0.0.1:8010/api/v1/transactions/manual" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "1234567890",
    "date": "2024-12-03 10:00:00",
    "payment_type": "manual",
    "charge_id": "manual_123",
    "items": [
      {
        "appeal_id": 1,
        "amount_id": 1,
        "amount": 100,
        "quantity": 1,
        "freq": "onetime"
      }
    ]
  }'
```
