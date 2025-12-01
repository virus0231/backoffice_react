<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'User created',
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'User updated',
        ]);
    }

    public function status(Request $request, int $id): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'User status updated',
        ]);
    }
}
