# Phase 3.3: Remaining Old-API Migrations - Codex Execution Prompt

## Objective
Migrate remaining unmigrated endpoints from `old-apis/` directory to Laravel 12 API following established patterns (Service Layer + Repository Pattern + FormRequest validation).

---

## Priority Files to Migrate

Based on the old-apis directory analysis, here are the remaining files that need migration:

### Already Migrated ✅
- ✅ `auth.php` → AuthController (Phase 1)
- ✅ `analytics.php` → AnalyticsController (Phase 2)
- ✅ `donor.php`, `donors.php`, `donor-details.php`, `donor-donations.php`, `donor-subscriptions.php` → DonorController (Phase 2)
- ✅ `schedules.php`, `schedules-export.php` → ScheduleController (Phase 2)
- ✅ `amounts.php` → AmountController (Phase 2)
- ✅ `featured-amounts.php` → FeaturedAmountController (Phase 2)
- ✅ `funds.php`, `funds-list.php` → FundController (Phase 2)
- ✅ `fund-amount-associations.php` → FundAmountAssociationController (Phase 2)
- ✅ `categories.php` → CategoryController (Phase 2)
- ✅ `countries.php`, `countries-list.php` → CountryController (Phase 2)
- ✅ `campaign-report.php`, `causes-report.php`, `fund-report.php`, `monthly-report.php` → ReportsController (Phase 2)
- ✅ `getReportData.php` → DonationExportController (Phase 2)
- ✅ `day-time.php` → DayTimeController (Phase 2)
- ✅ `donor-segmentation.php` → DonorSegmentationController (Phase 2)
- ✅ `frequencies.php` → FrequenciesController (Phase 2)
- ✅ `payment-methods.php` → PaymentMethodsController (Phase 2)
- ✅ `recurring-plans.php` → RecurringPlansController (Phase 2)
- ✅ `recurring-revenue.php` → RecurringRevenueController (Phase 2)
- ✅ `retention.php` → RetentionController (Phase 2)
- ✅ `user.php`, `add_user.php` → UserManagementController (Phase 2)
- ✅ `permission.php` → PermissionController (Phase 2)
- ✅ `manual_transaction.php` → ManualTransactionController (Phase 3.2)

### To Be Migrated 🔄

1. **component.php** (21KB - MEDIUM PRIORITY)
   - Component/widget management system
   - ~500 lines of code with database operations

2. **configuration.php** (6.7KB - MEDIUM PRIORITY)
   - System configuration management
   - Settings CRUD operations

3. **security.php** (1.5KB - LOW PRIORITY - Phase 4)
   - Activity logging function
   - Should become middleware in Phase 4

4. **verification.php** (3.7KB - LOW PRIORITY)
   - Email/phone verification system
   - Donor verification features

5. **crm.php** (2.7KB - LOW PRIORITY)
   - CRM integration endpoints
   - External system integration

6. **dm.php** (2.5KB - LOW PRIORITY)
   - Digital marketing tracking
   - Campaign tracking

7. **export_optimized.php** (10KB - LOW PRIORITY)
   - Optimized export functionality
   - May merge into existing DonationExportController

8. **get_season_dates.php** (1.2KB - LOW PRIORITY)
   - Season date calculations
   - Ramadan/special dates

9. **Other files** (LOW PRIORITY - Skip for now):
   - `functions.php`, `logics.php`, `_bootstrap.php` - Legacy helper files
   - `test*.php` - Test files
   - `*.sql` - Database dumps
   - `yoc.js` - Frontend JavaScript (109KB)

---

## PRIORITY 1: Component Management System

### File to Migrate: `component.php` (21KB, ~500 lines)

This file handles a component/widget system. Let me read it first to analyze the actions:

**Expected Actions** (to be analyzed from the file):
- List components
- Create component
- Update component
- Delete component
- Bulk operations
- Component configuration

### Implementation Plan:

#### 1. Create ComponentController

**File**: `app/Http/Controllers/Api/ComponentController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Component\StoreComponentRequest;
use App\Http\Requests\Component\UpdateComponentRequest;
use App\Http\Requests\Component\BulkUpdateComponentRequest;
use App\Services\ComponentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComponentController extends Controller
{
    public function __construct(private readonly ComponentService $componentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $params = $request->query();
        $result = $this->componentService->getAllComponents($params);
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }

    public function store(StoreComponentRequest $request): JsonResponse
    {
        $result = $this->componentService->createComponent($request->validated());
        $status = $result['success'] ? 201 : 400;

        return response()->json($result, $status);
    }

    public function show(int $id): JsonResponse
    {
        $result = $this->componentService->getComponentById($id);
        $status = $result['success'] ? 200 : 404;

        return response()->json($result, $status);
    }

    public function update(UpdateComponentRequest $request, int $id): JsonResponse
    {
        $result = $this->componentService->updateComponent($id, $request->validated());
        $status = $result['success'] ? 200 : 404;

        return response()->json($result, $status);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->componentService->deleteComponent($id);
        $status = $result['success'] ? 200 : 404;

        return response()->json($result, $status);
    }

    public function bulkUpdate(BulkUpdateComponentRequest $request): JsonResponse
    {
        $result = $this->componentService->bulkUpdateComponents($request->validated());
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }
}
```

