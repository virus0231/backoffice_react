<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FundController extends Controller
{
    public function __construct(private readonly FundService $fundService)
    {
    }

    public function list(Request $request): JsonResponse
    {
        $appealId = (int) $request->query('appeal_id', 0);
        $result = $this->fundService->getFundsByAppealId($appealId);

        $status = ($result['success'] || $result['error'] === null) ? 200 : 400;

        return response()->json($result, $status);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $appealId = (int) $request->input('appeal_id', 0);
        $result = $this->fundService->bulkUpdateFunds($appealId, $request->all());

        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
