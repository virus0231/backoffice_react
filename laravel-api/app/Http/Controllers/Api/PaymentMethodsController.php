<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentMethodsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodsController extends Controller
{
    public function __construct(private readonly PaymentMethodsService $paymentMethodsService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->paymentMethodsService->getPaymentMethodsAnalytics($request->query());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
