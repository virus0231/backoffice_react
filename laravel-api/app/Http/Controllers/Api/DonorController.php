<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Donor\CreateDonorRequest;
use App\Http\Requests\Donor\UpdateDonorRequest;
use App\Models\Donor;
use App\Services\DonorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DonorController extends Controller
{
    public function __construct(private readonly DonorService $donorService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'search' => trim((string) $request->query('email', '')),
        ];

        $perPage = min(100, max(10, (int) $request->query('limit', 50)));
        $paginator = $this->donorService->getPaginatedDonors($filters, $perPage);

        $data = collect($paginator->items())->map(fn (Donor $donor) => $this->formatDonor($donor));

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'currentPage' => $paginator->currentPage(),
                'totalPages' => $paginator->lastPage(),
                'totalCount' => $paginator->total(),
                'perPage' => $paginator->perPage(),
                'hasNext' => $paginator->hasMorePages(),
                'hasPrev' => $paginator->currentPage() > 1,
            ],
            'count' => $data->count(),
            'message' => $filters['search'] !== '' ? 'Retrieved matching donors' : 'Retrieved paginated donors',
        ]);
    }

    public function store(CreateDonorRequest $request): JsonResponse
    {
        $donor = $this->donorService->createDonor($request->validated());

        return response()->json([
            'success' => true,
            'data' => $this->formatDonor($donor),
            'message' => 'Donor created successfully',
        ], 201);
    }

    public function show(int $donor): JsonResponse
    {
        $donorModel = $this->donorService->getDonorById($donor);

        if (! $donorModel) {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatDonor($donorModel),
            'message' => 'Retrieved donor details',
        ]);
    }

    public function update(UpdateDonorRequest $request, int $donor): JsonResponse
    {
        $updated = $this->donorService->updateDonor($donor, $request->validated());

        if (! $updated) {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found or not updated',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->formatDonor($updated),
            'message' => 'Donor updated successfully',
        ]);
    }

    public function destroy(int $donor): JsonResponse
    {
        $deleted = $this->donorService->deleteDonor($donor);

        if (! $deleted) {
            return response()->json([
                'success' => false,
                'error' => 'Donor not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Donor deleted successfully',
        ]);
    }

    public function donations(int $donor): JsonResponse
    {
        $donorModel = $this->donorService->getDonorById($donor);
        if (! $donorModel) {
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
        $donorModel = $this->donorService->getDonorById($donor);
        if (! $donorModel) {
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

    private function formatDonor(Donor $donor): array
    {
        return [
            'id' => (int) $donor->id,
            'fourdigit' => $donor->fourdigit ?? '',
            'stripe_id' => $donor->stripe_id ?? '',
            'email' => $donor->email ?? '',
            'firstName' => $donor->firstname ?? '',
            'lastName' => $donor->lastname ?? '',
            'phone' => $donor->phone ?? '',
            'address1' => $donor->add1 ?? '',
            'address2' => $donor->add2 ?? '',
            'city' => $donor->city ?? '',
            'country' => $donor->country ?? '',
            'postcode' => $donor->postcode ?? '',
            'organization' => $donor->organization ?? '',
            'dateAdded' => $donor->Date_Added ?? '',
        ];
    }
}
