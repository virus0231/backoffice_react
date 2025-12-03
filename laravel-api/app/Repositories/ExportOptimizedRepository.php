<?php

namespace App\Repositories;

use App\Repositories\Contracts\ExportOptimizedRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ExportOptimizedRepository implements ExportOptimizedRepositoryInterface
{
    public function export(array $filters): Collection
    {
        $transactions = TableResolver::prefixed('transactions');
        $details = TableResolver::prefixed('transaction_details');

        return collect([
            'transactions' => $transactions,
            'details' => $details,
            'rows' => [],
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
