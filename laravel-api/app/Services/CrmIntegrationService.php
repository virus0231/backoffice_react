<?php

namespace App\Services;

use App\Repositories\Contracts\CrmIntegrationRepositoryInterface;

class CrmIntegrationService
{
    public function __construct(
        private readonly CrmIntegrationRepositoryInterface $crmIntegrationRepository
    ) {
    }

    public function sync(array $data): array
    {
        $result = $this->crmIntegrationRepository->sync($data);

        return [
            'success' => true,
            'data' => $result,
            'message' => 'CRM sync queued',
            'error' => null,
        ];
    }
}
