<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CountryAnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $granularity = $request->query('granularity', 'daily');
        $metric = $request->query('metric', 'chart');
        $appealIds = $this->toIntArray($request->query('appealId', ''));
        $fundIds = $this->toIntArray($request->query('fundId', ''));

        if (!$startDate || !$endDate) {
            return response()->json(['success' => false, 'error' => 'startDate and endDate are required'], 400);
        }

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

            $rows = DB::select($sql);
            return response()->json([
                'success' => true,
                'data' => [
                    'metric' => 'chart',
                    'granularity' => $granularity,
                    'chartData' => $rows,
                ],
            ]);
        }

        if ($metric === 'table') {
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

            $rows = DB::select($sql);
            return response()->json([
                'success' => true,
                'data' => [
                    'metric' => 'table',
                    'tableData' => $rows,
                ],
            ]);
        }

        return response()->json(['success' => false, 'error' => 'Invalid metric parameter. Use \"chart\" or \"table\"'], 400);
    }

    private function toIntArray(string $csv): array
    {
        return collect(explode(',', $csv))
            ->map(fn ($v) => (int)$v)
            ->filter(fn ($v) => $v > 0)
            ->values()
            ->all();
    }
}
