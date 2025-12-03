<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface AmountRepositoryInterface extends RepositoryInterface
{
    public function getAmountsByAppealId(int $appealId): Collection;

    public function updateAmount(int $id, array $data): bool;

    public function createAmount(array $data): int;

    public function findAmountById(int $id): ?object;

    public function updateAmountStatus(int $id, int $disable): bool;
}
