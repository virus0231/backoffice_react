<?php

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface AnalyticsRepositoryInterface extends RepositoryInterface
{
    /**
     * Return aggregated transaction totals within the date range / filters.
     */
    public function getTransactionsByDateRange(array $filters): Collection;

    /**
     * Return trend data (daily/weekly aggregates) within the date range / filters.
     */
    public function getTrendData(array $filters): Collection;
}
