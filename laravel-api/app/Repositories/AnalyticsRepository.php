<?php

namespace App\Repositories;

use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;
use BadMethodCallException;

class AnalyticsRepository implements AnalyticsRepositoryInterface
{
    public function getTransactionsByDateRange(array $filters): Collection
    {
        [$baseWhere, $bindings, $tables] = $this->buildQueryParts($filters);

        $aggSql = "
            SELECT
              SUM(t.totalamount) AS totalAmount,
              COUNT(DISTINCT t.id) AS donationCount
            FROM {$tables['transactions']} t
            {$baseWhere}
        ";

        $agg = DB::selectOne($aggSql, $bindings) ?? (object) ['totalAmount' => 0, 'donationCount' => 0];

        return collect([$agg]);
    }

    public function getTrendData(array $filters): Collection
    {
        [$baseWhere, $bindings, $tables] = $this->buildQueryParts($filters);
        $granularity = $filters['granularity'] ?? 'daily';

        if ($granularity === 'weekly') {
            $trendSql = "
                SELECT
                  YEARWEEK(t.date, 3) AS period,
                  MIN(DATE(t.date)) AS day,
                  SUM(t.totalamount) AS amount,
                  COUNT(DISTINCT t.id) AS count
                FROM {$tables['transactions']} t
                {$baseWhere}
                GROUP BY YEARWEEK(t.date, 3)
                ORDER BY day ASC
            ";
        } else {
            $trendSql = "
                SELECT
                  DATE(t.date) AS period,
                  SUM(t.totalamount) AS amount,
                  COUNT(DISTINCT t.id) AS count
                FROM {$tables['transactions']} t
                {$baseWhere}
                GROUP BY DATE(t.date)
                ORDER BY period ASC
            ";
        }

        return collect(DB::select($trendSql, $bindings));
    }

    /**
     * Build the WHERE clause and bindings mirroring legacy controller logic.
     */
    protected function buildQueryParts(array $filters): array
    {
        $transactionsTable = TableResolver::prefixed('transactions');
        $detailsTable = TableResolver::prefixed('transaction_details');
        $appealTable = TableResolver::prefixed('appeal');
        $fundTable = TableResolver::prefixed('fundlist');

        $bindings = [
            'start_dt' => $filters['startBound'] ?? null,
            'end_dt_incl' => $filters['endBound'] ?? null,
        ];

        $filterClause = '';
        $appealIds = $filters['appealIds'] ?? [];
        $fundIds = $filters['fundIds'] ?? [];
        $frequency = $filters['frequency'] ?? 'all';
        $kind = $filters['kind'] ?? '';

        if (!empty($appealIds)) {
            $placeholders = [];
            foreach ($appealIds as $idx => $id) {
                $key = "appeal{$idx}";
                $placeholders[] = ':' . $key;
                $bindings[$key] = $id;
            }
            $filterClause .= ' AND a.id IN (' . implode(',', $placeholders) . ')';
        }

        if (!empty($fundIds)) {
            $placeholders = [];
            foreach ($fundIds as $idx => $id) {
                $key = "fund{$idx}";
                $placeholders[] = ':' . $key;
                $bindings[$key] = $id;
            }
            $filterClause .= ' AND f.id IN (' . implode(',', $placeholders) . ')';
        }

        [$freqCondSubquery, $freqCondMain] = $this->frequencyConditions($kind, $frequency);

        $baseWhere = "WHERE t.status IN ('Completed','pending')
            AND t.date >= :start_dt
            AND t.date <= :end_dt_incl
            {$freqCondMain}
            AND EXISTS (
              SELECT 1
              FROM {$detailsTable} d
              JOIN {$appealTable} a ON a.id = d.appeal_id
              JOIN {$fundTable} f ON f.id = d.fundlist_id
              WHERE d.TID = t.id
              {$filterClause}
              {$freqCondSubquery}
            )";

        return [$baseWhere, $bindings, [
            'transactions' => $transactionsTable,
            'details' => $detailsTable,
            'appeal' => $appealTable,
            'fund' => $fundTable,
        ]];
    }

    protected function frequencyConditions(string $kind, string $frequency): array
    {
        $freqCondSubquery = '';
        $freqCondMain = '';

        $kindCond = match ($kind) {
            'one-time-donations' => ' AND d.freq = 0',
            'first-installments' => ' AND d.freq = 1 AND t.order_id NOT REGEXP \'_\'',
            default => '',
        };

        if ($frequency === 'recurring-first') {
            $freqCondSubquery = ' AND d.freq = 1';
            $freqCondMain = " AND t.order_id NOT REGEXP '_'";
        } elseif ($frequency === 'recurring-next') {
            $freqCondSubquery = ' AND d.freq = 1';
            $freqCondMain = " AND t.order_id REGEXP '_'";
        } elseif ($frequency === 'one-time') {
            $freqCondSubquery = ' AND d.freq = 0';
        } elseif ($frequency === 'recurring') {
            $freqCondSubquery = ' AND d.freq = 1';
        } elseif ($kindCond !== '') {
            $freqCondSubquery = $kindCond;
        }

        return [$freqCondSubquery, $freqCondMain];
    }

    /* --- RepositoryInterface compatibility (not used for analytics domain) --- */

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
