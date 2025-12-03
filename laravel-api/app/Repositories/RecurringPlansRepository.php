<?php

namespace App\Repositories;

use App\Repositories\Contracts\RecurringPlansRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class RecurringPlansRepository implements RecurringPlansRepositoryInterface
{
    public function getRecurringPlans(array $filters): Collection
    {
        // Placeholder: use TableResolver to maintain pattern; actual logic can be added later.
        $transactions = TableResolver::prefixed('transactions');
        $schedule = TableResolver::prefixed('schedule');
        // Currently returning empty dataset to preserve existing stub behavior.
        return collect([
            'metric' => $filters['metric'] ?? 'active-plans',
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
