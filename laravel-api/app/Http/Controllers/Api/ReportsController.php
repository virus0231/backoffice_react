<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function __construct(private readonly ReportsService $reportsService)
    {
    }

    public function campaigns(Request $request): JsonResponse
    {
        $result = $this->reportsService->getCampaignsReport($request->query());

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'count' => $result['count'],
            'total' => $result['total'],
            'page' => $result['page'],
            'per_page' => $result['per_page'],
            'total_amount' => $result['total_amount'],
            'message' => 'Retrieved campaign report',
        ]);
    }

    public function causes(Request $request): JsonResponse
    {
        $result = $this->reportsService->getCausesReport($request->query());

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'count' => $result['count'],
            'total_amount' => $result['total_amount'],
            'message' => 'Retrieved causes report',
        ]);
    }

    public function funds(Request $request): JsonResponse
    {
        $result = $this->reportsService->getFundsReport($request->query());

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'count' => $result['count'],
            'total_amount' => $result['total_amount'],
            'message' => 'Retrieved fund report',
        ]);
    }

    public function monthly(): JsonResponse
    {
        $result = $this->reportsService->getMonthlyReport();

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }
}
