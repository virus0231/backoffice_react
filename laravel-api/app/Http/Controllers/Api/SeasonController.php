<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SeasonService;
use Illuminate\Http\JsonResponse;

class SeasonController extends Controller
{
    public function __construct(private readonly SeasonService $seasonService)
    {
    }

    public function index(): JsonResponse
    {
        $result = $this->seasonService->getSeasonDates();
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
