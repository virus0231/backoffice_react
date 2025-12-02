<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FundRepositoryInterface extends RepositoryInterface
{
    public function getFundsByAppealId(int $appealId): Collection;

    public function updateFund(int $id, array $data): bool;

    public function createFund(array $data): int;
}
