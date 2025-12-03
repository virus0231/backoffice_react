<?php

namespace App\Services;

use App\Repositories\Contracts\ComponentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class ComponentService
{
    public function __construct(
        private readonly ComponentRepositoryInterface $componentRepository
    ) {
    }

    public function getAllComponents(array $params = []): array
    {
        try {
            $components = $this->componentRepository->getAll($params);

            return [
                'success' => true,
                'data' => $components,
                'count' => $components->count(),
                'message' => 'Components retrieved successfully',
                'error' => null,
            ];
        } catch (Exception $e) {
            Log::error('Failed to retrieve components', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'data' => [],
                'count' => 0,
                'message' => 'Failed to retrieve components',
                'error' => 'server_error',
            ];
        }
    }

    public function getComponentById(int $id): array
    {
        $component = $this->componentRepository->findByIdArray($id);

        if (! $component) {
            return [
                'success' => false,
                'error' => 'not_found',
                'message' => 'Component not found',
            ];
        }

        return [
            'success' => true,
            'data' => $component,
            'message' => 'Component retrieved successfully',
            'error' => null,
        ];
    }

    public function createComponent(array $data): array
    {
        if (empty($data['name'] ?? '')) {
            return ['success' => false, 'message' => 'name is required', 'error' => 'validation'];
        }

        try {
            DB::beginTransaction();
            $component = $this->componentRepository->createComponent($data);
            DB::commit();

            return [
                'success' => true,
                'data' => $component,
                'message' => 'Component created successfully',
                'error' => null,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create component', ['error' => $e->getMessage(), 'data' => $data]);
            return [
                'success' => false,
                'message' => 'Failed to create component',
                'error' => 'server_error',
            ];
        }
    }

    public function updateComponent(int $id, array $data): array
    {
        $existing = $this->componentRepository->findByIdArray($id);
        if (! $existing) {
            return ['success' => false, 'message' => 'Component not found', 'error' => 'not_found'];
        }

        try {
            DB::beginTransaction();
            $updated = $this->componentRepository->updateComponent($id, $data);
            DB::commit();

            return [
                'success' => true,
                'data' => $updated,
                'message' => 'Component updated successfully',
                'error' => null,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update component', ['id' => $id, 'error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to update component',
                'error' => 'server_error',
            ];
        }
    }

    public function deleteComponent(int $id): array
    {
        $existing = $this->componentRepository->findByIdArray($id);
        if (! $existing) {
            return ['success' => false, 'message' => 'Component not found', 'error' => 'not_found'];
        }

        $deleted = $this->componentRepository->deleteComponent($id);

        return [
            'success' => (bool) $deleted,
            'message' => $deleted ? 'Component deleted successfully' : 'Failed to delete component',
            'error' => $deleted ? null : 'server_error',
        ];
    }

    public function bulkUpdateComponents(array $data): array
    {
        $components = $data['components'] ?? [];
        if (!is_array($components) || empty($components)) {
            return ['success' => false, 'message' => 'components array is required', 'error' => 'validation'];
        }

        try {
            DB::beginTransaction();
            $updated = 0;
            foreach ($components as $componentData) {
                if (isset($componentData['id'])) {
                    $this->componentRepository->updateComponent((int) $componentData['id'], $componentData);
                    $updated++;
                }
            }
            DB::commit();

            return [
                'success' => true,
                'message' => "{$updated} components updated successfully",
                'count' => $updated,
                'error' => null,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk update components', ['error' => $e->getMessage()]);

            return [
                'success' => false,
                'message' => 'Failed to bulk update components',
                'error' => 'server_error',
            ];
        }
    }
}