#### 2. Create ComponentService

**File**: `app/Services/ComponentService.php`

```php
<?php

namespace App\Services;

use App\Repositories\Contracts\ComponentRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ComponentService
{
    public function __construct(
        private readonly ComponentRepositoryInterface $componentRepository
    ) {
    }

    public function getAllComponents(array $params = []): array
    {
        try {
            $components = $this->componentRepository->getAll($params);

            return [
                'success' => true,
                'data' => $components,
                'count' => count($components),
                'message' => 'Components retrieved successfully',
            ];
        } catch (Exception $e) {
            Log::error('Failed to retrieve components', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to retrieve components',
            ];
        }
    }

    public function getComponentById(int $id): array
    {
        try {
            $component = $this->componentRepository->findById($id);

            if (!$component) {
                return [
                    'success' => false,
                    'error' => 'not_found',
                    'message' => 'Component not found',
                ];
            }

            return [
                'success' => true,
                'data' => $component,
                'message' => 'Component retrieved successfully',
            ];
        } catch (Exception $e) {
            Log::error('Failed to retrieve component', ['id' => $id, 'error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to retrieve component',
            ];
        }
    }

    public function createComponent(array $data): array
    {
        try {
            DB::beginTransaction();

            $component = $this->componentRepository->create($data);

            DB::commit();

            return [
                'success' => true,
                'data' => $component,
                'message' => 'Component created successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create component', ['error' => $e->getMessage(), 'data' => $data]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to create component',
            ];
        }
    }

    public function updateComponent(int $id, array $data): array
    {
        try {
            DB::beginTransaction();

            $component = $this->componentRepository->findById($id);

            if (!$component) {
                DB::rollBack();
                return [
                    'success' => false,
                    'error' => 'not_found',
                    'message' => 'Component not found',
                ];
            }

            $updated = $this->componentRepository->update($id, $data);

            DB::commit();

            return [
                'success' => true,
                'data' => $updated,
                'message' => 'Component updated successfully',
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update component', ['id' => $id, 'error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to update component',
            ];
        }
    }

    public function deleteComponent(int $id): array
    {
        try {
            $component = $this->componentRepository->findById($id);

            if (!$component) {
                return [
                    'success' => false,
                    'error' => 'not_found',
                    'message' => 'Component not found',
                ];
            }

            $this->componentRepository->delete($id);

            return [
                'success' => true,
                'message' => 'Component deleted successfully',
            ];
        } catch (Exception $e) {
            Log::error('Failed to delete component', ['id' => $id, 'error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to delete component',
            ];
        }
    }

    public function bulkUpdateComponents(array $data): array
    {
        try {
            DB::beginTransaction();

            $updated = 0;
            foreach ($data['components'] as $componentData) {
                if (isset($componentData['id'])) {
                    $this->componentRepository->update($componentData['id'], $componentData);
                    $updated++;
                }
            }

            DB::commit();

            return [
                'success' => true,
                'message' => "{$updated} components updated successfully",
                'count' => $updated,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk update components', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'error' => 'server_error',
                'message' => 'Failed to bulk update components',
            ];
        }
    }
}
```

#### 3. Create ComponentRepository

**File**: `app/Repositories/Contracts/ComponentRepositoryInterface.php`

```php
<?php

namespace App\Repositories\Contracts;

interface ComponentRepositoryInterface
{
    public function getAll(array $params = []): array;
    public function findById(int $id): ?array;
    public function create(array $data): array;
    public function update(int $id, array $data): array;
    public function delete(int $id): bool;
}
```

**File**: `app/Repositories/ComponentRepository.php`

```php
<?php

namespace App\Repositories;

use App\Repositories\Contracts\ComponentRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Support\Facades\DB;

class ComponentRepository implements ComponentRepositoryInterface
{
    private string $table;

    public function __construct()
    {
        $this->table = TableResolver::prefixed('component');
    }

    public function getAll(array $params = []): array
    {
        $query = DB::table($this->table);

        // Add filters if needed
        if (!empty($params['status'])) {
            $query->where('disable', $params['status'] === 'disabled' ? 1 : 0);
        }

        return $query->orderBy('sort', 'asc')
            ->get()
            ->map(fn($item) => (array)$item)
            ->toArray();
    }

    public function findById(int $id): ?array
    {
        $component = DB::table($this->table)->where('id', $id)->first();

        return $component ? (array)$component : null;
    }

    public function create(array $data): array
    {
        $id = DB::table($this->table)->insertGetId($data);

        return $this->findById($id);
    }

    public function update(int $id, array $data): array
    {
        DB::table($this->table)->where('id', $id)->update($data);

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        return DB::table($this->table)->where('id', $id)->delete() > 0;
    }
}
```

