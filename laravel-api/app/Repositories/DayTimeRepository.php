<?php

namespace App\Repositories;

use App\Repositories\Contracts\DayTimeRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class DayTimeRepository implements DayTimeRepositoryInterface
{
    public function getDayTimeAnalytics(array $filters): Collection
    {
        $startDate = $filters['startDate'];
        $endDate = $filters['endDate'];
        $appealIds = $filters['appealIds'] ?? [];
        $fundIds = $filters['fundIds'] ?? [];

        $transactions = TableResolver::prefixed('transactions');
        $details = TableResolver::prefixed('transaction_details');
        $appeal = TableResolver::prefixed('appeal');
        $fund = TableResolver::prefixed('fundlist');

        $pdo = DB::getPdo();
        $startLiteral = $pdo->quote($startDate);
        $endLiteral = $pdo->quote($endDate);

        $filterClause = '';
        if (!empty($appealIds)) {
            $filterClause .= ' AND a.id IN (' . implode(',', $appealIds) . ')';
        }
        if (!empty($fundIds)) {
            $filterClause .= ' AND f.id IN (' . implode(',', $fundIds) . ')';
        }

        $sql = "
        SELECT
          (DAYOFWEEK(t.date) + 5) % 7 AS day_of_week,
          HOUR(t.date) AS hour_of_day,
          COUNT(DISTINCT t.id) AS donation_count,
          SUM(t.totalamount) AS total_raised
        FROM `{$transactions}` t
        WHERE t.status IN ('Completed','pending')
          AND t.date >= {$startLiteral}
          AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
          AND EXISTS (
            SELECT 1
            FROM `{$details}` d
            JOIN `{$appeal}` a ON a.id = d.appeal_id
            JOIN `{$fund}` f ON f.id = d.fundlist_id
            WHERE d.TID = t.id
            {$filterClause}
          )
        GROUP BY day_of_week, hour_of_day
        ORDER BY day_of_week, hour_of_day
        ";

        return collect(DB::select($sql));
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
