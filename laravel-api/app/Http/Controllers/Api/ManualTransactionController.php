<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Transaction\CreateManualTransactionRequest;
use App\Services\ManualTransactionService;
use Illuminate\Http\JsonResponse;

class ManualTransactionController extends Controller
{
    public function __construct(private readonly ManualTransactionService $manualTransactionService)
    {
    }

    public function store(CreateManualTransactionRequest $request): JsonResponse
    {
        $result = $this->manualTransactionService->createManualTransaction($request->validated());
        $status = $result['success'] ? 201 : ($result['error'] === 'validation' ? 400 : 500);

        return response()->json($result, $status);
    }
}
