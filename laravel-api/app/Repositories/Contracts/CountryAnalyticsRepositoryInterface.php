<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface CountryAnalyticsRepositoryInterface extends RepositoryInterface
{
    public function getCountryAnalytics(array $filters): Collection;
}
