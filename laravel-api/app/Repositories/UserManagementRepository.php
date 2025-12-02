<?php

namespace App\Repositories;

use App\Repositories\Contracts\UserManagementRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class UserManagementRepository implements UserManagementRepositoryInterface
{
    public function getAllUsersWithRoles(): Collection
    {
        $userTable = TableResolver::prefixed('users');
        $roleTable = TableResolver::firstExisting(['pw_user_role', 'wp_yoc_user_role']) ?? TableResolver::prefixed('user_role');

        $query = DB::table($userTable);
        if ($roleTable) {
            $query->leftJoin($roleTable, "{$roleTable}.id", '=', "{$userTable}.user_role");
            $select = ["{$userTable}.*", DB::raw("{$roleTable}.user_role AS role_name")];
        } else {
            $select = ["{$userTable}.*"];
        }

        return $query->select($select)->where("{$userTable}.user_role", '!=', 1)->get();
    }

    public function findUserByUsernameOrEmail(string $username, string $email): bool
    {
        $userTable = TableResolver::prefixed('users');

        return DB::table($userTable)
            ->where(function ($q) use ($username, $email) {
                $q->where('user_login', $username)->orWhere('user_email', $email);
            })->exists();
    }

    public function createUser(array $data): int
    {
        $userTable = TableResolver::prefixed('users');
        return (int) DB::table($userTable)->insertGetId($data);
    }

    public function updateUser(int $id, array $data): bool
    {
        $userTable = TableResolver::prefixed('users');
        return (bool) DB::table($userTable)->where('ID', $id)->update($data);
    }

    public function updateUserStatus(int $id, int $status): bool
    {
        $userTable = TableResolver::prefixed('users');
        return (bool) DB::table($userTable)->where('ID', $id)->update(['user_status' => $status]);
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
