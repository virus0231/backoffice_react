<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FundAnalyticsRepositoryInterface extends RepositoryInterface
{
    public function getFundAnalytics(array $filters): Collection;
}
