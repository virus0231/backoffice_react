<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PermissionController extends Controller
{
    public function roles(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['id' => 2, 'name' => 'Admin'],
                ['id' => 3, 'name' => 'Marketing'],
                ['id' => 4, 'name' => 'Content'],
                ['id' => 5, 'name' => 'Client'],
            ],
        ]);
    }

    public function list(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Permissions updated',
        ]);
    }
}
