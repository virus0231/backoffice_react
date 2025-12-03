<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface RecurringPlansRepositoryInterface extends RepositoryInterface
{
    public function getRecurringPlans(array $filters): Collection;
}
