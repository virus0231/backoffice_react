<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FrequenciesService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FrequenciesController extends Controller
{
    public function __construct(private readonly FrequenciesService $frequenciesService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->frequenciesService->getFrequenciesAnalytics($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
