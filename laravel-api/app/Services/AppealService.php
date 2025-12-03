<?php

namespace App\Services;

use App\Repositories\Contracts\AppealRepositoryInterface;

class AppealService
{
    public function __construct(
        protected AppealRepositoryInterface $appealRepository
    ) {
    }

    public function getAllAppeals(): array
    {
        $rows = $this->appealRepository->getAllAppeals();

        $data = $rows->map(function ($r) {
            $disable = (int) ($r->disable ?? 0);

            return [
                'id' => (int) $r->id,
                'name' => $r->name ?? '',
                'sort' => isset($r->sort) ? (int) $r->sort : 0,
                'status' => $disable === 0 ? 'Enable' : 'Disable',
            ];
        })->all();

        return [
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved appeals',
            'error' => null,
        ];
    }

    public function bulkUpdateAppeals(array $data): array
    {
        $appeals = $this->normalizeAppeals($data);

        foreach ($appeals as $appeal) {
            if (trim((string) ($appeal['name'] ?? '')) === '') {
                return ['success' => false, 'message' => 'name is required', 'error' => 'validation'];
            }
        }

        foreach ($appeals as $appeal) {
            $payload = [
                'name' => $appeal['name'],
                'sort' => $appeal['sort'],
                'disable' => $appeal['status'] === 'Enable' ? 0 : 1,
            ];

            $id = $appeal['id'];
            if ($id) {
                $this->appealRepository->updateAppeal($id, $payload);
            } else {
                $this->appealRepository->createAppeal($payload);
            }
        }

        return [
            'success' => true,
            'count' => count($appeals),
            'message' => 'Appeals saved',
            'error' => null,
        ];
    }

    protected function normalizeAppeals(array $data): array
    {
        if (isset($data['appeals_count'])) {
            $count = (int) ($data['appeals_count'] ?? 0);
            $normalized = [];

            for ($i = 1; $i <= $count; $i++) {
                $normalized[] = [
                    'id' => isset($data["appeal_id_{$i}"]) ? (int) $data["appeal_id_{$i}"] : null,
                    'name' => $data["appeal_name_{$i}"] ?? '',
                    'sort' => (int) ($data["appeal_sort_{$i}"] ?? 0),
                    'status' => ((int) ($data["appeal_enable_{$i}"] ?? 0)) === 0 ? 'Enable' : 'Disable',
                ];
            }

            return $normalized;
        }

        if (isset($data['appeals']) && is_array($data['appeals'])) {
            $data = $data['appeals'];
        }

        if ($this->isAssoc($data)) {
            return [];
        }

        return collect($data)->map(function ($appeal) {
            return [
                'id' => isset($appeal['id']) ? (int) $appeal['id'] : null,
                'name' => $appeal['name'] ?? '',
                'sort' => isset($appeal['sort']) ? (int) $appeal['sort'] : 0,
                'status' => ($appeal['status'] ?? 'Enable') === 'Disable' ? 'Disable' : 'Enable',
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
