<?php

namespace App\Services;

use App\Repositories\Contracts\FeaturedAmountRepositoryInterface;

class FeaturedAmountService
{
    public function __construct(
        protected FeaturedAmountRepositoryInterface $featuredAmountRepository
    ) {
    }

    public function toggleFeaturedStatus(int $id, bool $status): array
    {
        if ($id <= 0) {
            return [
                'success' => false,
                'message' => 'id is required',
                'error' => 'validation',
            ];
        }

        $amount = $this->featuredAmountRepository->findAmountById($id);
        if (! $amount) {
            return [
                'success' => false,
                'message' => 'Amount not found',
                'data' => [],
                'error' => 'not_found',
            ];
        }

        $featured = $status ? 1 : 0;
        $this->featuredAmountRepository->updateFeaturedStatus($id, $featured);

        return [
            'success' => true,
            'message' => 'Featured status updated',
            'data' => [
                'id' => $id,
                'status' => $status,
            ],
            'error' => null,
        ];
    }
}
