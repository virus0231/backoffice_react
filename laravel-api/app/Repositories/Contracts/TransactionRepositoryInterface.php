<?php

namespace App\Repositories\Contracts;

interface TransactionRepositoryInterface extends RepositoryInterface
{
    public function createTransaction(array $data): int;
}
