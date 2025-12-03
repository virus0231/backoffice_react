<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface ConfigurationRepositoryInterface extends RepositoryInterface
{
    public function getAll(array $params = []): Collection;

    public function findByIdArray(int $id): ?array;

    public function createConfiguration(array $data): array;

    public function updateConfiguration(int $id, array $data): array;

    public function deleteConfiguration(int $id): bool;
}
