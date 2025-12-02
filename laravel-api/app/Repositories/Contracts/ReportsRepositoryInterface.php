<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface ReportsRepositoryInterface extends RepositoryInterface
{
    /**
     * Campaigns report with pagination support.
     *
     * @return array{data: \Illuminate\Support\Collection, total: int}
     */
    public function getCampaignsData(array $filters): array;

    /**
     * Causes (appeals) report.
     */
    public function getCausesData(array $filters): Collection;

    /**
     * Funds report.
     */
    public function getFundsData(array $filters): Collection;
}
