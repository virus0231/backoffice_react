<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface PaymentMethodsRepositoryInterface extends RepositoryInterface
{
    public function getPaymentMethodsAnalytics(array $filters): Collection;
}
