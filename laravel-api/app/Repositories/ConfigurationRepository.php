<?php

namespace App\Repositories;

use App\Repositories\Contracts\ConfigurationRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ConfigurationRepository implements ConfigurationRepositoryInterface
{
    protected string $table;

    public function __construct()
    {
        $this->table = TableResolver::prefixed('configuration');
    }

    public function getAll(array $params = []): Collection
    {
        $query = DB::table($this->table);

        if (!empty($params['group'])) {
            $query->where('group', $params['group']);
        }

        return $query->orderBy('sort', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($item) => (array) $item);
    }

    public function findByIdArray(int $id): ?array
    {
        $row = DB::table($this->table)->where('id', $id)->first();
        return $row ? (array) $row : null;
    }

    public function createConfiguration(array $data): array
    {
        $id = DB::table($this->table)->insertGetId($data);
        return $this->findByIdArray($id) ?? [];
    }

    public function updateConfiguration(int $id, array $data): array
    {
        DB::table($this->table)->where('id', $id)->update($data);
        return $this->findByIdArray($id) ?? [];
    }

    public function deleteConfiguration(int $id): bool
    {
        return (bool) DB::table($this->table)->where('id', $id)->delete();
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
