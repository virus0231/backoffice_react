<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface ExportOptimizedRepositoryInterface extends RepositoryInterface
{
    public function export(array $filters): Collection;
}
