<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Component\BulkUpdateComponentRequest;
use App\Http\Requests\Component\StoreComponentRequest;
use App\Http\Requests\Component\UpdateComponentRequest;
use App\Services\ComponentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComponentController extends Controller
{
    public function __construct(private readonly ComponentService $componentService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->componentService->getAllComponents($request->query());
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }

    public function store(StoreComponentRequest $request): JsonResponse
    {
        $result = $this->componentService->createComponent($request->validated());
        $status = $result['success'] ? 201 : 400;

        return response()->json($result, $status);
    }

    public function show(int $id): JsonResponse
    {
        $result = $this->componentService->getComponentById($id);
        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }

    public function update(UpdateComponentRequest $request, int $id): JsonResponse
    {
        $result = $this->componentService->updateComponent($id, $request->validated());
        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->componentService->deleteComponent($id);
        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }

    public function bulkUpdate(BulkUpdateComponentRequest $request): JsonResponse
    {
        $result = $this->componentService->bulkUpdateComponents($request->validated());
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }
}
