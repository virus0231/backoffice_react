<?php

namespace App\Repositories\Contracts;

use App\Models\Donor;
use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface DonorRepositoryInterface extends RepositoryInterface
{
    public function paginate(array $filters = [], int $perPage = 50): LengthAwarePaginator;

    public function findById(int $id): ?Donor;

    public function create(array $data): Donor;

    public function update(int $id, array $data): ?Donor;

    public function delete(int $id): bool;

    public function search(string $term, int $limit = 25): Collection;

    public function findByEmail(string $email): ?Donor;
}
