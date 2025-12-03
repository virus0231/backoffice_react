<?php

namespace App\Services;

use App\Repositories\Contracts\ExportOptimizedRepositoryInterface;

class ExportOptimizedService
{
    public function __construct(
        private readonly ExportOptimizedRepositoryInterface $exportOptimizedRepository
    ) {
    }

    public function export(array $filters): array
    {
        $rows = $this->exportOptimizedRepository->export($filters);

        return [
            'success' => true,
            'data' => $rows,
            'message' => 'Optimized export completed',
            'error' => null,
        ];
    }
}
