<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DonorRepositoryInterface extends RepositoryInterface
{
    public function getPaginatedDonors(int $offset, int $limit, ?string $search): array;

    public function findDonorById(int $id): ?object;

    public function createDonor(array $data): int;

    public function updateDonor(int $id, array $data): bool;
}
