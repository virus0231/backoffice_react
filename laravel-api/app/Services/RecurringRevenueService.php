<?php

namespace App\Services;

use App\Repositories\Contracts\RecurringRevenueRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RecurringRevenueService
{
    public function __construct(
        protected RecurringRevenueRepositoryInterface $recurringRevenueRepository
    ) {
    }

    public function getRecurringRevenue(array $params): array
    {
        $metric = $params['metric'] ?? 'mrr';
        $startDate = $params['startDate'] ?? null;
        $endDate = $params['endDate'] ?? null;

        if (!$startDate || !$endDate) {
            return ['success' => false, 'data' => [], 'message' => 'startDate and endDate are required', 'error' => 'validation'];
        }

        $trend = $this->buildDateSeries($startDate, $endDate, function ($date) use ($metric) {
            return [
                'date' => $date,
                'value' => 0,
                'mrr' => 0,
                'metric' => $metric,
            ];
        });

        $this->recurringRevenueRepository->getRecurringRevenue([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'metric' => $metric,
        ]);

        if ($metric === 'donation-amounts') {
            return [
                'success' => true,
                'data' => [
                    'metric' => $metric,
                    'trendData' => [],
                ],
                'message' => 'Retrieved recurring revenue',
                'error' => null,
            ];
        }

        return [
            'success' => true,
            'data' => [
                'metric' => $metric,
                'trendData' => $trend,
            ],
            'message' => 'Retrieved recurring revenue',
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
