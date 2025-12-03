<?php

namespace App\Repositories;

use App\Repositories\Contracts\CountryRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class CountryRepository implements CountryRepositoryInterface
{
    public function getAllCountries(): Collection
    {
        $table = TableResolver::prefixed('country');

        return DB::table($table)
            ->orderBy('name')
            ->get();
    }

    public function updateCountry(int $id, array $data): bool
    {
        $table = TableResolver::prefixed('country');

        return (bool) DB::table($table)->where('id', $id)->update($data);
    }

    public function createCountry(array $data): int
    {
        $table = TableResolver::prefixed('country');

        return (int) DB::table($table)->insertGetId($data);
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
