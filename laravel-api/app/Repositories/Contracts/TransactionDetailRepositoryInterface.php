<?php

namespace App\Repositories\Contracts;

interface TransactionDetailRepositoryInterface extends RepositoryInterface
{
    public function createTransactionDetail(array $data): int;
}
