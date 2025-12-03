<?php

namespace App\Repositories;

use App\Repositories\Contracts\AppealRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class AppealRepository implements AppealRepositoryInterface
{
    public function getAllAppeals(): Collection
    {
        $table = TableResolver::prefixed('appeal');

        return DB::table($table)
            ->orderBy('sort')
            ->orderBy('id')
            ->get();
    }

    public function updateAppeal(int $id, array $data): bool
    {
        $table = TableResolver::prefixed('appeal');

        return (bool) DB::table($table)->where('id', $id)->update($data);
    }

    public function createAppeal(array $data): int
    {
        $table = TableResolver::prefixed('appeal');

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
