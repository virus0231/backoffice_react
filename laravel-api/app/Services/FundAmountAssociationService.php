<?php

namespace App\Services;

use App\Repositories\Contracts\FundAmountAssociationRepositoryInterface;
use Illuminate\Support\Collection;

class FundAmountAssociationService
{
    public function __construct(
        protected FundAmountAssociationRepositoryInterface $fundAmountAssociationRepository
    ) {
    }

    public function getAssociations(int $appealId): array
    {
        if ($appealId <= 0) {
            return ['success' => false, 'data' => [], 'message' => 'appeal_id is required', 'error' => 'validation'];
        }

        $amounts = $this->fundAmountAssociationRepository->getAmountsByAppeal($appealId);
        $funds = $this->fundAmountAssociationRepository->getFundsByAppeal($appealId);
        $associations = $this->fundAmountAssociationRepository->getAssociationsByAppeal($appealId)
            ->map(fn ($r) => [
                'amountId' => (int) ($r->amountid ?? 0),
                'fundId' => (int) ($r->fundlistid ?? 0),
            ]);

        return [
            'success' => true,
            'data' => [
                'amounts' => $this->mapAmounts($amounts),
                'funds' => $this->mapFunds($funds),
                'associations' => $associations,
            ],
            'message' => 'Retrieved associations',
            'error' => null,
        ];
    }

    public function updateAssociations(int $appealId, array $payload): array
    {
        if ($appealId <= 0) {
            return ['success' => false, 'message' => 'appeal_id is required', 'error' => 'validation'];
        }

        $associations = $payload['associations'] ?? [];

        if (empty($associations) && isset($payload['fund_ids'])) {
            $fundIds = $payload['fund_ids'];
            foreach ($fundIds as $fid) {
                $parts = explode('_', (string) $fid);
                if (count($parts) === 3) {
                    $associations[] = [
                        'appealId' => (int) $parts[0],
                        'amountId' => (int) $parts[1],
                        'fundId' => (int) $parts[2],
                    ];
                }
            }
        }

        $rowsToInsert = [];
        foreach ($associations as $assoc) {
            $amountId = (int) ($assoc['amountId'] ?? 0);
            $fundId = (int) ($assoc['fundId'] ?? 0);
            if ($amountId > 0 && $fundId > 0) {
                $rowsToInsert[] = [
                    'appealid' => $appealId,
                    'amountid' => $amountId,
                    'fundlistid' => $fundId,
                ];
            }
        }

        $this->fundAmountAssociationRepository->replaceAssociations($appealId, $rowsToInsert);

        return ['success' => true, 'message' => 'Associations saved', 'error' => null];
    }

    protected function mapAmounts(Collection $amounts): Collection
    {
        return $amounts->map(fn ($r) => [
            'id' => (int) ($r->id ?? 0),
            'name' => $r->name ?? '',
            'amount' => $r->amount ?? '',
        ]);
    }

    protected function mapFunds(Collection $funds): Collection
    {
        return $funds->map(fn ($r) => [
            'id' => (int) ($r->id ?? 0),
            'name' => $r->name ?? '',
        ]);
    }
}
