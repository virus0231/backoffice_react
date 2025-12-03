<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface CrmIntegrationRepositoryInterface extends RepositoryInterface
{
    public function sync(array $data): Collection;
}
