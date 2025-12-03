<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface DonorSegmentationRepositoryInterface extends RepositoryInterface
{
    public function getSegments(): Collection;
}
