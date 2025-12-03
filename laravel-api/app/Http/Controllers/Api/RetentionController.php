<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RetentionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RetentionController extends Controller
{
    public function __construct(private readonly RetentionService $retentionService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->retentionService->getRetention($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
