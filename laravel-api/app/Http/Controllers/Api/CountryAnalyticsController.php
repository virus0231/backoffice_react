<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CountryAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CountryAnalyticsController extends Controller
{
    public function __construct(private readonly CountryAnalyticsService $countryAnalyticsService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->countryAnalyticsService->getCountryAnalytics($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
