<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DigitalMarketingRepositoryInterface extends RepositoryInterface
{
    public function track(array $data): Collection;
}
