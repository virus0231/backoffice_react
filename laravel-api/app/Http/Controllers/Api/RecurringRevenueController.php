<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecurringRevenueService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringRevenueController extends Controller
{
    public function __construct(private readonly RecurringRevenueService $recurringRevenueService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->recurringRevenueService->getRecurringRevenue($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
