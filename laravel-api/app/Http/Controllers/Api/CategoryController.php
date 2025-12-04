<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\BulkUpdateCategoryRequest;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
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

    public function bulkUpdate(BulkUpdateCategoryRequest $request): JsonResponse
    {
        $result = $this->categoryService->bulkUpdateCategories($request->validated());
        $status = $result['error'] === 'validation' ? 400 : 200;

        return response()->json($result, $status);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $name = trim((string) ($validated['name'] ?? ''));
        $image = trim((string) ($validated['image'] ?? ''));
        if ($image === '') {
            $image = '#';
        }

        $table = TableResolver::prefixed('category');
        $id = DB::table($table)->insertGetId([
            'name' => $name,
            'image' => $image,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created',
            'data' => ['id' => $id, 'name' => $name, 'image' => $image],
        ]);
    }

    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $validated = $request->validated();
        $name = trim((string) ($validated['name'] ?? ''));
        $image = array_key_exists('image', $validated)
            ? trim((string) ($validated['image'] ?? ''))
            : null;

        $payload = ['name' => $name];
        if ($image !== null && $image !== '') {
            $payload['image'] = $image;
        }

        $table = TableResolver::prefixed('category');
        DB::table($table)->where('id', $id)->update($payload);

        return response()->json([
            'success' => true,
            'message' => 'Category updated',
            'data' => ['id' => $id, 'name' => $name, 'image' => $payload['image'] ?? null],
        ]);
    }
}