#### 4. Create FormRequests

**File**: `app/Http/Requests/Component/StoreComponentRequest.php`

```php
<?php

namespace App\Http\Requests\Component;

use Illuminate\Foundation\Http\FormRequest;

class StoreComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'config' => 'nullable|string',
            'sort' => 'nullable|integer|min:0',
            'disable' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Component name is required',
        ];
    }
}
```

**File**: `app/Http/Requests/Component/UpdateComponentRequest.php`

```php
<?php

namespace App\Http\Requests\Component;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:100',
            'config' => 'nullable|string',
            'sort' => 'nullable|integer|min:0',
            'disable' => 'nullable|boolean',
        ];
    }
}
```

**File**: `app/Http/Requests/Component/BulkUpdateComponentRequest.php`

```php
<?php

namespace App\Http\Requests\Component;

use Illuminate\Foundation\Http\FormRequest;

class BulkUpdateComponentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'components' => 'required|array|min:1',
            'components.*.id' => 'required|integer',
            'components.*.name' => 'nullable|string|max:255',
            'components.*.sort' => 'nullable|integer|min:0',
            'components.*.disable' => 'nullable|boolean',
        ];
    }
}
```

#### 5. Register in ServiceProvider

**Add to**: `app/Providers/RepositoryServiceProvider.php`

In the `$bindings` array:
```php
ComponentRepositoryInterface::class => ComponentRepository::class,
```

Add the imports at the top:
```php
use App\Repositories\Contracts\ComponentRepositoryInterface;
use App\Repositories\ComponentRepository;
```

#### 6. Add Routes

**Add to**: `routes/api.php`

Inside the `auth:sanctum` middleware group:
```php
Route::get('components', [ComponentController::class, 'index']);
Route::post('components', [ComponentController::class, 'store']);
Route::get('components/{id}', [ComponentController::class, 'show']);
Route::put('components/{id}', [ComponentController::class, 'update']);
Route::delete('components/{id}', [ComponentController::class, 'destroy']);
Route::post('components/bulk', [ComponentController::class, 'bulkUpdate']);
```

Add the import:
```php
use App\Http\Controllers\Api\ComponentController;
```

---

## PRIORITY 2: Configuration Management

Follow the same pattern as ComponentController for:

**File**: `configuration.php` → **ConfigurationController**

Similar structure:
- ConfigurationController
- ConfigurationService
- ConfigurationRepository + Interface
- StoreConfigurationRequest, UpdateConfigurationRequest
- Routes: GET/POST/PUT/DELETE `/api/v1/configurations`

---

## Implementation Checklist

### Component System:
- [ ] Create ComponentController
- [ ] Create ComponentService
- [ ] Create ComponentRepository + Interface
- [ ] Create 3 FormRequest classes (Store, Update, BulkUpdate)
- [ ] Register repository binding in ServiceProvider
- [ ] Add routes to api.php
- [ ] Test endpoints with curl

### Configuration System:
- [ ] Create ConfigurationController
- [ ] Create ConfigurationService
- [ ] Create ConfigurationRepository + Interface
- [ ] Create 2 FormRequest classes (Store, Update)
- [ ] Register repository binding in ServiceProvider
- [ ] Add routes to api.php
- [ ] Test endpoints with curl

---

## Testing Commands

### Test Component Endpoints:
```bash
TOKEN=$(cat /tmp/tok.txt)

# List components
curl -X GET "http://127.0.0.1:8010/api/v1/components" \
  -H "Authorization: Bearer $TOKEN"

# Create component
curl -X POST "http://127.0.0.1:8010/api/v1/components" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Component",
    "type": "widget",
    "sort": 1
  }'

# Update component
curl -X PUT "http://127.0.0.1:8010/api/v1/components/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Component",
    "sort": 2
  }'
```

---

## Notes

- **Component.php analysis needed**: Before implementing, analyze the actual `component.php` file to understand the exact table structure and business logic
- **Database tables**: Ensure the tables exist (wp_yoc_component or pw_component)
- **Skip low-priority files**: Focus on Component and Configuration first
- **Phase 4 items**: Security.php (activity logging) should wait for Phase 4 middleware implementation
