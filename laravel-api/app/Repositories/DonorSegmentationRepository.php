<?php

namespace App\Repositories;

use App\Repositories\Contracts\DonorSegmentationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class DonorSegmentationRepository implements DonorSegmentationRepositoryInterface
{
    public function getSegments(): Collection
    {
        // Stubbed passthrough for compatibility; replace with real query logic when available.
        return collect([
            'lybunt' => [],
            'sybunt' => [],
            'topLevel' => [],
            'midLevel' => [],
            'lowLevel' => [],
        ]);
    }

    /* --- RepositoryInterface compatibility (not used here) --- */
    public function findById(int|string $id): ?Model
    {
        return null;
    }

    public function create(array $data): Model
    {
        return new Model();
    }

    public function update(Model|int|string $modelOrId, array $data): Model
    {
        return $modelOrId instanceof Model ? $modelOrId : new Model();
    }

    public function delete(Model|int|string $modelOrId): bool
    {
        return false;
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return new Paginator([], 0, $perPage);
    }
}
