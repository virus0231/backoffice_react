<?php

namespace App\Services;

use App\Repositories\Contracts\CategoryRepositoryInterface;

class CategoryService
{
    public function __construct(
        protected CategoryRepositoryInterface $categoryRepository
    ) {
    }

    public function getAllCategories(): array
    {
        $rows = $this->categoryRepository->getAllCategories();

        $data = $rows->map(function ($r) {
            return [
                'id' => (int) $r->id,
                'name' => $r->name ?? '',
            ];
        })->all();

        return [
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved categories',
        ];
    }

    public function bulkUpdateCategories(array $data): array
    {
        return ['success' => false, 'message' => 'Bulk update not supported', 'error' => 'not_implemented'];
    }
}
