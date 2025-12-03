<?php

namespace App\Repositories;

use App\Repositories\Contracts\PermissionRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class PermissionRepository implements PermissionRepositoryInterface
{
    public function getRoles(): Collection
    {
        $roleTable = TableResolver::firstExisting(['pw_user_role', 'wp_yoc_user_role']) ?? TableResolver::prefixed('user_role');

        if (!$roleTable) {
            return collect();
        }

        return DB::table($roleTable)
            ->where('id', '!=', 1)
            ->orderBy('id')
            ->get();
    }

    public function getPermissionsByRole(int $roleId): Collection
    {
        $rolePermTable = TableResolver::firstExisting(['pw_role_permissions', 'wp_yoc_role_permissions']) ?? TableResolver::prefixed('role_permissions');

        if (!$rolePermTable) {
            return collect();
        }

        return DB::table($rolePermTable)
            ->where('role_id', $roleId)
            ->pluck('permission_id');
    }

    public function updateRolePermissions(int $roleId, array $permissionIds): void
    {
        $rolePermTable = TableResolver::firstExisting(['pw_role_permissions', 'wp_yoc_role_permissions']) ?? TableResolver::prefixed('role_permissions');

        if (!$rolePermTable) {
            return;
        }

        DB::transaction(function () use ($rolePermTable, $roleId, $permissionIds) {
            DB::table($rolePermTable)->where('role_id', $roleId)->delete();
            if (!empty($permissionIds)) {
                $rows = [];
                foreach ($permissionIds as $pid) {
                    $rows[] = ['role_id' => $roleId, 'permission_id' => (int) $pid];
                }
                if (!empty($rows)) {
                    DB::table($rolePermTable)->insert($rows);
                }
            }
        });
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
