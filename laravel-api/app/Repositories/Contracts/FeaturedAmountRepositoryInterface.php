<?php

namespace App\Repositories\Contracts;

interface FeaturedAmountRepositoryInterface extends RepositoryInterface
{
    public function findAmountById(int $id): ?object;

    public function updateFeaturedStatus(int $id, int $featured): bool;
}
