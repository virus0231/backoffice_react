<?php

namespace App\Services;

use App\Repositories\Contracts\FrequenciesRepositoryInterface;
use Illuminate\Support\Collection;

class FrequenciesService
{
    public function __construct(
        protected FrequenciesRepositoryInterface $frequenciesRepository
    ) {
    }

    public function getFrequenciesAnalytics(array $params): array
    {
        $startDate = $params['startDate'] ?? null;
        $endDate = $params['endDate'] ?? null;
        $metric = $params['metric'] ?? 'chart';
        $appealIds = $this->csvToIntArray($params['appealId'] ?? '');
        $fundIds = $this->csvToIntArray($params['fundId'] ?? '');

        if (!$startDate || !$endDate) {
            return [
                'success' => false,
                'data' => [],
                'count' => 0,
                'message' => 'startDate and endDate are required',
                'error' => 'validation',
            ];
        }

        if (!in_array($metric, ['chart', 'table'], true)) {
            return [
                'success' => false,
                'data' => [],
                'count' => 0,
                'message' => 'Invalid metric parameter. Use "chart" or "table"',
                'error' => 'validation',
            ];
        }

        $rows = $this->frequenciesRepository->getFrequenciesAnalytics([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'metric' => $metric,
            'appealIds' => $appealIds,
            'fundIds' => $fundIds,
        ]);

        $data = $metric === 'chart'
            ? ['metric' => 'chart', 'chartData' => $rows]
            : ['metric' => 'table', 'tableData' => $rows];

        return [
            'success' => true,
            'data' => $data,
            'count' => $this->countRows($rows),
            'message' => 'Retrieved frequencies analytics',
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
