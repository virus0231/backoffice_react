<?php

namespace App\Services;

use App\Repositories\Contracts\PermissionRepositoryInterface;
use Illuminate\Support\Collection;

class PermissionService
{
    public function __construct(
        protected PermissionRepositoryInterface $permissionRepository
    ) {
    }

    public function getRoles(): array
    {
        $rows = $this->permissionRepository->getRoles();

        $data = $rows->map(function ($r) {
            return [
                'id' => $r->id ?? null,
                'user_role' => $r->user_role ?? '',
            ];
        });

        return [
            'success' => true,
            'data' => $data,
            'message' => 'Retrieved roles',
            'error' => null,
        ];
    }

    public function getPermissions(int $roleId): array
    {
        if ($roleId <= 0) {
            return ['success' => false, 'permissions' => [], 'message' => 'role_id is required', 'error' => 'validation'];
        }

        $rows = $this->permissionRepository->getPermissionsByRole($roleId);

        return [
            'success' => true,
            'permissions' => $rows->map(fn ($v) => (int) $v)->values(),
            'message' => 'Retrieved permissions',
            'error' => null,
        ];
    }

    public function updatePermissions(int $roleId, array $permissionIds): array
    {
        if ($roleId <= 0) {
            return ['success' => false, 'message' => 'role_id is required', 'error' => 'validation'];
        }

        $this->permissionRepository->updateRolePermissions($roleId, $permissionIds);

        return ['success' => true, 'message' => 'Permissions updated successfully', 'error' => null];
    }
}
