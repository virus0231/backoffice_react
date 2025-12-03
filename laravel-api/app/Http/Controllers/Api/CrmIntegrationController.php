<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CrmIntegrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrmIntegrationController extends Controller
{
    public function __construct(private readonly CrmIntegrationService $crmIntegrationService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->crmIntegrationService->sync($request->all());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
