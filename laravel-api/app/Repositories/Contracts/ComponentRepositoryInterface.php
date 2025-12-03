<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface ComponentRepositoryInterface extends RepositoryInterface
{
    public function getAll(array $params = []): Collection;

    public function findByIdArray(int $id): ?array;

    public function createComponent(array $data): array;

    public function updateComponent(int $id, array $data): array;

    public function deleteComponent(int $id): bool;
}
