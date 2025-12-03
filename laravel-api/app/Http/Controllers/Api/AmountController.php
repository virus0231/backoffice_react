<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AmountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AmountController extends Controller
{
    public function __construct(private readonly AmountService $amountService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $appealId = (int) $request->query('appeal_id', 0);
        $result = $this->amountService->getAmountsByAppealId($appealId);

        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $appealId = (int) $request->input('appeal_id', 0);
        $result = $this->amountService->bulkUpdateAmounts($appealId, $request->all());

        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        if (! $request->has('status')) {
            return response()->json([
                'success' => false,
                'error' => 'status is required',
            ], 400);
        }

        $statusFlag = $request->boolean('status');
        $result = $this->amountService->toggleAmountStatus($id, $statusFlag);

        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }
}
