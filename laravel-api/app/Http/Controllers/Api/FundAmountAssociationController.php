<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\FundAmountAssociationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FundAmountAssociationController extends Controller
{
    public function __construct(private readonly FundAmountAssociationService $fundAmountAssociationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $appealId = (int) $request->query('appeal_id', 0);
        $result = $this->fundAmountAssociationService->getAssociations($appealId);
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }

    public function update(Request $request): JsonResponse
    {
        $appealId = (int) $request->input('appeal_id', 0);
        $result = $this->fundAmountAssociationService->updateAssociations($appealId, $request->all());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
