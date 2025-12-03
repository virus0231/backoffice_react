<?php

namespace App\Services;

use App\Repositories\Contracts\AmountRepositoryInterface;
use Illuminate\Support\Arr;

class AmountService
{
    public function __construct(
        protected AmountRepositoryInterface $amountRepository
    ) {
    }

    public function getAmountsByAppealId(int $appealId): array
    {
        if ($appealId <= 0) {
            return ['success' => false, 'error' => 'appeal_id is required', 'data' => [], 'count' => 0, 'message' => 'appeal_id is required'];
        }

        $rows = $this->amountRepository->getAmountsByAppealId($appealId);

        $data = $rows->map(function ($r) {
            $disable = (int) ($r->disable ?? 0);
            $featured = (int) ($r->featured ?? 0);
            return [
                'id' => (int) $r->id,
                'appeal_id' => (int) $r->appeal_id,
                'name' => $r->name ?? '',
                'amount' => $r->amount ?? '',
                'donationtype' => $r->donationtype ?? '',
                'sort' => isset($r->sort) ? (int) $r->sort : 0,
                'featured' => $featured === 1 ? 'enabled' : 'disabled',
                'status' => $disable === 0 ? 'enabled' : 'disabled',
            ];
        })->all();

        return [
            'success' => true,
            'data' => $data,
            'count' => count($data),
            'message' => 'Retrieved amounts for appeal ' . $appealId,
            'error' => null,
        ];
    }

    public function bulkUpdateAmounts(int $appealId, array $amounts): array
    {
        if ($appealId <= 0) {
            return ['success' => false, 'message' => 'appeal_id is required', 'error' => 'validation'];
        }

        $parsed = $this->normalizeAmounts($amounts);

        foreach ($parsed as $row) {
            $id = $row['id'];
            $payload = [
                'appeal_id' => $appealId,
                'name' => $row['name'],
                'amount' => $row['amount'],
                'donationtype' => $row['donationtype'],
                'sort' => $row['sort'],
                'featured' => $row['featured'] === 'enabled' ? 1 : 0,
                'disable' => $row['status'] === 'enabled' ? 0 : 1,
            ];

            if ($id) {
                $this->amountRepository->updateAmount($id, $payload);
            } else {
                $this->amountRepository->createAmount($payload);
            }
        }

        return ['success' => true, 'message' => 'Amounts saved', 'error' => null];
    }

    public function toggleAmountStatus(int $id, bool $status): array
    {
        $amount = $this->amountRepository->findAmountById($id);
        if (! $amount) {
            return ['success' => false, 'message' => 'Amount not found', 'data' => [], 'error' => 'not_found'];
        }

        $disable = $status ? 0 : 1;
        $this->amountRepository->updateAmountStatus($id, $disable);

        return [
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => [
                'id' => $id,
                'status' => $status,
            ],
            'error' => null,
        ];
    }

    protected function normalizeAmounts(array $amounts): array
    {
        if (isset($amounts['amounts_count'])) {
            $count = (int) ($amounts['amounts_count'] ?? 0);
            $normalized = [];
            for ($i = 1; $i <= $count; $i++) {
                $normalized[] = [
                    'id' => isset($amounts["amount_id_{$i}"]) ? (int) $amounts["amount_id_{$i}"] : null,
                    'name' => $amounts["amount_name_{$i}"] ?? '',
                    'amount' => $amounts["amount_amount_{$i}"] ?? '',
                    'donationtype' => $amounts["amount_donation_type_{$i}"] ?? '',
                    'sort' => (int) ($amounts["amount_sort_{$i}"] ?? 0),
                    'featured' => !empty($amounts["amount_featured_{$i}"]) ? 'enabled' : 'disabled',
                    'status' => ((int) ($amounts["amount_enable_{$i}"] ?? 0)) === 0 ? 'enabled' : 'disabled',
                ];
            }
            return $normalized;
        }

        if (isset($amounts['amounts']) && is_array($amounts['amounts'])) {
            $amounts = $amounts['amounts'];
        }

        if ($this->isAssoc($amounts)) {
            return [];
        }

        return collect($amounts)->map(function ($a) {
            return [
                'id' => isset($a['id']) ? (int) $a['id'] : null,
                'name' => $a['name'] ?? '',
                'amount' => $a['amount'] ?? '',
                'donationtype' => $a['donationtype'] ?? '',
                'sort' => isset($a['sort']) ? (int) $a['sort'] : 0,
                'featured' => ($a['featured'] ?? 'disabled') === 'enabled' ? 'enabled' : 'disabled',
                'status' => ($a['status'] ?? 'disabled') === 'enabled' ? 'enabled' : 'disabled',
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
