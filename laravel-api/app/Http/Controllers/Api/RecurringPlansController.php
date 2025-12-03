<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RecurringPlansService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringPlansController extends Controller
{
    public function __construct(private readonly RecurringPlansService $recurringPlansService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->recurringPlansService->getRecurringPlans($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
