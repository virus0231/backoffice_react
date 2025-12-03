<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DonorSegmentationService;
use Illuminate\Http\JsonResponse;

class DonorSegmentationController extends Controller
{
    public function __construct(private readonly DonorSegmentationService $donorSegmentationService)
    {
    }

    public function index(): JsonResponse
    {
        $result = $this->donorSegmentationService->getSegments();
        return response()->json($result, 200);
    }
}
