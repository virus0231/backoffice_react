<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DonorSegmentationController extends Controller
{
    public function index(): JsonResponse
    {
        // Stub implementation to unblock UI; replace with real segmentation logic if needed.
        return response()->json([
            'success' => true,
            'data' => [
                'lybunt' => [],
                'sybunt' => [],
                'topLevel' => [],
                'midLevel' => [],
                'lowLevel' => [],
            ],
        ]);
    }
}
