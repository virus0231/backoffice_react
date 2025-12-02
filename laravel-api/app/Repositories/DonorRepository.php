<?php

namespace App\Repositories;

use App\Models\Donor;
use App\Repositories\Contracts\DonorRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class DonorRepository implements DonorRepositoryInterface
{
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return Donor::query()->with(['transactions', 'schedules'])
            ->orderByDesc('id')
            ->paginate($perPage, $columns);
    }

    public function paginateWithFilters(array $filters = [], int $perPage = 50): LengthAwarePaginator
    {
        $query = Donor::query()->with(['transactions', 'schedules']);

        if (!empty($filters['search'])) {
            $term = $filters['search'];
            $query->where(function ($q) use ($term) {
                $q->where('email', 'like', "%{$term}%")
                    ->orWhere('firstname', 'like', "%{$term}%")
                    ->orWhere('lastname', 'like', "%{$term}%");
            });
        }

        if (!empty($filters['email'])) {
            $query->where('email', 'like', "%{$filters['email']}%");
        }

        if (!empty($filters['country'])) {
            $query->where('country', $filters['country']);
        }

        return $query->orderByDesc('id')->paginate($perPage);
    }

    public function findById(int|string $id): ?Model
    {
        return Donor::with(['transactions', 'schedules'])->find($id);
    }

    public function create(array $data): Model
    {
        return Donor::create($data);
    }

    public function update(Model|int|string $modelOrId, array $data): Model
    {
        $donor = $modelOrId instanceof Donor ? $modelOrId : Donor::find($modelOrId);

        if (! $donor) {
            throw new \InvalidArgumentException("Donor not found");
        }

        $donor->fill($data);
        $donor->save();

        return $donor->fresh(['transactions', 'schedules']);
    }

    public function delete(Model|int|string $modelOrId): bool
    {
        $donor = $modelOrId instanceof Donor ? $modelOrId : Donor::find($modelOrId);
        return $donor ? (bool) $donor->delete() : false;
    }

    public function search(string $term, int $limit = 25): Collection
    {
        return Donor::query()
            ->where(function ($q) use ($term) {
                $q->where('email', 'like', "%{$term}%")
                    ->orWhere('firstname', 'like', "%{$term}%")
                    ->orWhere('lastname', 'like', "%{$term}%");
            })
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }

    public function findByEmail(string $email): ?Donor
    {
        return Donor::where('email', $email)->first();
    }

    public function findByIdOrFail(int $id): Donor
    {
        return Donor::with(['transactions', 'schedules'])->findOrFail($id);
    }
}
