<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CategoryService;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function __construct(private readonly CategoryService $categoryService)
    {
    }

    public function index(): JsonResponse
    {
        $result = $this->categoryService->getAllCategories();
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $result = $this->categoryService->bulkUpdateCategories($request->all());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
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
