<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DayTimeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DayTimeController extends Controller
{
    public function __construct(private readonly DayTimeService $dayTimeService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->dayTimeService->getDayTimeAnalytics($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
