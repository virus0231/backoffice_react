<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface CountryRepositoryInterface extends RepositoryInterface
{
    public function getAllCountries(): Collection;

    public function updateCountry(int $id, array $data): bool;

    public function createCountry(array $data): int;
}
