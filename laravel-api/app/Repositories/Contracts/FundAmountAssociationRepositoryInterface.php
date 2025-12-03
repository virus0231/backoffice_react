<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface FundAmountAssociationRepositoryInterface extends RepositoryInterface
{
    public function getAmountsByAppeal(int $appealId): Collection;

    public function getFundsByAppeal(int $appealId): Collection;

    public function getAssociationsByAppeal(int $appealId): Collection;

    public function replaceAssociations(int $appealId, array $associations): void;
}
