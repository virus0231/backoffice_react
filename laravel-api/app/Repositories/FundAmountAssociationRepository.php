<?php

namespace App\Repositories;

use App\Repositories\Contracts\FundAmountAssociationRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class FundAmountAssociationRepository implements FundAmountAssociationRepositoryInterface
{
    public function getAmountsByAppeal(int $appealId): Collection
    {
        $amountTable = TableResolver::prefixed('amount');

        return DB::table($amountTable)
            ->where('appeal_id', $appealId)
            ->orderBy('sort')
            ->orderBy('id')
            ->get(['id', 'name', 'amount']);
    }

    public function getFundsByAppeal(int $appealId): Collection
    {
        $fundTable = TableResolver::prefixed('fundlist');

        return DB::table($fundTable)
            ->where('appeal_id', $appealId)
            ->orderBy('sort')
            ->orderBy('id')
            ->get(['id', 'name']);
    }

    public function getAssociationsByAppeal(int $appealId): Collection
    {
        $comboTable = TableResolver::prefixed('fund_amount_combo');

        return DB::table($comboTable)
            ->where('appealid', $appealId)
            ->get(['amountid', 'fundlistid']);
    }

    public function replaceAssociations(int $appealId, array $associations): void
    {
        $comboTable = TableResolver::prefixed('fund_amount_combo');

        DB::table($comboTable)->where('appealid', $appealId)->delete();

        foreach ($associations as $assoc) {
            DB::table($comboTable)->insert($assoc);
        }
    }

    /* --- RepositoryInterface compatibility (not used here) --- */
    public function findById(int|string $id): ?Model
    {
        return null;
    }

    public function create(array $data): Model
    {
        return new Model();
    }

    public function update(Model|int|string $modelOrId, array $data): Model
    {
        return $modelOrId instanceof Model ? $modelOrId : new Model();
    }

    public function delete(Model|int|string $modelOrId): bool
    {
        return false;
    }

    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return new Paginator([], 0, $perPage);
    }
}
