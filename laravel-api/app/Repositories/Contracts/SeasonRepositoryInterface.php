<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface SeasonRepositoryInterface extends RepositoryInterface
{
    public function getSeasonDates(): Collection;
}
