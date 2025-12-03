<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface RetentionRepositoryInterface extends RepositoryInterface
{
    public function getRetention(array $filters): Collection;
}
