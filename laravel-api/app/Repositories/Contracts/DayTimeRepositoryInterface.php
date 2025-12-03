<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DayTimeRepositoryInterface extends RepositoryInterface
{
    public function getDayTimeAnalytics(array $filters): Collection;
}
