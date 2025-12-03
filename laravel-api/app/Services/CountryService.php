<?php

namespace App\Services;

use App\Repositories\Contracts\CountryRepositoryInterface;

class CountryService
{
    public function __construct(
        protected CountryRepositoryInterface $countryRepository
    ) {
    }

    public function getAllCountries(): array
    {
        $rows = $this->countryRepository->getAllCountries();

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
            'message' => 'Retrieved countries',
            'error' => null,
        ];
    }

    public function bulkUpdateCountries(array $data): array
    {
        $countries = $this->normalizeCountries($data);

        foreach ($countries as $country) {
            if (trim((string) ($country['name'] ?? '')) === '') {
                return ['success' => false, 'message' => 'name is required', 'error' => 'validation'];
            }
        }

        foreach ($countries as $country) {
            $payload = [
                'name' => $country['name'],
                'sort' => $country['sort'],
                'disable' => $country['status'] === 'Enable' ? 0 : 1,
            ];

            $id = $country['id'];
            if ($id) {
                $this->countryRepository->updateCountry($id, $payload);
            } else {
                $this->countryRepository->createCountry($payload);
            }
        }

        return [
            'success' => true,
            'count' => count($countries),
            'message' => 'Countries saved',
            'error' => null,
        ];
    }

    protected function normalizeCountries(array $data): array
    {
        if (isset($data['countries_count'])) {
            $count = (int) ($data['countries_count'] ?? 0);
            $normalized = [];

            for ($i = 1; $i <= $count; $i++) {
                $normalized[] = [
                    'id' => isset($data["country_id_{$i}"]) ? (int) $data["country_id_{$i}"] : null,
                    'name' => $data["country_name_{$i}"] ?? '',
                    'sort' => (int) ($data["country_sort_{$i}"] ?? 0),
                    'status' => ((int) ($data["country_enable_{$i}"] ?? 0)) === 0 ? 'Enable' : 'Disable',
                ];
            }

            return $normalized;
        }

        if (isset($data['countries']) && is_array($data['countries'])) {
            $data = $data['countries'];
        }

        if ($this->isAssoc($data)) {
            return [];
        }

        return collect($data)->map(function ($country) {
            return [
                'id' => isset($country['id']) ? (int) $country['id'] : null,
                'name' => $country['name'] ?? '',
                'sort' => isset($country['sort']) ? (int) $country['sort'] : 0,
                'status' => ($country['status'] ?? 'Enable') === 'Disable' ? 'Disable' : 'Enable',
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
