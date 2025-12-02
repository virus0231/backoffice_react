<?php

namespace App\Repositories\Contracts;

use Illuminate\Support\Collection;

interface UserManagementRepositoryInterface extends RepositoryInterface
{
    public function getAllUsersWithRoles(): Collection;

    public function findUserByUsernameOrEmail(string $username, string $email): bool;

    public function createUser(array $data): int;

    public function updateUser(int $id, array $data): bool;

    public function updateUserStatus(int $id, int $status): bool;
}
