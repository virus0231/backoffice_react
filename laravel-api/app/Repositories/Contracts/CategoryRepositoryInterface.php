<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface CategoryRepositoryInterface extends RepositoryInterface
{
    public function getAllCategories(): Collection;

    public function updateCategory(int $id, array $data): bool;

    public function createCategory(array $data): int;
}
