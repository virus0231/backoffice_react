<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface AppealRepositoryInterface extends RepositoryInterface
{
    public function getAllAppeals(): Collection;

    public function updateAppeal(int $id, array $data): bool;

    public function createAppeal(array $data): int;
}
