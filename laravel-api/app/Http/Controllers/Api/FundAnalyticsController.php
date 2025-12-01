<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FundAnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $granularity = $request->query('granularity', 'daily'); // daily or weekly
        $metric = $request->query('metric', 'chart'); // chart or table
        $appealIds = $this->toIntArray($request->query('appealId', ''));

        if (!$startDate || !$endDate) {
            return response()->json(['success' => false, 'error' => 'startDate and endDate are required'], 400);
        }

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

            $rows = DB::select($sql);
            return response()->json([
                'success' => true,
                'data' => [
                    'metric' => 'table',
                    'tableData' => $rows,
                ],
            ]);
        }

        return response()->json(['success' => false, 'error' => 'Invalid metric parameter. Use "chart" or "table"'], 400);
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
