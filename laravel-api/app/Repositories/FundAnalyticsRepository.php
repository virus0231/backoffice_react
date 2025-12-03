<?php

namespace App\Repositories;

use App\Repositories\Contracts\FundAnalyticsRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class FundAnalyticsRepository implements FundAnalyticsRepositoryInterface
{
    public function getFundAnalytics(array $filters): Collection
    {
        $startDate = $filters['startDate'];
        $endDate = $filters['endDate'];
        $metric = $filters['metric'] ?? 'chart';
        $granularity = $filters['granularity'] ?? 'daily';
        $appealIds = $filters['appealIds'] ?? [];

        $transactions = TableResolver::prefixed('transactions');
        $details = TableResolver::prefixed('transaction_details');
        $appeal = TableResolver::prefixed('appeal');

        $startLiteral = DB::getPdo()->quote($startDate);
        $endLiteral = DB::getPdo()->quote($endDate);

        $appealFilterActive = '';
        if (!empty($appealIds)) {
            $appealFilterActive = ' AND td.appeal_id IN (' . implode(',', $appealIds) . ')';
        }

        if ($metric === 'chart') {
            if ($granularity === 'daily') {
                $activeAppeals = "
                active_appeals AS (
                  SELECT DISTINCT ap.id AS appeal_id, ap.name AS appeal_name
                  FROM `{$appeal}` ap
                  WHERE EXISTS (
                    SELECT 1
                    FROM `{$details}` td
                    JOIN `{$transactions}` t ON t.id = td.TID
                    WHERE td.appeal_id = ap.id
                      AND t.status IN ('Completed','pending')
                      AND t.date >= {$startLiteral}
                      AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                      {$appealFilterActive}
                  )
                )";

                $appealFilter = '';
                if (!empty($appealIds)) {
                    $appealFilter = ' AND a.id IN (' . implode(',', $appealIds) . ')';
                }

                $dailyAgg = "
                daily_agg AS (
                  SELECT
                    DATE(t.date) AS d,
                    td.appeal_id,
                    SUM(t.totalamount) AS amount
                  FROM `{$transactions}` t
                  JOIN `{$details}` td ON td.TID = t.id
                  WHERE t.status IN ('Completed','pending')
                    AND t.date >= {$startLiteral}
                    AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                    AND EXISTS (
                      SELECT 1
                      FROM `{$details}` d
                      JOIN `{$appeal}` a ON a.id = d.appeal_id
                      WHERE d.TID = t.id
                      {$appealFilter}
                    )
                  GROUP BY DATE(t.date), td.appeal_id
                )";

                $sql = "
                WITH RECURSIVE dates AS (
                  SELECT DATE({$startLiteral}) AS d
                  UNION ALL
                  SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE({$endLiteral})
                ),
                {$activeAppeals},
                {$dailyAgg}
                SELECT
                  d.d AS `date`,
                  aa.appeal_id,
                  aa.appeal_name,
                  COALESCE(a.amount, 0) AS amount
                FROM dates d
                CROSS JOIN active_appeals aa
                LEFT JOIN daily_agg a ON a.d = d.d AND a.appeal_id = aa.appeal_id
                ORDER BY d.d, aa.appeal_name
                ";
            } else {
                $activeAppeals = "
                active_appeals AS (
                  SELECT DISTINCT ap.id AS appeal_id, ap.name AS appeal_name
                  FROM `{$appeal}` ap
                  WHERE EXISTS (
                    SELECT 1
                    FROM `{$details}` td
                    JOIN `{$transactions}` t ON t.id = td.TID
                    WHERE td.appeal_id = ap.id
                      AND t.status IN ('Completed','pending')
                      AND t.date >= {$startLiteral}
                      AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                      {$appealFilterActive}
                  )
                )";

                $appealFilter = '';
                if (!empty($appealIds)) {
                    $appealFilter = ' AND a.id IN (' . implode(',', $appealIds) . ')';
                }

                $weeklyAgg = "
                weekly_agg AS (
                  SELECT
                    YEARWEEK(t.date, 1) AS week_number,
                    td.appeal_id,
                    SUM(t.totalamount) AS amount
                  FROM `{$transactions}` t
                  JOIN `{$details}` td ON td.TID = t.id
                  WHERE t.status IN ('Completed','pending')
                    AND t.date >= {$startLiteral}
                    AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                    AND EXISTS (
                      SELECT 1
                      FROM `{$details}` d
                      JOIN `{$appeal}` a ON a.id = d.appeal_id
                      WHERE d.TID = t.id
                      {$appealFilter}
                    )
                  GROUP BY YEARWEEK(t.date, 1), td.appeal_id
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
                {$activeAppeals},
                {$weeklyAgg}
                SELECT
                  w.week_number,
                  w.week_start AS `date`,
                  aa.appeal_id,
                  aa.appeal_name,
                  COALESCE(a.amount, 0) AS amount
                FROM weeks w
                CROSS JOIN active_appeals aa
                LEFT JOIN weekly_agg a ON a.week_number = w.week_number AND a.appeal_id = aa.appeal_id
                ORDER BY w.week_number, aa.appeal_name
                ";
            }

            return collect(DB::select($sql));
        }

        $appealFilter = '';
        if (!empty($appealIds)) {
            $appealFilter = ' AND a.id IN (' . implode(',', $appealIds) . ')';
        }

        $sql = "
        SELECT
          ap.id AS appeal_id,
          ap.name AS appeal_name,
          COUNT(DISTINCT t.id) AS donation_count,
          SUM(t.totalamount) AS total_raised
        FROM `{$transactions}` t
        JOIN `{$details}` td ON td.TID = t.id
        JOIN `{$appeal}` ap ON ap.id = td.appeal_id
        WHERE t.status IN ('Completed','pending')
          AND t.date >= {$startLiteral}
          AND t.date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
          AND EXISTS (
            SELECT 1
            FROM `{$details}` d
            JOIN `{$appeal}` a ON a.id = d.appeal_id
            WHERE d.TID = t.id
            {$appealFilter}
          )
        GROUP BY ap.id, ap.name
        ORDER BY total_raised DESC, ap.name
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
