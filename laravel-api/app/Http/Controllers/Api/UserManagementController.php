<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserManagementController extends Controller
{
    public function index(): JsonResponse
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

        // hide superadmin (role id = 1) to mirror legacy behaviour
        $rows = $query->select($select)->where("{$userTable}.user_role", '!=', 1)->get();

        $data = $rows->map(function ($u) {
            return [
                'id' => $u->ID ?? $u->id ?? null,
                'username' => $u->user_login ?? '',
                'display_name' => $u->display_name ?? ($u->user_login ?? ''),
                'email' => $u->user_email ?? '',
                'role_id' => isset($u->user_role) ? (int)$u->user_role : null,
                'user_role' => isset($u->user_role) ? (int)$u->user_role : null, // legacy key for frontend
                'role_name' => $u->role_name ?? ($u->user_role ?? ''),
                'user_registered' => $u->user_registered ?? '',
                'user_status' => isset($u->user_status) ? (int)$u->user_status : 0,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $userTable = TableResolver::prefixed('users');
        $username = trim((string)$request->input('username', ''));
        $display = trim((string)$request->input('display_name', $username));
        $email = trim((string)$request->input('email', ''));
        $password = (string)$request->input('password', '');
        $role = (string)$request->input('role_id', '');

        if ($username === '' || $email === '' || $password === '') {
            return response()->json(['success' => false, 'error' => 'username, email, password required'], 400);
        }

        // Prevent creating superadmin via UI
        if ((int)$role === 1) {
            return response()->json(['success' => false, 'error' => 'Not allowed'], 403);
        }

        $existing = DB::table($userTable)
            ->where(function ($q) use ($username, $email) {
                $q->where('user_login', $username)->orWhere('user_email', $email);
            })->exists();

        if ($existing) {
            return response()->json(['success' => false, 'error' => 'User exists'], 400);
        }

        $hash = hash_hmac('sha256', $password, env('BACKOFFICE_SECRET', 'backoffice-secret'));
        $now = now()->format('Y-m-d H:i:s');

        $id = DB::table($userTable)->insertGetId([
            'user_login' => $username,
            'display_name' => $display,
            'user_pass' => $hash,
            'user_role' => $role,
            'user_email' => $email,
            'user_registered' => $now,
            'user_status' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created',
            'data' => ['id' => $id],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $userTable = TableResolver::prefixed('users');
        $payload = [
            'user_login' => trim((string)$request->input('username', '')),
            'display_name' => trim((string)$request->input('display_name', '')),
            'user_email' => trim((string)$request->input('email', '')),
            'user_role' => (string)$request->input('role_id', ''),
        ];

        if ($payload['user_login'] === '' || $payload['user_email'] === '') {
            return response()->json(['success' => false, 'error' => 'username and email required'], 400);
        }

        if ($request->filled('password')) {
            $payload['user_pass'] = hash_hmac('sha256', (string)$request->input('password'), env('BACKOFFICE_SECRET', 'backoffice-secret'));
        }

        DB::table($userTable)->where('ID', $id)->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'User updated',
        ]);
    }

    public function status(Request $request, int $id): JsonResponse
    {
        $userTable = TableResolver::prefixed('users');
        $status = $request->boolean('status', true);
        DB::table($userTable)->where('ID', $id)->update(['user_status' => $status ? 0 : 1]);

        return response()->json([
            'success' => true,
            'message' => 'User status updated',
        ]);
    }
}
