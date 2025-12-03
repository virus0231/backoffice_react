<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DigitalMarketingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DigitalMarketingController extends Controller
{
    public function __construct(private readonly DigitalMarketingService $digitalMarketingService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->digitalMarketingService->track($request->all());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
