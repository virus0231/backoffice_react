<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecurringRevenueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $metric = $request->query('metric', 'mrr'); // mrr|share-of-revenue|donation-amounts
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');

        if (!$startDate || !$endDate) {
            return response()->json(['success' => false, 'error' => 'startDate and endDate are required'], 400);
        }

        $trend = [];
        try {
            $start = Carbon::createFromFormat('Y-m-d', $startDate);
            $end = Carbon::createFromFormat('Y-m-d', $endDate);
            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                $trend[] = [
                    'date' => $d->format('Y-m-d'),
                    'value' => 0,
                    'mrr' => 0,
                ];
            }
        } catch (\Throwable $e) {
            $trend = [];
        }

        // donation-amounts expects table-like entries; return empty
        if ($metric === 'donation-amounts') {
            return response()->json([
                'success' => true,
                'data' => [
                    'metric' => $metric,
                    'trendData' => [],
                ],
            ]);
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
