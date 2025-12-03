<?php

namespace App\Repositories;

use App\Repositories\Contracts\CountryAnalyticsRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class CountryAnalyticsRepository implements CountryAnalyticsRepositoryInterface
{
    public function getCountryAnalytics(array $filters): Collection
    {
        $metric = $filters['metric'] ?? 'chart';
        $granularity = $filters['granularity'] ?? 'daily';
        $startDate = $filters['startDate'] ?? null;
        $endDate = $filters['endDate'] ?? null;
        $appealIds = $filters['appealIds'] ?? [];
        $fundIds = $filters['fundIds'] ?? [];

        $transactions = TableResolver::prefixed('transactions');
        $details = TableResolver::prefixed('transaction_details');
        $appeal = TableResolver::prefixed('appeal');
        $fund = TableResolver::prefixed('fundlist');
        $donors = TableResolver::prefixed('donors');

        $startLiteral = DB::getPdo()->quote($startDate);
        $endLiteral = DB::getPdo()->quote($endDate);

        $filterClause = '';
        if (!empty($appealIds)) {
            $filterClause .= ' AND a.id IN (' . implode(',', $appealIds) . ')';
        }
        if (!empty($fundIds)) {
            $filterClause .= ' AND f.id IN (' . implode(',', $fundIds) . ')';
        }

        if ($metric === 'chart') {
            if ($granularity === 'daily') {
                $activeCountries = "
                active_countries AS (
                  SELECT DISTINCT COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code
                  FROM `{$transactions}` t
                  JOIN `{$donors}` don ON don.id = t.DID
                  WHERE t.status IN ('Completed','pending')
                    AND t.date >= {$startLiteral}
                    AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                    AND EXISTS (
                      SELECT 1 FROM `{$details}` d
                      JOIN `{$appeal}` a ON a.id = d.appeal_id
                      JOIN `{$fund}` f ON f.id = d.fundlist_id
                      WHERE d.TID = t.id
                      {$filterClause}
                    )
                )";

                $dailyAgg = "
                daily_agg AS (
                  SELECT
                    DATE(t.date) AS d,
                    COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code,
                    SUM(t.totalamount) AS amount
                  FROM `{$transactions}` t
                  JOIN `{$donors}` don ON don.id = t.DID
                  WHERE t.status IN ('Completed','pending')
                    AND t.date >= {$startLiteral}
                    AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                    AND EXISTS (
                      SELECT 1 FROM `{$details}` d
                      JOIN `{$appeal}` a ON a.id = d.appeal_id
                      JOIN `{$fund}` f ON f.id = d.fundlist_id
                      WHERE d.TID = t.id
                      {$filterClause}
                    )
                  GROUP BY DATE(t.date), COALESCE(NULLIF(don.country, ''), 'Unknown')
                )";

                $sql = "
                WITH RECURSIVE dates AS (
                  SELECT DATE({$startLiteral}) AS d
                  UNION ALL
                  SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE({$endLiteral})
                ),
                {$activeCountries},
                {$dailyAgg}
                SELECT
                  dt.d AS `date`,
                  ac.country_code,
                  COALESCE(da.amount, 0) AS amount
                FROM dates dt
                CROSS JOIN active_countries ac
                LEFT JOIN daily_agg da ON da.d = dt.d AND da.country_code = ac.country_code
                ORDER BY dt.d, ac.country_code
                ";
            } else {
                $activeCountries = "
                active_countries AS (
                  SELECT DISTINCT COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code
                  FROM `{$transactions}` t
                  JOIN `{$donors}` don ON don.id = t.DID
                  WHERE t.status IN ('Completed','pending')
                    AND t.date >= {$startLiteral}
                    AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                    AND EXISTS (
                      SELECT 1 FROM `{$details}` d
                      JOIN `{$appeal}` a ON a.id = d.appeal_id
                      JOIN `{$fund}` f ON f.id = d.fundlist_id
                      WHERE d.TID = t.id
                      {$filterClause}
                    )
                )";

                $weeklyAgg = "
                weekly_agg AS (
                  SELECT
                    YEARWEEK(t.date, 1) AS week_number,
                    COALESCE(NULLIF(don.country, ''), 'Unknown') AS country_code,
                    SUM(t.totalamount) AS amount
                  FROM `{$transactions}` t
                  JOIN `{$donors}` don ON don.id = t.DID
                  WHERE t.status IN ('Completed','pending')
                    AND t.date >= {$startLiteral}
                    AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                    AND EXISTS (
                      SELECT 1 FROM `{$details}` d
                      JOIN `{$appeal}` a ON a.id = d.appeal_id
                      JOIN `{$fund}` f ON f.id = d.fundlist_id
                      WHERE d.TID = t.id
                      {$filterClause}
                    )
                  GROUP BY YEARWEEK(t.date, 1), COALESCE(NULLIF(don.country, ''), 'Unknown')
                )";

                $sql = "
                WITH weeks AS (
                  SELECT DISTINCT
                    YEARWEEK(date, 1) AS week_number,
                    DATE(DATE_SUB(date, INTERVAL WEEKDAY(date) DAY)) AS week_start
                  FROM `{$transactions}`
                  WHERE date >= {$startLiteral}
                    AND date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                ),
                {$activeCountries},
                {$weeklyAgg}
                SELECT
                  w.week_number,
                  w.week_start AS `date`,
                  ac.country_code,
                  COALESCE(wa.amount, 0) AS amount
                FROM weeks w
                CROSS JOIN active_countries ac
                LEFT JOIN weekly_agg wa ON wa.week_number = w.week_number AND wa.country_code = ac.country_code
                ORDER BY w.week_number, ac.country_code
                ";
            }

            return collect(DB::select($sql));
        }

        $filterClauseTable = '';
        if (!empty($appealIds)) {
            $filterClauseTable .= ' AND a.id IN (' . implode(',', $appealIds) . ')';
        }
        if (!empty($fundIds)) {
            $filterClauseTable .= ' AND f.id IN (' . implode(',', $fundIds) . ')';
        }

        $sql = "
        WITH filtered_tx AS (
          SELECT *
          FROM `{$transactions}`
          WHERE status IN ('Completed','pending')
            AND date >= {$startLiteral}
            AND date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
            AND EXISTS (
              SELECT 1 FROM `{$details}` d
              JOIN `{$appeal}` a ON a.id = d.appeal_id
              JOIN `{$fund}` f ON f.id = d.fundlist_id
              WHERE d.TID = `{$transactions}`.id
              {$filterClauseTable}
            )
        )
        SELECT
          t.country_code,
          t.donation_count,
          t.total_raised
        FROM (
          SELECT
            COALESCE(NULLIF(d.country, ''), 'Unknown') AS country_code,
            COUNT(DISTINCT tx.id) AS donation_count,
            SUM(tx.totalamount) AS total_raised
          FROM filtered_tx tx
          JOIN `{$donors}` d ON d.id = tx.DID
          WHERE d.country IS NOT NULL AND d.country != ''
          GROUP BY COALESCE(NULLIF(d.country, ''), 'Unknown')
        ) AS t
        ORDER BY t.country_code
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
