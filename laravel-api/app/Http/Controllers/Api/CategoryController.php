<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $table = TableResolver::prefixed('category');
        $rows = DB::table($table)->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'success' => true,
            'data' => $rows->map(fn ($r) => ['id' => (int)$r->id, 'name' => $r->name]),
            'count' => $rows->count(),
            'message' => 'Retrieved categories',
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $name = trim((string)$request->input('name', ''));
        if ($name === '') {
            return response()->json(['success' => false, 'error' => 'name is required'], 400);
        }

        $table = TableResolver::prefixed('category');
        $id = DB::table($table)->insertGetId(['name' => $name]);

        return response()->json([
            'success' => true,
            'message' => 'Category created',
            'data' => ['id' => $id, 'name' => $name],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $name = trim((string)$request->input('name', ''));
        if ($name === '') {
            return response()->json(['success' => false, 'error' => 'name is required'], 400);
        }

        $table = TableResolver::prefixed('category');
        DB::table($table)->where('id', $id)->update(['name' => $name]);

        return response()->json([
            'success' => true,
            'message' => 'Category updated',
            'data' => ['id' => $id, 'name' => $name],
        ]);
    }
}
