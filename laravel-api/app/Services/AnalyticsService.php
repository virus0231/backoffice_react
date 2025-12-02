<?php

namespace App\Services;

use App\Repositories\Contracts\AnalyticsRepositoryInterface;
use App\Support\TableResolver;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class AnalyticsService
{
    public function __construct(
        protected AnalyticsRepositoryInterface $analyticsRepository
    ) {
    }

    public function getAnalyticsData(string $kind, array $filters): array
    {
        $startDate = $filters['startDate'] ?? null;
        $endDate = $filters['endDate'] ?? null;
        $granularity = $filters['granularity'] ?? 'daily';
        $appealIds = $this->csvToIntArray($filters['appealId'] ?? '');
        $fundIds = $this->csvToIntArray($filters['fundId'] ?? '');
        $frequency = $filters['frequency'] ?? 'all';

        if (!$kind || !$startDate || !$endDate) {
            throw new InvalidArgumentException('Missing kind/startDate/endDate');
        }

        [$startBound, $endBound] = $this->buildBounds($startDate, $endDate);
        if (!$startBound || !$endBound) {
            throw new InvalidArgumentException('Invalid startDate/endDate format (expected YYYY-MM-DD)');
        }

        $repoFilters = [
            'kind' => $kind,
            'startBound' => $startBound,
            'endBound' => $endBound,
            'appealIds' => $appealIds,
            'fundIds' => $fundIds,
            'frequency' => $frequency,
            'granularity' => $granularity,
        ];

        $aggCollection = $this->analyticsRepository->getTransactionsByDateRange($repoFilters);
        $agg = $aggCollection->first() ?? (object) ['totalAmount' => 0, 'donationCount' => 0];

        $trendRows = $this->analyticsRepository->getTrendData($repoFilters);
        $trend = $trendRows->map(function ($r) {
            return [
                'period' => $r->period,
                'amount' => (float)($r->amount ?? 0),
                'count' => (int)($r->count ?? 0),
            ];
        });

        return [
            'totalAmount' => (float)($agg->totalAmount ?? 0),
            'totalCount' => (int)($agg->donationCount ?? 0),
            'trendData' => $trend,
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
        ];
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
}
