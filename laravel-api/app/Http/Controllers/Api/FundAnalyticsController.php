<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FundAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FundAnalyticsController extends Controller
{
    public function __construct(private readonly FundAnalyticsService $fundAnalyticsService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->fundAnalyticsService->getFundAnalytics($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
