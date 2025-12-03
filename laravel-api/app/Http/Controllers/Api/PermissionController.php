<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\UpdatePermissionRequest;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;

class PermissionController extends Controller
{
    public function __construct(private readonly PermissionService $permissionService)
    {
    }

    public function roles(): JsonResponse
    {
        $result = $this->permissionService->getRoles();
        return response()->json($result, 200);
    }

    public function list(): JsonResponse
    {
        $roleId = (int) request()->input('role_id', 0);
        $result = $this->permissionService->getPermissions($roleId);
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }

    public function update(UpdatePermissionRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $roleId = (int) ($validated['role_id'] ?? 0);
        $permissions = $validated['permissions'] ?? [];

        $result = $this->permissionService->updatePermissions($roleId, is_array($permissions) ? $permissions : []);
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }
}
