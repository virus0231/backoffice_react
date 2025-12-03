<?php

namespace App\Services;

use App\Repositories\Contracts\FundAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;

class FundAnalyticsService
{
    public function __construct(
        protected FundAnalyticsRepositoryInterface $fundAnalyticsRepository
    ) {
    }

    public function getFundAnalytics(array $params): array
    {
        $startDate = $params['startDate'] ?? null;
        $endDate = $params['endDate'] ?? null;
        $granularity = $params['granularity'] ?? 'daily';
        $metric = $params['metric'] ?? 'chart';
        $appealIds = $this->csvToIntArray($params['appealId'] ?? '');

        if (!$startDate || !$endDate) {
            return ['success' => false, 'data' => [], 'count' => 0, 'message' => 'startDate and endDate are required', 'error' => 'validation'];
        }

        if (!in_array($metric, ['chart', 'table'], true)) {
            return ['success' => false, 'data' => [], 'count' => 0, 'message' => 'Invalid metric parameter. Use "chart" or "table"', 'error' => 'validation'];
        }

        if ($metric === 'chart' && !in_array($granularity, ['daily', 'weekly'], true)) {
            $granularity = 'daily';
        }

        $rows = $this->fundAnalyticsRepository->getFundAnalytics([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'metric' => $metric,
            'granularity' => $granularity,
            'appealIds' => $appealIds,
        ]);

        $data = $metric === 'chart'
            ? ['metric' => 'chart', 'granularity' => $granularity, 'chartData' => $rows]
            : ['metric' => 'table', 'tableData' => $rows];

        return [
            'success' => true,
            'data' => $data,
            'count' => $this->countRows($rows),
            'message' => 'Retrieved fund analytics',
            'error' => null,
        ];
    }

    protected function csvToIntArray(string $csv): array
    {
        return collect(explode(',', $csv))
            ->map(fn ($v) => (int)$v)
            ->filter(fn ($v) => $v > 0)
            ->values()
            ->all();
    }

    protected function countRows(Collection|array $rows): int
    {
        return $rows instanceof Collection ? $rows->count() : count($rows);
    }
}
