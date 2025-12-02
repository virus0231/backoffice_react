<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FiltersService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FiltersController extends Controller
{
    public function __construct(private readonly FiltersService $filtersService)
    {
    }

    public function appeals(): JsonResponse
    {
        $data = $this->filtersService->getAppeals();

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved appeals',
        ]);
    }

    public function funds(Request $request): JsonResponse
    {
        $result = $this->filtersService->getFunds($request->query());

        return response()->json([
            'success' => true,
            'data' => $result['data'],
            'count' => count($result['data']),
            'filters' => $result['filters'],
            'message' => 'Retrieved funds',
        ]);
    }

    public function categories(): JsonResponse
    {
        $data = $this->filtersService->getCategories();

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved categories',
        ]);
    }

    public function countries(): JsonResponse
    {
        $data = $this->filtersService->getCountries();

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved countries',
        ]);
    }
}
