<?php

namespace App\Repositories;

use App\Repositories\Contracts\FiltersRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class FiltersRepository implements FiltersRepositoryInterface
{
    public function getAllAppeals(): Collection
    {
        $table = TableResolver::prefixed('appeal');
        return DB::table($table)->get();
    }

    public function getFundsByAppealIds(array $appealIds): Collection
    {
        $table = TableResolver::prefixed('fundlist');
        $query = DB::table($table);

        if (!empty($appealIds)) {
            $query->whereIn('appeal_id', $appealIds);
        }

        return $query->get();
    }

    public function getAllCategories(): Collection
    {
        $table = TableResolver::prefixed('category');
        return DB::table($table)->orderBy('name')->get(['id', 'name']);
    }

    public function getAllCountries(): Collection
    {
        $table = TableResolver::prefixed('country');
        return DB::table($table)->orderBy('name')->get(['id', 'name']);
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
