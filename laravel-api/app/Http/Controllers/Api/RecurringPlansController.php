<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringPlansController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $metric = $request->query('metric', 'active-plans'); // active-plans|new-plans|canceled-plans
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        if (!$startDate || !$endDate) {
            return response()->json(['success' => false, 'error' => 'startDate and endDate are required'], 400);
        }

        // Build an inclusive date series with zero values as a safe fallback
        $trend = [];
        $comparison = [];
        try {
            $start = Carbon::createFromFormat('Y-m-d', $startDate);
            $end = Carbon::createFromFormat('Y-m-d', $endDate);
            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                $trend[] = [
                    'date' => $d->format('Y-m-d'),
                    'value' => 0,
                ];
            }
        } catch (\Throwable $e) {
            // If parsing fails, still return empty set
            $trend = [];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'metric' => $metric,
                'trendData' => $trend,
            ],
        ]);
    }
}
