<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analyticsService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $result = $this->analyticsService->getAnalyticsData(
                (string) $request->query('kind'),
                $request->query()
            );
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'totalAmount' => $result['totalAmount'],
                'totalCount' => $result['totalCount'],
                'trendData' => $result['trendData'],
            ],
            'meta' => $result['meta'],
            'message' => 'Analytics data retrieved',
        ]);
    }
}
