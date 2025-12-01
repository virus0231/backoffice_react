<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PermissionController extends Controller
{
    public function roles(): JsonResponse
    {
        $roleTable = TableResolver::firstExisting(['pw_user_role', 'wp_yoc_user_role']) ?? TableResolver::prefixed('user_role');
        $rows = $roleTable ? DB::table($roleTable)->where('id', '!=', 1)->orderBy('id')->get() : collect();

        $data = $rows->map(function ($r) {
            return [
                'id' => $r->id ?? null,
                'user_role' => $r->user_role ?? '',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function list(): JsonResponse
    {
        $roleId = request()->input('role_id');
        if (!$roleId) {
            return response()->json(['success' => false, 'message' => 'role_id is required'], 400);
        }

        $rolePermTable = TableResolver::firstExisting(['pw_role_permissions', 'wp_yoc_role_permissions']) ?? TableResolver::prefixed('role_permissions');
        if (!$rolePermTable) {
            return response()->json(['success' => true, 'permissions' => []]);
        }

        $rows = DB::table($rolePermTable)->where('role_id', $roleId)->pluck('permission_id');

        return response()->json([
            'success' => true,
            'permissions' => $rows->map(fn ($v) => (int)$v)->values(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $roleId = $request->input('role_id');
        $permissions = $request->input('permissions', []);
        if (!$roleId) {
            return response()->json(['success' => false, 'message' => 'role_id is required'], 400);
        }

        $rolePermTable = TableResolver::firstExisting(['pw_role_permissions', 'wp_yoc_role_permissions']) ?? TableResolver::prefixed('role_permissions');
        if (!$rolePermTable) {
            return response()->json(['success' => false, 'message' => 'Role permissions table not found'], 500);
        }

        DB::transaction(function () use ($rolePermTable, $roleId, $permissions) {
            DB::table($rolePermTable)->where('role_id', $roleId)->delete();
            if (!empty($permissions) && is_array($permissions)) {
                $rows = [];
                foreach ($permissions as $pid) {
                    $rows[] = ['role_id' => $roleId, 'permission_id' => (int)$pid];
                }
                DB::table($rolePermTable)->insert($rows);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Permissions updated successfully',
        ]);
    }
}
