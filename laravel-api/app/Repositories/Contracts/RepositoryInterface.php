<?php

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface RepositoryInterface
{
    public function findById(int|string $id): ?Model;

    public function create(array $data): Model;

    public function update(Model|int|string $modelOrId, array $data): Model;

    public function delete(Model|int|string $modelOrId): bool;

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;
}
