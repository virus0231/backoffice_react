<?php

namespace App\Services;

use App\Repositories\Contracts\DayTimeRepositoryInterface;
use Illuminate\Support\Collection;

class DayTimeService
{
    public function __construct(
        protected DayTimeRepositoryInterface $dayTimeRepository
    ) {
    }

    public function getDayTimeAnalytics(array $params): array
    {
        $startDate = $params['startDate'] ?? null;
        $endDate = $params['endDate'] ?? null;
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

        $rows = $this->dayTimeRepository->getDayTimeAnalytics([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'appealIds' => $appealIds,
            'fundIds' => $fundIds,
        ]);

        return [
            'success' => true,
            'data' => ['heatmapData' => $rows],
            'count' => $this->countRows($rows),
            'message' => 'Retrieved day/time analytics',
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
