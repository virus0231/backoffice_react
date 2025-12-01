<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    protected function secret(): string
    {
        return env('BACKOFFICE_SECRET', 'backoffice-secret');
    }

    protected function userTable(): string
    {
        return TableResolver::prefixed('users');
    }

    public function login(Request $request): JsonResponse
    {
        $username = (string)$request->input('username_val', $request->input('username', ''));
        $password = (string)$request->input('password_val', $request->input('password', ''));

        if ($username === '' || $password === '') {
            return response()->json(['success' => false, 'message' => 'Missing credentials'], 400);
        }

        $userTable = $this->userTable();
        $user = DB::table($userTable)
            ->where('user_login', $username)
            ->where('user_status', '0')
            ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid username or password'], 401);
        }

        $expected = hash_hmac('sha256', $password, $this->secret());
        if (!hash_equals($expected, (string)$user->user_pass)) {
            return response()->json(['success' => false, 'message' => 'Invalid username or password'], 401);
        }

        // Store minimal session info for status checks
        session([
            'user_login' => $user->user_login,
            'user_role' => $user->user_role,
            'user_details' => [
                'username' => $user->user_login,
                'display_name' => $user->display_name ?? '',
                'role' => $user->user_role ?? '',
                'email' => $user->user_email ?? '',
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'username' => $user->user_login,
                'display_name' => $user->display_name ?? '',
                'role' => $user->user_role ?? '',
                'email' => $user->user_email ?? '',
            ],
        ]);
    }

    public function status(): JsonResponse
    {
        $details = session('user_details');
        if ($details) {
            return response()->json([
                'success' => true,
                'user' => $details,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Not authenticated',
        ], 401);
    }

    public function logout(): JsonResponse
    {
        session()->invalidate();
        session()->regenerateToken();
        return response()->json([
            'success' => true,
            'message' => 'Logged out',
        ]);
    }
}
