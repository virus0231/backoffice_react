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
              d.firstname,
              d.lastname,
              d.email,
              d.phone,
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
            GROUP BY t.id, t.order_id, t.date, t.totalamount, td.freq, t.status, t.paymenttype, d.firstname, d.lastname, d.email, d.phone
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
