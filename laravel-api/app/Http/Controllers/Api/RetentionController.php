<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RetentionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Minimal stub to satisfy frontend; replace with full cohort logic as needed
        return response()->json([
            'success' => true,
            'data' => [
                'retentionData' => [],
            ],
        ]);
    }
}
