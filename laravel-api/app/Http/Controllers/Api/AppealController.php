<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Appeal\BulkUpdateAppealRequest;
use App\Http\Requests\Appeal\StoreAppealRequest;
use App\Http\Requests\Appeal\UpdateAppealRequest;
use App\Services\AppealService;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AppealController extends Controller
{
    public function __construct(private readonly AppealService $appealService)
    {
    }

    public function index(): JsonResponse
    {
        $result = $this->appealService->getAllAppeals();
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }

    public function bulkUpdate(BulkUpdateAppealRequest $request): JsonResponse
    {
        $result = $this->appealService->bulkUpdateAppeals($request->validated());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }

    public function store(StoreAppealRequest $request): JsonResponse
    {
        $payload = $this->normalizePayload($request);
        if ($payload['name'] === '') {
            return response()->json(['success' => false, 'error' => 'appeal_name is required'], 400);
        }

        $table = TableResolver::prefixed('appeal');
        $id = DB::table($table)->insertGetId($payload);

        return response()->json([
            'success' => true,
            'message' => 'Appeal created',
            'data' => ['id' => $id],
        ]);
    }

    public function update(UpdateAppealRequest $request, int $id): JsonResponse
    {
        $payload = $this->normalizePayload($request);
        if ($payload['name'] === '') {
            return response()->json(['success' => false, 'error' => 'appeal_name is required'], 400);
        }

        $table = TableResolver::prefixed('appeal');
        DB::table($table)->where('id', $id)->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'Appeal updated',
            'data' => ['id' => $id],
        ]);
    }

    /**
     * Map incoming request (camelCase from React) to legacy DB columns.
     */
    private function normalizePayload(Request $request): array
    {
        $intervals = $request->input('recurringIntervals', []);
        if (!is_array($intervals)) {
            $intervals = explode(',', (string)$intervals);
        }

        return [
            'name' => trim((string)$request->input('appealName', $request->input('name', ''))),
            'description' => $request->input('description', ''),
            'image' => $request->input('image', ''),
            'ishome_v' => $request->boolean('onHome') ? 1 : 0,
            'country' => $request->input('appealCountry', ''),
            'cause' => $request->input('appealCause', ''),
            'category' => $request->input('category', ''),
            'goal' => (float)($request->input('appealGoal', 0)),
            'sort' => (int)($request->input('sort', 0)),
            'isfooter' => $request->boolean('onFooter') ? 1 : 0,
            'isdonate_v' => $request->boolean('onDonate', true) ? 1 : 0,
            'isother_v' => $request->boolean('allowCustomAmount', true) ? 1 : 0,
            'isquantity_v' => $request->boolean('allowQuantity', false) ? 1 : 0,
            'isdropdown_v' => $request->boolean('allowDropdownAmount', false) ? 1 : 0,
            'isrecurring_v' => $request->boolean('allowRecurringType', true) ? 1 : 0,
            'isassociate' => $request->boolean('allowAssociation', false) ? 1 : 0,
            'type' => $request->input('appealType', 'Suggested'),
            'recurring_interval' => implode(',', array_filter($intervals)),
            // disable: 0 = enabled, 1 = disabled
            'disable' => $request->input('status', 'enabled') === 'disabled' ? 1 : 0,
        ];
    }
}
