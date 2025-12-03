<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Configuration\StoreConfigurationRequest;
use App\Http\Requests\Configuration\UpdateConfigurationRequest;
use App\Services\ConfigurationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConfigurationController extends Controller
{
    public function __construct(private readonly ConfigurationService $configurationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->configurationService->getAllConfigurations($request->query());
        $status = $result['success'] ? 200 : 400;

        return response()->json($result, $status);
    }

    public function store(StoreConfigurationRequest $request): JsonResponse
    {
        $result = $this->configurationService->createConfiguration($request->validated());
        $status = $result['success'] ? 201 : 400;

        return response()->json($result, $status);
    }

    public function show(int $id): JsonResponse
    {
        $result = $this->configurationService->getConfigurationById($id);
        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }

    public function update(UpdateConfigurationRequest $request, int $id): JsonResponse
    {
        $result = $this->configurationService->updateConfiguration($id, $request->validated());
        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }

    public function destroy(int $id): JsonResponse
    {
        $result = $this->configurationService->deleteConfiguration($id);
        $status = $result['error'] === 'not_found' ? 404 : ($result['success'] ? 200 : 400);

        return response()->json($result, $status);
    }
}
