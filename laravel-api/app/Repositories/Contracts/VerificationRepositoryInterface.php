<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface VerificationRepositoryInterface extends RepositoryInterface
{
    public function verify(array $data): Collection;
}
