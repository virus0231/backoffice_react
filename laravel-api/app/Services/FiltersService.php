<?php

namespace App\Services;

use App\Repositories\Contracts\FiltersRepositoryInterface;

class FiltersService
{
    public function __construct(
        protected FiltersRepositoryInterface $filtersRepository
    ) {
    }

    public function getAppeals(): array
    {
        $rows = $this->filtersRepository->getAllAppeals();

        return $rows->map(function ($r) {
            $disable = (int) ($r->disable ?? 0);
            return [
                'id' => (int) $r->id,
                'appeal_name' => $r->appeal_name ?? ($r->name ?? 'Unnamed Appeal'),
                'status' => $disable === 0 ? 'active' : 'inactive',
                'start_date' => isset($r->start_date) && $r->start_date ? date(DATE_ISO8601, strtotime($r->start_date)) : null,
                'end_date' => isset($r->end_date) && $r->end_date ? date(DATE_ISO8601, strtotime($r->end_date)) : null,
                'description' => $r->description ?? null,
                'image' => $r->image ?? null,
                'category' => $r->category ?? null,
                'goal' => isset($r->goal) ? (float) $r->goal : null,
                'sort' => isset($r->sort) ? (int) $r->sort : null,
                'ishome_v' => isset($r->ishome_v) ? (int) $r->ishome_v : null,
                'isfooter' => isset($r->isfooter) ? (int) $r->isfooter : null,
                'isdonate_v' => isset($r->isdonate_v) ? (int) $r->isdonate_v : null,
                'isother_v' => isset($r->isother_v) ? (int) $r->isother_v : null,
                'isquantity_v' => isset($r->isquantity_v) ? (int) $r->isquantity_v : null,
                'isdropdown_v' => isset($r->isdropdown_v) ? (int) $r->isdropdown_v : null,
                'isrecurring_v' => isset($r->isrecurring_v) ? (int) $r->isrecurring_v : null,
                'recurring_interval' => $r->recurring_interval ?? null,
                'isassociate' => isset($r->isassociate) ? (int) $r->isassociate : null,
                'type' => $r->type ?? null,
                'country' => $r->country ?? null,
                'cause' => $r->cause ?? null,
            ];
        })->all();
    }

    public function getFunds(array $queryParams): array
    {
        $appealIds = collect(explode(',', (string) ($queryParams['appeal_ids'] ?? '')))
            ->map(fn ($v) => (int) $v)
            ->filter(fn ($v) => $v > 0)
            ->values()
            ->all();

        $rows = $this->filtersRepository->getFundsByAppealIds($appealIds);

        $data = $rows->map(function ($r) {
            $disable = (int) ($r->disable ?? 0);
            return [
                'id' => (int) $r->id,
                'fund_name' => $r->fund_name ?? ($r->name ?? 'Unnamed Fund'),
                'is_active' => $disable === 0,
                'appeal_id' => isset($r->appeal_id) ? (int) $r->appeal_id : null,
                'category' => $r->category ?? null,
            ];
        })->all();

        return [
            'data' => $data,
            'filters' => ['appeal_ids' => $queryParams['appeal_ids'] ?? ''],
        ];
    }

    public function getCategories(): array
    {
        $rows = $this->filtersRepository->getAllCategories();

        return $rows->map(fn ($r) => ['id' => (int) $r->id, 'name' => $r->name])->all();
    }

    public function getCountries(): array
    {
        $rows = $this->filtersRepository->getAllCountries();

        return $rows->map(fn ($r) => ['id' => (int) $r->id, 'name' => $r->name])->all();
    }
}
