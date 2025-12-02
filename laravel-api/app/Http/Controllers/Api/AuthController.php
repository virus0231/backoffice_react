<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'username_val' => ['required', 'string'],
            'password_val' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $username = (string) $request->input('username_val');
        $password = (string) $request->input('password_val');

        $user = User::query()
            ->where('user_login', $username)
            ->where('user_status', 0)
            ->first();

        if (! $user) {
            return $this->invalidCredentials();
        }

        $stored = (string) $user->user_pass;
        $valid = false;

        if ($this->isLegacyHash($stored)) {
            $expected = hash_hmac('sha256', $password, $this->backofficeSecret());
            if (hash_equals($expected, $stored)) {
                $valid = true;
                // Auto-migrate to bcrypt on successful legacy login.
                $user->user_pass = Hash::make($password);
                $user->save();
            }
        } elseif ($this->isBcryptHash($stored)) {
            $valid = Hash::check($password, $stored);
        }

        if (! $valid) {
            return $this->invalidCredentials();
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->userResource($user),
        ]);
    }

    public function status(): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => $this->userResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = Auth::guard('sanctum')->user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        $token = $user->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    protected function backofficeSecret(): string
    {
        return (string) config('app.backoffice_secret', env('BACKOFFICE_SECRET', ''));
    }

    protected function isLegacyHash(string $hash): bool
    {
        return strlen($hash) === 64 && ctype_xdigit($hash);
    }

    protected function isBcryptHash(string $hash): bool
    {
        return str_starts_with($hash, '$2y$');
    }

    protected function userResource(User $user): array
    {
        return [
            'id' => $user->getKey(),
            'user_login' => $user->user_login,
            'user_email' => $user->user_email,
            'display_name' => $user->display_name,
            'user_role' => $user->user_role,
        ];
    }

    protected function invalidCredentials(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials',
        ], 401);
    }
}
