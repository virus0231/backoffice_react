<?php

namespace App\Services;

use App\Repositories\Contracts\ScheduleRepositoryInterface;
use Illuminate\Support\Collection;

class ScheduleService
{
    public function __construct(
        protected ScheduleRepositoryInterface $scheduleRepository
    ) {
    }

    public function getPaginatedSchedules(array $queryParams): array
    {
        $filters = $this->mapFilters($queryParams);

        $result = $this->scheduleRepository->getPaginatedSchedules($filters);
        $data = $result['data']->map(fn ($r) => $this->formatRow($r));

        return [
            'data' => $data,
            'count' => $data->count(),
            'totalCount' => $result['totalCount'],
        ];
    }

    public function getSchedulesForExport(array $queryParams): array
    {
        $filters = $this->mapFilters($queryParams);
        $rows = $this->scheduleRepository->getAllSchedulesForExport($filters);

        return $rows->map(function ($row) {
            return [
                $row->order_id,
                $row->start_date,
                $row->firstname ?? '',
                $row->lastname ?? '',
                $row->email ?? '',
                $row->phone ?? '',
                $row->amount,
                $row->frequency,
                $row->status,
                $row->payment_method ?? '',
            ];
        })->all();
    }

    protected function mapFilters(array $queryParams): array
    {
        return [
            'status' => $queryParams['status'] ?? null,
            'fromDate' => $queryParams['from_date'] ?? null,
            'toDate' => $queryParams['to_date'] ?? null,
            'search' => $queryParams['search'] ?? null,
            'frequency' => $queryParams['frequency'] ?? null,
            'offset' => (int) ($queryParams['offset'] ?? 0),
            'limit' => (int) ($queryParams['limit'] ?? 500),
        ];
    }

    protected function formatRow(object $r): array
    {
        return [
            'id' => (int) $r->id,
            'order_id' => $r->order_id,
            'donationType' => $r->donation_type ?? 'N/A',
            'startDate' => $r->start_date,
            'name' => trim(($r->firstname ?? '') . ' ' . ($r->lastname ?? '')) ?: 'N/A',
            'email' => $r->email ?? 'N/A',
            'phone' => $r->phone ?? 'N/A',
            'amount' => (float) $r->amount,
            'frequency' => $r->frequency_name,
            'status' => $r->status,
        ];
    }
}
