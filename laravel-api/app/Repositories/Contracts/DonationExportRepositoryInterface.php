<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DonationExportRepositoryInterface extends RepositoryInterface
{
    public function getCountWithFilters(array $filters): int;

    public function getPaginatedData(array $filters, int $offset, int $limit): Collection;

    public function getSummaryData(array $filters): Collection;

    public function getDetailData(array $filters): Collection;
}
