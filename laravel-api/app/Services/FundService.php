<?php

namespace App\Services;

use App\Repositories\Contracts\FundRepositoryInterface;

class FundService
{
    public function __construct(
        protected FundRepositoryInterface $fundRepository
    ) {
    }

    public function getFundsByAppealId(int $appealId): array
    {
        if ($appealId <= 0) {
            return ['success' => false, 'error' => 'appeal_id is required', 'data' => [], 'count' => 0, 'message' => 'appeal_id is required'];
        }

        $rows = $this->fundRepository->getFundsByAppealId($appealId);

        $data = $rows->map(function ($r) {
            $disable = (int) ($r->disable ?? 0);
            return [
                'id' => (int) $r->id,
                'appeal_id' => (int) $r->appeal_id,
                'name' => $r->name ?? '',
                'sort' => isset($r->sort) ? (int) $r->sort : 0,
                'status' => $disable === 0 ? 'Enable' : 'Disable',
            ];
        })->all();

        return [
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved funds',
            'error' => null,
        ];
    }

    public function bulkUpdateFunds(int $appealId, array $funds): array
    {
        if ($appealId <= 0) {
            return ['success' => false, 'message' => 'appeal_id is required', 'error' => 'validation'];
        }

        $parsedFunds = $this->normalizeFunds($funds);

        foreach ($parsedFunds as $fund) {
            $id = $fund['id'];
            $payload = [
                'appeal_id' => $appealId,
                'name' => $fund['name'],
                'sort' => $fund['sort'],
                'disable' => $fund['status'] === 'Enable' ? 0 : 1,
            ];

            if ($id) {
                $this->fundRepository->updateFund($id, $payload);
            } else {
                $this->fundRepository->createFund($payload);
            }
        }

        return ['success' => true, 'message' => 'Funds saved', 'error' => null];
    }

    protected function normalizeFunds(array $funds): array
    {
        // Legacy form-data shape with indexed fields
        if (isset($funds['funds_count'])) {
            $count = (int) ($funds['funds_count'] ?? 0);
            $normalized = [];
            for ($i = 1; $i <= $count; $i++) {
                $normalized[] = [
                    'id' => isset($funds["fund_id_{$i}"]) ? (int) $funds["fund_id_{$i}"] : null,
                    'name' => $funds["fund_name_{$i}"] ?? '',
                    'sort' => (int) ($funds["fund_sort_{$i}"] ?? 0),
                    'status' => ((int) ($funds["fund_enable_{$i}"] ?? 0)) === 0 ? 'Enable' : 'Disable',
                ];
            }
            return $normalized;
        }

        // JSON array format under funds key or direct array
        if (isset($funds['funds']) && is_array($funds['funds'])) {
            $funds = $funds['funds'];
        }

        // If still contains non-indexed keys (e.g., appeal_id), try to detect numeric keys
        if ($this->isAssoc($funds)) {
            return [];
        }

        return collect($funds)->map(function ($f) {
            return [
                'id' => isset($f['id']) ? (int) $f['id'] : null,
                'name' => $f['name'] ?? '',
                'sort' => isset($f['sort']) ? (int) $f['sort'] : 0,
                'status' => ($f['status'] ?? 'Enable') === 'Disable' ? 'Disable' : 'Enable',
            ];
        })->all();
    }

    protected function isAssoc(array $arr): bool
    {
        if ($arr === []) {
            return false;
        }
        return array_keys($arr) !== range(0, count($arr) - 1);
    }
}
