<?php

namespace App\Repositories;

use App\Repositories\Contracts\ScheduleRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ScheduleRepository implements ScheduleRepositoryInterface
{
    public function getPaginatedSchedules(array $filters): array
    {
        [$whereClause, $params] = $this->buildWhereClause($filters);
        $offset = (int)($filters['offset'] ?? 0);
        $limit = (int)($filters['limit'] ?? 500);
        $tables = $this->getTables();

        $totalCount = null;
        if ($offset === 0) {
            $countSql = "
                SELECT COUNT(DISTINCT t.id) as total
                FROM `{$tables['transactions']}` t
                LEFT JOIN `{$tables['details']}` td ON t.id = td.TID
                LEFT JOIN `{$tables['donors']}` d ON d.id = t.did
                WHERE {$whereClause}
            ";
            $totalCount = (int) DB::selectOne($countSql, $params)->total;
        }

        $sql = "
            SELECT
              t.id,
              t.order_id,
              t.date as start_date,
              t.totalamount as amount,
              td.freq,
              t.status,
              t.paymenttype as donation_type,
              t.paymenttype as payment_method,
              d.firstname,
              d.lastname,
              d.email,
              d.phone,
              d.add1,
              d.city,
              d.add2,
              d.country,
              d.postcode,
              CASE
                WHEN td.freq = 0 THEN 'One-Time'
                WHEN td.freq = 1 THEN 'Monthly'
                WHEN td.freq = 2 THEN 'Yearly'
                WHEN td.freq = 3 THEN 'Daily'
                ELSE 'Unknown'
              END as frequency_name
            FROM `{$tables['transactions']}` t
            LEFT JOIN `{$tables['details']}` td ON t.id = td.TID
            LEFT JOIN `{$tables['donors']}` d ON d.id = t.did
            WHERE {$whereClause}
            GROUP BY t.id, t.order_id, t.date, t.totalamount, td.freq, t.status, t.paymenttype,
                     d.firstname, d.lastname, d.email, d.phone, d.add1, d.city, d.add2, d.country, d.postcode
            ORDER BY t.date DESC
            LIMIT ? OFFSET ?
        ";

        $rows = collect(DB::select($sql, array_merge($params, [$limit, $offset])));

        return ['data' => $rows, 'totalCount' => $totalCount];
    }

    public function getAllSchedulesForExport(array $filters): Collection
    {
        [$whereClause, $params] = $this->buildWhereClause($filters);
        $tables = $this->getTables();

        $sql = "
            SELECT
              t.order_id,
              t.date as start_date,
              d.firstname,
              d.lastname,
              d.email,
              d.phone,
              t.totalamount as amount,
              CASE
                WHEN td.freq = 0 THEN 'One-Time'
                WHEN td.freq = 1 THEN 'Monthly'
                WHEN td.freq = 2 THEN 'Yearly'
                WHEN td.freq = 3 THEN 'Daily'
                ELSE 'Unknown'
              END as frequency,
              t.status,
              t.paymenttype as payment_method
            FROM `{$tables['transactions']}` t
            LEFT JOIN `{$tables['details']}` td ON t.id = td.TID
            LEFT JOIN `{$tables['donors']}` d ON d.id = t.did
            WHERE {$whereClause}
            ORDER BY t.date DESC
        ";

        return collect(DB::select($sql, $params));
    }

    public function getDetailsForSchedules(array $filters, array $scheduleIds): Collection
    {
        if (empty($scheduleIds)) {
            return collect();
        }

        $tables = $this->getTables();
        $tables['appeal'] = TableResolver::prefixed('appeal');
        $tables['amount'] = TableResolver::prefixed('amount');
        $tables['fundlist'] = TableResolver::prefixed('fundlist');

        $detail = $tables['details'];
        $tx = $tables['transactions'];

        return DB::table($detail)
            ->whereIn("{$detail}.TID", $scheduleIds)
            ->leftJoin($tables['appeal'], "{$tables['appeal']}.id", '=', "{$detail}.appeal_id")
            ->leftJoin($tables['amount'], "{$tables['amount']}.id", '=', "{$detail}.amount_id")
            ->leftJoin($tables['fundlist'], "{$tables['fundlist']}.id", '=', "{$detail}.fundlist_id")
            ->leftJoin($tx, "{$tx}.id", '=', "{$detail}.TID")
            ->select([
                "{$detail}.id",
                "{$detail}.TID as transaction_id",
                "{$tx}.date",
                "{$tx}.order_id",
                "{$tx}.status",
                "{$tx}.paymenttype as payment_method",
                "{$detail}.freq",
                "{$detail}.quantity",
                "{$detail}.amount as other_amount",
                DB::raw("({$detail}.amount * {$detail}.quantity) as line_total"),
                "{$tables['appeal']}.name as donation_type",
                "{$tables['amount']}.name as amount_name",
                "{$tables['fundlist']}.name as fund_name",
            ])
            ->orderBy("{$detail}.TID", 'DESC')
            ->orderBy("{$detail}.id")
            ->get();
    }

    public function createSchedule(array $data): int
    {
        $scheduleTable = TableResolver::prefixed('schedule');
        return (int) DB::table($scheduleTable)->insertGetId($data);
    }

    protected function buildWhereClause(array $filters): array
    {
        $conditions = ['td.freq IN (1, 2, 3)'];
        $params = [];

        if (!empty($filters['status'])) {
            $conditions[] = 't.status = ?';
            $params[] = $filters['status'];
        }
        if (!empty($filters['fromDate'])) {
            $conditions[] = 't.date >= ?';
            $params[] = $filters['fromDate'];
        }
        if (!empty($filters['toDate'])) {
            $conditions[] = 't.date <= ?';
            $params[] = $filters['toDate'];
        }
        if (array_key_exists('frequency', $filters) && $filters['frequency'] !== '' && $filters['frequency'] !== null) {
            $conditions[] = 'td.freq = ?';
            $params[] = (int) $filters['frequency'];
        }
        if (!empty($filters['search'])) {
            $searchTerm = '%' . $filters['search'] . '%';
            $conditions[] = '(d.firstname LIKE ? OR d.lastname LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = implode(' AND ', $conditions);

        return [$whereClause, $params];
    }

    protected function getTables(): array
    {
        return [
            'transactions' => TableResolver::prefixed('transactions'),
            'details' => TableResolver::prefixed('transaction_details'),
            'donors' => TableResolver::prefixed('donors'),
        ];
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
