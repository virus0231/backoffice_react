<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FrequenciesRepositoryInterface extends RepositoryInterface
{
    public function getFrequenciesAnalytics(array $filters): Collection;
}
