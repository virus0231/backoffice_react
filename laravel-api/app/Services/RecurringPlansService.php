<?php

namespace App\Services;

use App\Repositories\Contracts\RecurringPlansRepositoryInterface;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class RecurringPlansService
{
    public function __construct(
        protected RecurringPlansRepositoryInterface $recurringPlansRepository
    ) {
    }

    public function getRecurringPlans(array $params): array
    {
        $metric = $params['metric'] ?? 'active-plans';
        $startDate = $params['startDate'] ?? null;
        $endDate = $params['endDate'] ?? null;

        if (!$startDate || !$endDate) {
            return ['success' => false, 'data' => [], 'message' => 'startDate and endDate are required', 'error' => 'validation'];
        }

        $trend = $this->buildDateSeries($startDate, $endDate, function ($date) use ($metric) {
            return [
                'date' => $date,
                'value' => 0,
                'metric' => $metric,
            ];
        });

        // Preserve stub behavior but keep repository hook for future expansion.
        $this->recurringPlansRepository->getRecurringPlans([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'metric' => $metric,
        ]);

        return [
            'success' => true,
            'data' => [
                'metric' => $metric,
                'trendData' => $trend,
            ],
            'message' => 'Retrieved recurring plans',
            'error' => null,
        ];
    }

    protected function buildDateSeries(string $startDate, string $endDate, callable $mapper): array
    {
        $series = [];
        try {
            $start = Carbon::createFromFormat('Y-m-d', $startDate);
            $end = Carbon::createFromFormat('Y-m-d', $endDate);
            for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                $series[] = $mapper($d->format('Y-m-d'));
            }
        } catch (\Throwable) {
            return [];
        }

        return $series;
    }
}
