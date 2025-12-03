<?php

namespace App\Repositories;

use App\Repositories\Contracts\DonorRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class DonorRepository implements DonorRepositoryInterface
{
    public function getPaginatedDonors(int $offset, int $limit, ?string $search): array
    {
        $table = TableResolver::prefixed('donors');
        $query = DB::table($table);

        if ($search !== null && $search !== '') {
            $like = '%' . $search . '%';
            $query->where(function ($q) use ($like) {
                $q->where('firstname', 'like', $like)
                    ->orWhere('lastname', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhere('phone', 'like', $like);
            });
        }

        $totalCount = null;
        if ($offset === 0) {
            $totalCount = (int) (clone $query)->count();
        }

        $rows = $query
            ->orderByDesc('id')
            ->offset($offset)
            ->limit($limit)
            ->get();

        return ['data' => $rows, 'totalCount' => $totalCount];
    }

    public function findDonorById(int $id): ?object
    {
        $table = TableResolver::prefixed('donors');
        return DB::table($table)->where('id', $id)->first();
    }

    public function createDonor(array $data): int
    {
        $table = TableResolver::prefixed('donors');
        return (int) DB::table($table)->insertGetId($data);
    }

    public function updateDonor(int $id, array $data): bool
    {
        $table = TableResolver::prefixed('donors');
        return (bool) DB::table($table)->where('id', $id)->update($data);
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
        $table = TableResolver::prefixed('donors');
        $id = $modelOrId instanceof Model ? $modelOrId->getKey() : $modelOrId;

        return (bool) DB::table($table)->where('id', $id)->delete();
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return new Paginator([], 0, $perPage);
    }
}
