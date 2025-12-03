<?php

namespace App\Repositories;

use App\Repositories\Contracts\PaymentMethodsRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class PaymentMethodsRepository implements PaymentMethodsRepositoryInterface
{
    public function getPaymentMethodsAnalytics(array $filters): Collection
    {
        $startDate = $filters['startDate'];
        $endDate = $filters['endDate'];
        $granularity = $filters['granularity'] ?? 'daily';
        $metric = $filters['metric'] ?? 'chart';
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

        if ($metric === 'chart') {
            if ($granularity === 'daily') {
                $sql = "
                WITH RECURSIVE dates AS (
                  SELECT DATE({$startLiteral}) AS d
                  UNION ALL
                  SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE({$endLiteral})
                ),
                payment_types AS (
                  SELECT DISTINCT paymenttype FROM `{$transactions}`
                ),
                daily_agg AS (
                  SELECT
                    DATE(t.date) AS d,
                    t.paymenttype,
                    SUM(t.totalamount) AS amount
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
                  GROUP BY DATE(t.date), t.paymenttype
                )
                SELECT
                  d.d AS `date`,
                  pt.paymenttype,
                  COALESCE(a.amount, 0) AS amount
                FROM dates d
                CROSS JOIN payment_types pt
                LEFT JOIN daily_agg a ON a.d = d.d AND a.paymenttype = pt.paymenttype
                ORDER BY d.d, pt.paymenttype
                ";
            } else {
                $sql = "
                WITH weeks AS (
                  SELECT DISTINCT
                    YEARWEEK(date, 1) AS week_number,
                    DATE(DATE_SUB(date, INTERVAL WEEKDAY(date) DAY)) AS week_start
                  FROM `{$transactions}`
                  WHERE date >= {$startLiteral}
                    AND date < DATE_ADD({$endLiteral}, INTERVAL 1 DAY)
                ),
                payment_types AS (
                  SELECT DISTINCT paymenttype FROM `{$transactions}`
                ),
                weekly_agg AS (
                  SELECT
                    YEARWEEK(t.date, 1) AS week_number,
                    t.paymenttype,
                    SUM(t.totalamount) AS amount
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
                  GROUP BY YEARWEEK(t.date, 1), t.paymenttype
                )
                SELECT
                  w.week_number,
                  w.week_start AS `date`,
                  pt.paymenttype,
                  COALESCE(a.amount, 0) AS amount
                FROM weeks w
                CROSS JOIN payment_types pt
                LEFT JOIN weekly_agg a ON a.week_number = w.week_number AND a.paymenttype = pt.paymenttype
                ORDER BY w.week_number, pt.paymenttype
                ";
            }

            return collect(DB::select($sql));
        }

        $sql = "
        WITH filtered_tx AS (
          SELECT t.id, t.paymenttype, t.totalamount
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
        ),
        payment_types AS (
          SELECT DISTINCT paymenttype FROM `{$transactions}`
        ),
        agg AS (
          SELECT paymenttype, COUNT(DISTINCT id) AS donation_count, SUM(totalamount) AS total_raised
          FROM filtered_tx
          GROUP BY paymenttype
        )
        SELECT
          pt.paymenttype AS payment_method,
          COALESCE(a.donation_count, 0) AS donation_count,
          COALESCE(a.total_raised, 0) AS total_raised
        FROM payment_types pt
        LEFT JOIN agg a ON a.paymenttype = pt.paymenttype
        ORDER BY pt.paymenttype
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
