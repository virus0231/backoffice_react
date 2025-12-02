<?php

namespace App\Services;

use App\Repositories\Contracts\UserManagementRepositoryInterface;
use Illuminate\Support\Arr;

class UserManagementService
{
    public function __construct(
        protected UserManagementRepositoryInterface $users
    ) {
    }

    public function getAllUsers(): array
    {
        $rows = $this->users->getAllUsersWithRoles();

        return $rows->map(function ($u) {
            return [
                'id' => $u->ID ?? $u->id ?? null,
                'username' => $u->user_login ?? '',
                'display_name' => $u->display_name ?? ($u->user_login ?? ''),
                'email' => $u->user_email ?? '',
                'role_id' => isset($u->user_role) ? (int) $u->user_role : null,
                'user_role' => isset($u->user_role) ? (int) $u->user_role : null,
                'role_name' => $u->role_name ?? ($u->user_role ?? ''),
                'user_registered' => $u->user_registered ?? '',
                'user_status' => isset($u->user_status) ? (int) $u->user_status : 0,
            ];
        })->all();
    }

    public function createUser(array $data): array
    {
        $username = trim((string) Arr::get($data, 'username', ''));
        $display = trim((string) Arr::get($data, 'display_name', $username));
        $email = trim((string) Arr::get($data, 'email', ''));
        $password = (string) Arr::get($data, 'password', '');
        $role = (int) Arr::get($data, 'role_id', 0);

        if ($username === '' || $email === '' || $password === '') {
            return ['success' => false, 'message' => 'username, email, password required', 'error' => 'validation'];
        }

        if ($role === 1) {
            return ['success' => false, 'message' => 'Not allowed', 'error' => 'forbidden'];
        }

        if ($this->users->findUserByUsernameOrEmail($username, $email)) {
            return ['success' => false, 'message' => 'User exists', 'error' => 'validation'];
        }

        $hash = hash_hmac('sha256', $password, config('app.backoffice_secret', ''));
        $now = now()->format('Y-m-d H:i:s');

        $id = $this->users->createUser([
            'user_login' => $username,
            'display_name' => $display,
            'user_pass' => $hash,
            'user_role' => $role,
            'user_email' => $email,
            'user_registered' => $now,
            'user_status' => 0,
        ]);

        return ['success' => true, 'message' => 'User created', 'data' => ['id' => $id], 'error' => null];
    }

    public function updateUser(int $id, array $data): array
    {
        $username = trim((string) Arr::get($data, 'username', ''));
        $display = trim((string) Arr::get($data, 'display_name', ''));
        $email = trim((string) Arr::get($data, 'email', ''));
        $role = (int) Arr::get($data, 'role_id', 0);
        $password = Arr::get($data, 'password');

        if ($username === '' || $email === '') {
            return ['success' => false, 'message' => 'username and email required', 'error' => 'validation'];
        }

        if ($role === 1) {
            return ['success' => false, 'message' => 'Not allowed', 'error' => 'forbidden'];
        }

        $payload = [
            'user_login' => $username,
            'display_name' => $display,
            'user_email' => $email,
            'user_role' => $role,
        ];

        if ($password !== null && $password !== '') {
            $payload['user_pass'] = hash_hmac('sha256', (string) $password, config('app.backoffice_secret', ''));
        }

        $updated = $this->users->updateUser($id, $payload);

        if (! $updated) {
            return ['success' => false, 'message' => 'User not found or not updated', 'error' => 'not_found'];
        }

        return ['success' => true, 'message' => 'User updated', 'error' => null];
    }

    public function toggleUserStatus(int $id, bool $status): array
    {
        $updated = $this->users->updateUserStatus($id, $status ? 0 : 1);

        if (! $updated) {
            return ['success' => false, 'message' => 'User not found', 'error' => 'not_found'];
        }

        return ['success' => true, 'message' => 'User status updated', 'error' => null];
    }
}
