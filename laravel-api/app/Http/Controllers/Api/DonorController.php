<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DonorService;
use App\Http\Requests\Donor\StoreDonorRequest;
use App\Http\Requests\Donor\UpdateDonorRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonorController extends Controller
{
    public function __construct(private readonly DonorService $donorService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $params = $request->query();
        $result = $this->donorService->getPaginatedDonors($params);
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }

    public function store(StoreDonorRequest $request): JsonResponse
    {
        $result = $this->donorService->createDonor($request->validated());
        $status = $result['error'] === 'validation' ? 400 : 201;

        return response()->json($result, $status);
    }

    public function show(int $donor): JsonResponse
    {
        $result = $this->donorService->getDonorById($donor);
        $status = $result['error'] === 'not_found' ? 404 : ($result['error'] === 'validation' ? 400 : 200);

        return response()->json($result, $status);
    }

    public function update(UpdateDonorRequest $request, int $donor): JsonResponse
    {
        $result = $this->donorService->updateDonor($donor, $request->validated());
        $status = match ($result['error'] ?? null) {
            'validation' => 400,
            'not_found' => 404,
            default => 200,
        };

        return response()->json($result, $status);
    }

    public function destroy(int $donor): JsonResponse
    {
        $deleted = $this->donorService->deleteDonor($donor);
        if (! $deleted) {
            return response()->json(['success' => false, 'error' => 'Donor not found'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Donor deleted successfully']);
    }

    public function donations(int $donor): JsonResponse
    {
        $result = $this->donorService->getDonorById($donor);
        if ($result['error'] === 'not_found') {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found',
            ], 404);
        }

        $donations = $this->donorService->getDonorDonations($donor);

        return response()->json([
            'success' => true,
            'data' => $donations,
            'count' => $donations->count(),
            'message' => 'Retrieved donor donations',
        ]);
    }

    public function subscriptions(int $donor): JsonResponse
    {
        $result = $this->donorService->getDonorById($donor);
        if ($result['error'] === 'not_found') {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found',
            ], 404);
        }

        $subscriptions = $this->donorService->getDonorSubscriptions($donor);

        return response()->json([
            'success' => true,
            'data' => $subscriptions,
            'count' => $subscriptions->count(),
            'message' => 'Retrieved donor subscriptions',
        ]);
    }
}
