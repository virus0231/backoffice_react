<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface ScheduleRepositoryInterface extends RepositoryInterface
{
    /**
     * Get paginated schedules with filters.
     *
     * @param array $filters Keys: status, fromDate, toDate, search, frequency, offset, limit
     * @return array{data: Collection, totalCount: int|null}
     */
    public function getPaginatedSchedules(array $filters): array;

    /**
     * Get all schedules for CSV export (no pagination).
     *
     * @param array $filters Keys: status, fromDate, toDate, search, frequency
     * @return Collection
     */
    public function getAllSchedulesForExport(array $filters): Collection;

    public function createSchedule(array $data): int;
}
