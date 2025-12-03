<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Requests\User\UpdateUserStatusRequest;
use App\Services\UserManagementService;
use Illuminate\Http\JsonResponse;

class UserManagementController extends Controller
{
    public function __construct(private readonly UserManagementService $userService)
    {
    }

    public function index(): JsonResponse
    {
        $data = $this->userService->getAllUsers();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $result = $this->userService->createUser($request->validated());

        $status = 200;
        if ($result['error'] === 'validation') {
            $status = 400;
        } elseif ($result['error'] === 'forbidden') {
            $status = 403;
        }

        return response()->json($result, $status);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $result = $this->userService->updateUser($id, $request->validated());

        $status = 200;
        if ($result['error'] === 'validation') {
            $status = 400;
        } elseif ($result['error'] === 'forbidden') {
            $status = 403;
        } elseif ($result['error'] === 'not_found') {
            $status = 404;
        }

        return response()->json($result, $status);
    }

    public function status(UpdateUserStatusRequest $request, int $id): JsonResponse
    {
        $statusFlag = $request->boolean('status', true);
        $result = $this->userService->toggleUserStatus($id, $statusFlag);

        $status = $result['success'] ? 200 : 404;

        return response()->json($result, $status);
    }
}
