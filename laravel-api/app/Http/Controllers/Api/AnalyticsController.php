<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $kind = $request->query('kind');
        $startDate = $request->query('startDate');
        $endDate = $request->query('endDate');
        $granularity = $request->query('granularity', 'daily');
        $appealIds = $this->csvToIntArray($request->query('appealId', ''));
        $fundIds = $this->csvToIntArray($request->query('fundId', ''));
        $frequency = $request->query('frequency', 'all');

        if (!$kind || !$startDate || !$endDate) {
            return response()->json([
                'success' => false,
                'error' => 'Missing kind/startDate/endDate',
            ], 400);
        }

        [$startBound, $endBound] = $this->buildBounds($startDate, $endDate);
        if (!$startBound || !$endBound) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid startDate/endDate format (expected YYYY-MM-DD)',
            ], 400);
        }

        $transactionsTable = TableResolver::prefixed('transactions');
        $detailsTable = TableResolver::prefixed('transaction_details');
        $appealTable = TableResolver::prefixed('appeal');
        $fundTable = TableResolver::prefixed('fundlist');

        $filterClause = '';
        $bindings = [
            'start_dt' => $startBound,
            'end_dt_incl' => $endBound,
        ];

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

        $aggSql = "
            SELECT
              SUM(t.totalamount) AS totalAmount,
              COUNT(DISTINCT t.id) AS donationCount
            FROM {$transactionsTable} t
            {$baseWhere}
        ";

        $agg = DB::selectOne($aggSql, $bindings) ?? ['totalAmount' => 0, 'donationCount' => 0];

        if ($granularity === 'weekly') {
            $trendSql = "
                SELECT
                  YEARWEEK(t.date, 3) AS period,
                  MIN(DATE(t.date)) AS day,
                  SUM(t.totalamount) AS amount,
                  COUNT(DISTINCT t.id) AS count
                FROM {$transactionsTable} t
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
                FROM {$transactionsTable} t
                {$baseWhere}
                GROUP BY DATE(t.date)
                ORDER BY period ASC
            ";
        }

        $trendRows = DB::select($trendSql, $bindings);
        $trend = collect($trendRows)->map(function ($r) {
            return [
                'period' => $r->period,
                'amount' => (float)($r->amount ?? 0),
                'count' => (int)($r->count ?? 0),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'totalAmount' => (float)($agg->totalAmount ?? 0),
                'totalCount' => (int)($agg->donationCount ?? 0),
                'trendData' => $trend,
            ],
            'meta' => [
                'kind' => $kind,
                'granularity' => $granularity,
                'filters' => [
                    'appealIds' => $appealIds,
                    'fundIds' => $fundIds,
                    'frequency' => $frequency,
                ],
                'start' => $startBound,
                'end' => $endBound,
            ],
        ]);
    }

    private function csvToIntArray(string $csv): array
    {
        return collect(explode(',', $csv))
            ->map(fn ($v) => (int)$v)
            ->filter(fn ($v) => $v > 0)
            ->values()
            ->all();
    }

    private function buildBounds(string $startDate, string $endDate): array
    {
        try {
            $start = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay()->format('Y-m-d H:i:s.u');
            $end = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay()->format('Y-m-d H:i:s.u');
            return [$start, $end];
        } catch (\Throwable) {
            return [null, null];
        }
    }

    private function frequencyConditions(string $kind, string $frequency): array
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
}
