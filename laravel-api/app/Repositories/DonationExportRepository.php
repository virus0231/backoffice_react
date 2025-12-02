<?php

namespace App\Repositories;

use App\Repositories\Contracts\DonationExportRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class DonationExportRepository implements DonationExportRepositoryInterface
{
    public function getCountWithFilters(array $filters): int
    {
        $q = $this->baseQuery($filters);
        return (int) $q->distinct()->count("{$filters['transactions']}.id");
    }

    public function getPaginatedData(array $filters, int $offset, int $limit): Collection
    {
        $q = $this->baseQuery($filters);

        return $q->select([
            "{$filters['transactions']}.*",
            "{$filters['donors']}.firstname",
            "{$filters['donors']}.lastname",
            "{$filters['donors']}.email",
            "{$filters['donors']}.phone",
        ])
            ->offset($offset)
            ->limit($limit)
            ->get();
    }

    public function getSummaryData(array $filters): Collection
    {
        $q = $this->baseQuery($filters);

        return $q->select([
            "{$filters['transactions']}.id",
            "{$filters['transactions']}.date",
            "{$filters['donors']}.firstname",
            "{$filters['donors']}.lastname",
            "{$filters['donors']}.email",
            "{$filters['donors']}.phone",
            "{$filters['donors']}.city",
            "{$filters['donors']}.country",
            "{$filters['donors']}.add2 as state",
            "{$filters['donors']}.postcode",
            "{$filters['transactions']}.card_fee",
            "{$filters['transactions']}.totalamount",
            "{$filters['transactions']}.charge_amount",
            "{$filters['transactions']}.TID",
            "{$filters['transactions']}.order_id",
            "{$filters['transactions']}.status",
            "{$filters['transactions']}.notes",
        ])
            ->orderBy("{$filters['transactions']}.id")
            ->get();
    }

    public function getDetailData(array $filters): Collection
    {
        $tables = $filters['tables'];
        $q = $this->baseQuery($filters)
            ->join($tables['appeal'], "{$tables['appeal']}.id", '=', "{$tables['details']}.appeal_id")
            ->join($tables['amount'], "{$tables['amount']}.id", '=', "{$tables['details']}.amount_id")
            ->join($tables['fundlist'], "{$tables['fundlist']}.id", '=', "{$tables['details']}.fundlist_id");

        return $q->select([
            "{$tables['transactions']}.date",
            "{$tables['appeal']}.name as appeal_name",
            "{$tables['amount']}.name as amount_name",
            "{$tables['fundlist']}.name as fund_name",
            "{$tables['transactions']}.order_id",
            "{$tables['details']}.freq",
            "{$tables['transactions']}.TID",
            "{$tables['details']}.amount",
            "{$tables['details']}.quantity",
            "{$tables['transactions']}.card_fee",
            "{$tables['transactions']}.totalamount",
            "{$tables['donors']}.firstname",
            "{$tables['donors']}.lastname",
            "{$tables['donors']}.email",
            "{$tables['donors']}.phone",
            "{$tables['donors']}.add1",
            "{$tables['donors']}.city",
            "{$tables['donors']}.country",
            "{$tables['donors']}.add2",
            "{$tables['donors']}.postcode",
            "{$tables['transactions']}.notes",
            "{$tables['transactions']}.paymenttype",
            "{$tables['transactions']}.status",
        ])
            ->orderBy("{$tables['details']}.TID", 'DESC')
            ->get();
    }

    protected function baseQuery(array &$filters)
    {
        $tables = [
            'transactions' => TableResolver::prefixed('transactions'),
            'details' => TableResolver::prefixed('transaction_details'),
            'donors' => TableResolver::prefixed('donors'),
            'appeal' => TableResolver::prefixed('appeal'),
            'amount' => TableResolver::prefixed('amount'),
            'fundlist' => TableResolver::prefixed('fundlist'),
        ];
        $filters['tables'] = $tables;
        $filters['transactions'] = $tables['transactions'];
        $filters['details'] = $tables['details'];
        $filters['donors'] = $tables['donors'];

        $tx = $tables['transactions'];
        $detail = $tables['details'];
        $donor = $tables['donors'];

        $startDate = $filters['startDate'] ?? null;
        $endDate = $filters['endDate'] ?? null;
        $donationType = $filters['donationType'] ?? [];
        $status = $filters['status'] ?? '0';
        $paymentType = $filters['paymentType'] ?? '0';
        $frequency = $filters['frequency'] ?? '';
        $txtsearch = $filters['txtsearch'] ?? '';
        $orderid = $filters['orderid'] ?? '';

        $q = DB::table($tx)
            ->join($detail, "{$tx}.id", '=', "{$detail}.TID")
            ->join($donor, "{$tx}.DID", '=', "{$donor}.id");

        if ($startDate && $endDate) {
            if ($startDate === $endDate) {
                $q->whereDate("{$tx}.date", $endDate);
            } else {
                $q->whereBetween(DB::raw("DATE({$tx}.date)"), [$startDate, $endDate]);
            }
        }

        if (!empty($donationType)) {
            $q->whereIn("{$detail}.appeal_id", $donationType);
        }

        if ($status !== '0') {
            $q->where("{$tx}.status", $status);
        }

        if ($paymentType !== '0') {
            if (strtoupper($paymentType) === 'PAYPAL') {
                $q->where(function ($qq) use ($tx) {
                    $qq->where("{$tx}.paymenttype", 'PAYPAL')
                        ->orWhere("{$tx}.paymenttype", 'paypal_ipn');
                });
            } else {
                $q->where("{$tx}.paymenttype", $paymentType);
            }
        }

        if (in_array($frequency, ['0', '1', '2', '3'], true)) {
            $q->where("{$detail}.freq", $frequency);
        }

        if ($txtsearch !== '') {
            $q->where(function ($qq) use ($donor, $txtsearch) {
                $qq->where("{$donor}.email", 'like', "%{$txtsearch}%")
                    ->orWhere("{$donor}.firstname", 'like', "%{$txtsearch}%")
                    ->orWhere("{$donor}.lastname", 'like', "%{$txtsearch}%")
                    ->orWhere("{$donor}.phone", 'like', "%{$txtsearch}%")
                    ->orWhere("{$donor}.organization", 'like', "%{$txtsearch}%");
            });
        }

        if ($orderid !== '') {
            $q->where(function ($qq) use ($tx, $orderid) {
                $qq->where("{$tx}.order_id", 'like', "%{$orderid}%")
                    ->orWhere("{$tx}.TID", 'like', "%{$orderid}%");
            });
        }

        return $q->orderBy("{$detail}.TID", 'DESC');
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
