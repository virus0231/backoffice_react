<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface RecurringRevenueRepositoryInterface extends RepositoryInterface
{
    public function getRecurringRevenue(array $filters): Collection;
}
