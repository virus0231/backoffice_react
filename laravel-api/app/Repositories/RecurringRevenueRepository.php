<?php

namespace App\Repositories;

use App\Repositories\Contracts\RecurringRevenueRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class RecurringRevenueRepository implements RecurringRevenueRepositoryInterface
{
    public function getRecurringRevenue(array $filters): Collection
    {
        // Placeholder hook to allow future DB-driven implementation; keep stub behavior.
        $transactions = TableResolver::prefixed('transactions');
        $schedule = TableResolver::prefixed('schedule');

        return collect([
            'metric' => $filters['metric'] ?? 'mrr',
            'trendData' => [],
            'tables' => ['transactions' => $transactions, 'schedule' => $schedule],
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
