<?php

namespace App\Services;

use App\Repositories\Contracts\RetentionRepositoryInterface;
use Illuminate\Support\Collection;

class RetentionService
{
    public function __construct(
        protected RetentionRepositoryInterface $retentionRepository
    ) {
    }

    public function getRetention(array $params): array
    {
        // Currently returns stub data for compatibility.
        $rows = $this->retentionRepository->getRetention($params);
        $data = $rows instanceof Collection ? $rows->toArray() : (array) $rows;

        return [
            'success' => true,
            'data' => $data,
            'message' => 'Retrieved retention analytics',
            'error' => null,
        ];
    }
}
