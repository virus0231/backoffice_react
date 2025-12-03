<?php

namespace App\Services;

use App\Repositories\Contracts\ConfigurationRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class ConfigurationService
{
    public function __construct(
        private readonly ConfigurationRepositoryInterface $configurationRepository
    ) {
    }

    public function getAllConfigurations(array $params = []): array
    {
        try {
            $configs = $this->configurationRepository->getAll($params);

            return [
                'success' => true,
                'data' => $configs,
                'count' => $configs->count(),
                'message' => 'Configurations retrieved successfully',
                'error' => null,
            ];
        } catch (Exception $e) {
            Log::error('Failed to retrieve configurations', ['error' => $e->getMessage()]);
            return [
                'success' => false,
                'data' => [],
                'count' => 0,
                'message' => 'Failed to retrieve configurations',
                'error' => 'server_error',
            ];
        }
    }

    public function getConfigurationById(int $id): array
    {
        $config = $this->configurationRepository->findByIdArray($id);
        if (! $config) {
            return ['success' => false, 'message' => 'Configuration not found', 'error' => 'not_found'];
        }

        return [
            'success' => true,
            'data' => $config,
            'message' => 'Configuration retrieved successfully',
            'error' => null,
        ];
    }

    public function createConfiguration(array $data): array
    {
        if (empty($data['key'] ?? '')) {
            return ['success' => false, 'message' => 'key is required', 'error' => 'validation'];
        }

        try {
            DB::beginTransaction();
            $config = $this->configurationRepository->createConfiguration($data);
            DB::commit();

            return [
                'success' => true,
                'data' => $config,
                'message' => 'Configuration created successfully',
                'error' => null,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create configuration', ['error' => $e->getMessage(), 'data' => $data]);
            return [
                'success' => false,
                'message' => 'Failed to create configuration',
                'error' => 'server_error',
            ];
        }
    }

    public function updateConfiguration(int $id, array $data): array
    {
        $existing = $this->configurationRepository->findByIdArray($id);
        if (! $existing) {
            return ['success' => false, 'message' => 'Configuration not found', 'error' => 'not_found'];
        }

        try {
            DB::beginTransaction();
            $updated = $this->configurationRepository->updateConfiguration($id, $data);
            DB::commit();

            return [
                'success' => true,
                'data' => $updated,
                'message' => 'Configuration updated successfully',
                'error' => null,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update configuration', ['id' => $id, 'error' => $e->getMessage()]);
            return [
                'success' => false,
                'message' => 'Failed to update configuration',
                'error' => 'server_error',
            ];
        }
    }

    public function deleteConfiguration(int $id): array
    {
        $existing = $this->configurationRepository->findByIdArray($id);
        if (! $existing) {
            return ['success' => false, 'message' => 'Configuration not found', 'error' => 'not_found'];
        }

        $deleted = $this->configurationRepository->deleteConfiguration($id);

        return [
            'success' => (bool) $deleted,
            'message' => $deleted ? 'Configuration deleted successfully' : 'Failed to delete configuration',
            'error' => $deleted ? null : 'server_error',
        ];
    }
}
