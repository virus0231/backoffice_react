<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificationController extends Controller
{
    public function __construct(private readonly VerificationService $verificationService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->verificationService->verify($request->all());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
