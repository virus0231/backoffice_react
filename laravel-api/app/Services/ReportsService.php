<?php

namespace App\Services;

use App\Repositories\Contracts\ReportsRepositoryInterface;
use Illuminate\Support\Collection;

class ReportsService
{
    public function __construct(
        protected ReportsRepositoryInterface $reportsRepository
    ) {
    }

    public function getCampaignsReport(array $queryParams): array
    {
        $filters = [
            'campaigns' => $queryParams['campaigns'] ?? null,
            'fromDate' => $queryParams['from_date'] ?? null,
            'toDate' => $queryParams['to_date'] ?? null,
            'donorEmail' => $queryParams['donor_email'] ?? null,
            'page' => max(1, (int) ($queryParams['page'] ?? 1)),
            'perPage' => max(1, min(100, (int) ($queryParams['per_page'] ?? 25))),
        ];

        $result = $this->reportsRepository->getCampaignsData($filters);

        $data = $result['data']->map(function ($r) {
            return [
                'name' => $r->campaign_name ?? 'Unknown',
                'totalAmount' => (float) $r->total_amount,
                'donations' => (int) $r->donation_count,
            ];
        });

        return [
            'data' => $data,
            'count' => $data->count(),
            'total' => (int) $result['total'],
            'page' => $filters['page'],
            'per_page' => $filters['perPage'],
            'total_amount' => array_sum($result['data']->pluck('total_amount')->all()),
        ];
    }

    public function getCausesReport(array $queryParams): array
    {
        $filters = [
            'appealId' => $queryParams['appeal_id'] ?? null,
            'categoryId' => $queryParams['category_id'] ?? null,
            'country' => $queryParams['country'] ?? null,
            'minAmount' => $queryParams['min_amount'] ?? null,
            'maxAmount' => $queryParams['max_amount'] ?? null,
        ];

        $rows = $this->reportsRepository->getCausesData($filters);

        $filteredRows = $rows->filter(function ($row) use ($filters) {
            $amount = (float) $row->total_amount;
            if ($filters['minAmount'] !== null && $amount < (float) $filters['minAmount']) {
                return false;
            }
            if ($filters['maxAmount'] !== null && $amount > (float) $filters['maxAmount']) {
                return false;
            }
            return true;
        });

        $data = $filteredRows->map(function ($r) {
            return [
                'id' => (int) $r->id,
                'appeal' => $r->appeal_name,
                'amount' => (float) ($r->total_amount ?? 0),
                'fundList' => $r->fund_names ?? 'N/A',
                'category' => $r->category_name ?? 'N/A',
                'country' => $r->country ?? 'N/A',
                'donations' => (int) $r->donation_count,
            ];
        });

        return [
            'data' => $data,
            'count' => $data->count(),
            'total_amount' => $filteredRows->sum('total_amount'),
        ];
    }

    public function getFundsReport(array $queryParams): array
    {
        $filters = [
            'fundId' => $queryParams['fund_id'] ?? null,
            'fromDate' => $queryParams['from_date'] ?? null,
            'toDate' => $queryParams['to_date'] ?? null,
        ];

        $rows = $this->reportsRepository->getFundsData($filters);

        $data = $rows->map(function ($r) {
            return [
                'id' => (int) $r->id,
                'name' => $r->fund_name ?? 'Unknown Fund',
                'totalAmount' => (float) ($r->total_amount ?? 0),
                'donations' => (int) $r->donation_count,
            ];
        });

        return [
            'data' => $data,
            'count' => $data->count(),
            'total_amount' => $rows->sum('total_amount'),
        ];
    }

    public function getMonthlyReport(): array
    {
        return [
            'stats' => [
                'thisMonth' => 0,
                'allTime' => 0,
                'failedDonors' => 0,
                'lastFailedDate' => 'N/A',
            ],
            'monthlyGrowth' => [],
            'activeDonors' => [],
        ];
    }
}
