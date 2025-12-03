<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface PermissionRepositoryInterface extends RepositoryInterface
{
    public function getRoles(): Collection;

    public function getPermissionsByRole(int $roleId): Collection;

    public function updateRolePermissions(int $roleId, array $permissionIds): void;
}
