<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FrequenciesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $metric = $request->query('metric', 'chart'); // chart|table
        $appealIds = $this->toIntArray($request->query('appealId', ''));
        $fundIds = $this->toIntArray($request->query('fundId', ''));

        if (!$startDate || !$endDate) {
            return response()->json(['success' => false, 'error' => 'startDate and endDate are required'], 400);
        }

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
            $sql = "
            WITH RECURSIVE dates AS (
              SELECT DATE({$startLiteral}) AS d
              UNION ALL
              SELECT d + INTERVAL 1 DAY FROM dates WHERE d + INTERVAL 1 DAY <= DATE({$endLiteral})
            ),
            filtered_tx AS (
              SELECT t.id, t.totalamount, DATE(t.date) AS d
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
            tx_freq AS (
              SELECT ft.d, ft.totalamount, MAX(td.freq) AS max_freq
              FROM filtered_tx ft
              JOIN `{$details}` td ON td.TID = ft.id
              GROUP BY ft.id, ft.d, ft.totalamount
            ),
            daily_agg AS (
              SELECT
                d,
                SUM(CASE WHEN max_freq = 1 THEN totalamount ELSE 0 END) AS monthly,
                SUM(CASE WHEN max_freq = 0 THEN totalamount ELSE 0 END) AS one_time,
                SUM(CASE WHEN max_freq = 2 THEN totalamount ELSE 0 END) AS yearly,
                SUM(CASE WHEN max_freq = 4 THEN totalamount ELSE 0 END) AS weekly,
                SUM(CASE WHEN max_freq = 3 THEN totalamount ELSE 0 END) AS daily
              FROM tx_freq
              GROUP BY d
            )
            SELECT
              d.d AS `date`,
              COALESCE(a.monthly, 0) AS monthly,
              COALESCE(a.one_time, 0) AS one_time,
              COALESCE(a.yearly, 0) AS yearly,
              COALESCE(a.weekly, 0) AS weekly,
              COALESCE(a.daily, 0) AS daily
            FROM dates d
            LEFT JOIN daily_agg a ON a.d = d.d
            ORDER BY d.d
            ";

            $rows = DB::select($sql);
            return response()->json([
                'success' => true,
                'data' => [
                    'metric' => 'chart',
                    'chartData' => $rows,
                ],
            ]);
        }

        if ($metric === 'table') {
            $sql = "
            WITH filtered_tx AS (
              SELECT t.id, t.totalamount, DATE(t.date) AS d
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
            tx_freq AS (
              SELECT ft.id, MAX(td.freq) AS max_freq
              FROM filtered_tx ft
              JOIN `{$details}` td ON td.TID = ft.id
              GROUP BY ft.id
            ),
            agg AS (
              SELECT
                max_freq,
                COUNT(DISTINCT id) AS donation_count
              FROM tx_freq
              GROUP BY max_freq
            )
            SELECT
              SUM(CASE WHEN max_freq = 0 THEN donation_count ELSE 0 END) AS one_time,
              SUM(CASE WHEN max_freq = 1 THEN donation_count ELSE 0 END) AS monthly,
              SUM(CASE WHEN max_freq = 2 THEN donation_count ELSE 0 END) AS yearly,
              SUM(CASE WHEN max_freq = 3 THEN donation_count ELSE 0 END) AS daily,
              SUM(CASE WHEN max_freq = 4 THEN donation_count ELSE 0 END) AS weekly
            FROM agg
            ";

            $rows = DB::select($sql);
            $row = $rows[0] ?? [];
            return response()->json([
                'success' => true,
                'data' => [
                    'metric' => 'table',
                    'tableData' => [$row],
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
