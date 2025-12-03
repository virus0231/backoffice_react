<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ExportOptimizedService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExportOptimizedController extends Controller
{
    public function __construct(private readonly ExportOptimizedService $exportOptimizedService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->exportOptimizedService->export($request->all());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
