<?php

namespace App\Services;

use App\Repositories\Contracts\DigitalMarketingRepositoryInterface;

class DigitalMarketingService
{
    public function __construct(
        private readonly DigitalMarketingRepositoryInterface $digitalMarketingRepository
    ) {
    }

    public function track(array $data): array
    {
        $result = $this->digitalMarketingRepository->track($data);

        return [
            'success' => true,
            'data' => $result,
            'message' => 'Tracking recorded',
            'error' => null,
        ];
    }
}
