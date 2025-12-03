<?php

namespace App\Services;

use App\Repositories\Contracts\SeasonRepositoryInterface;

class SeasonService
{
    public function __construct(
        private readonly SeasonRepositoryInterface $seasonRepository
    ) {
    }

    public function getSeasonDates(): array
    {
        $rows = $this->seasonRepository->getSeasonDates();

        return [
            'success' => true,
            'data' => $rows,
            'message' => 'Retrieved season dates',
            'error' => null,
        ];
    }
}
