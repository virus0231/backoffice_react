<?php

namespace App\Services;

use App\Repositories\Contracts\CountryAnalyticsRepositoryInterface;
use Illuminate\Support\Collection;

class CountryAnalyticsService
{
    public function __construct(
        protected CountryAnalyticsRepositoryInterface $countryAnalyticsRepository
    ) {
    }

    public function getCountryAnalytics(array $params): array
    {
        $startDate = $params['startDate'] ?? null;
        $endDate = $params['endDate'] ?? null;
        $metric = $params['metric'] ?? 'chart';
        $granularity = $params['granularity'] ?? 'daily';
        $appealIds = $this->csvToIntArray($params['appealId'] ?? '');
        $fundIds = $this->csvToIntArray($params['fundId'] ?? '');

        if (!$startDate || !$endDate) {
            return ['success' => false, 'data' => [], 'count' => 0, 'message' => 'startDate and endDate are required', 'error' => 'validation'];
        }

        if (!in_array($metric, ['chart', 'table'], true)) {
            return ['success' => false, 'data' => [], 'count' => 0, 'message' => 'Invalid metric parameter. Use "chart" or "table"', 'error' => 'validation'];
        }

        if ($metric === 'chart' && !in_array($granularity, ['daily', 'weekly'], true)) {
            $granularity = 'daily';
        }

        $filters = [
            'startDate' => $startDate,
            'endDate' => $endDate,
            'metric' => $metric,
            'granularity' => $granularity,
            'appealIds' => $appealIds,
            'fundIds' => $fundIds,
        ];

        $rows = $this->countryAnalyticsRepository->getCountryAnalytics($filters);

        if ($metric === 'chart') {
            $data = [
                'metric' => 'chart',
                'granularity' => $granularity,
                'chartData' => $rows,
            ];
        } else {
            $data = [
                'metric' => 'table',
                'tableData' => $rows,
            ];
        }

        return [
            'success' => true,
            'data' => $data,
            'count' => $this->countRows($rows),
            'message' => 'Retrieved country analytics',
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
        if ($rows instanceof Collection) {
            return $rows->count();
        }

        return count($rows);
    }
}
