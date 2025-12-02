<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FiltersRepositoryInterface extends RepositoryInterface
{
    public function getAllAppeals(): Collection;

    public function getFundsByAppealIds(array $appealIds): Collection;

    public function getAllCategories(): Collection;

    public function getAllCountries(): Collection;
}
