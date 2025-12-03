<?php

namespace App\Repositories;

use App\Repositories\Contracts\FeaturedAmountRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class FeaturedAmountRepository implements FeaturedAmountRepositoryInterface
{
    public function findAmountById(int $id): ?object
    {
        $table = TableResolver::prefixed('amount');
        return DB::table($table)->where('id', $id)->first();
    }

    public function updateFeaturedStatus(int $id, int $featured): bool
    {
        $table = TableResolver::prefixed('amount');
        return (bool) DB::table($table)->where('id', $id)->update(['featured' => $featured]);
    }

    /* --- RepositoryInterface compatibility (not used here) --- */
    public function findById(int|string $id): ?Model
    {
        return null;
    }

    public function create(array $data): Model
    {
        return new Model();
    }

    public function update(Model|int|string $modelOrId, array $data): Model
    {
        return $modelOrId instanceof Model ? $modelOrId : new Model();
    }

    public function delete(Model|int|string $modelOrId): bool
    {
        return false;
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return new Paginator([], 0, $perPage);
    }
}
