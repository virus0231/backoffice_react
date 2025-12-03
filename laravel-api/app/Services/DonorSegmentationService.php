<?php

namespace App\Services;

use App\Repositories\Contracts\DonorSegmentationRepositoryInterface;
use Illuminate\Support\Collection;

class DonorSegmentationService
{
    public function __construct(
        protected DonorSegmentationRepositoryInterface $donorSegmentationRepository
    ) {
    }

    public function getSegments(): array
    {
        $segments = $this->donorSegmentationRepository->getSegments();

        $data = $segments instanceof Collection ? $segments->toArray() : (array) $segments;

        return [
            'success' => true,
            'data' => $data,
            'message' => 'Retrieved donor segments',
            'error' => null,
        ];
    }
}
