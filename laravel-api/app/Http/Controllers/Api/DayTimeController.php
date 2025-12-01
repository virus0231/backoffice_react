<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DayTimeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
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

        $rows = DB::select($sql);

        return response()->json([
            'success' => true,
            'data' => [
                'heatmapData' => $rows,
            ],
        ]);
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
