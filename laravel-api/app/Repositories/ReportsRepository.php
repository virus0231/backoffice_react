<?php

namespace App\Repositories;

use App\Repositories\Contracts\ReportsRepositoryInterface;
use App\Support\TableResolver;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator as Paginator;

class ReportsRepository implements ReportsRepositoryInterface
{
    public function getCampaignsData(array $filters): array
    {
        $tables = $this->getTables();

        $conditions = ["t.status IN ('Completed', 'pending')"];
        $params = [];

        if (!empty($filters['fromDate'])) {
            $conditions[] = 't.date >= ?';
            $params[] = $filters['fromDate'];
        }
        if (!empty($filters['toDate'])) {
            $conditions[] = 't.date <= ?';
            $params[] = $filters['toDate'];
        }
        if (!empty($filters['campaigns'])) {
            $conditions[] = 'a.name LIKE ?';
            $params[] = '%' . $filters['campaigns'] . '%';
        }
        if (!empty($filters['donorEmail'])) {
            $conditions[] = 't.email = ?';
            $params[] = $filters['donorEmail'];
        }

        $whereClause = implode(' AND ', $conditions);

        $baseSql = "
            SELECT
              COALESCE(a.name, 'Unknown') as campaign_name,
              COUNT(DISTINCT t.id) as donation_count,
              SUM(t.totalamount) as total_amount
            FROM `{$tables['transactions']}` t
            LEFT JOIN `{$tables['details']}` td ON t.id = td.TID
            LEFT JOIN `{$tables['appeal']}` a ON a.id = td.appeal_id
            WHERE {$whereClause}
            GROUP BY a.name
        ";

        $countSql = "SELECT COUNT(*) as total FROM ({$baseSql}) grouped";
        $totalRows = DB::select($countSql, $params);
        $total = (int) ($totalRows[0]->total ?? 0);

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = max(1, min(100, (int) ($filters['perPage'] ?? 25)));
        $offset = ($page - 1) * $perPage;

        $pagedSql = $baseSql . " ORDER BY total_amount DESC LIMIT {$perPage} OFFSET {$offset}";
        $rows = collect(DB::select($pagedSql, $params));

        return ['data' => $rows, 'total' => $total];
    }

    public function getCausesData(array $filters): Collection
    {
        $tables = $this->getTables();

        $conditions = ['1=1'];
        $params = [];

        if (!empty($filters['appealId'])) {
            $conditions[] = 'ap.id = ?';
            $params[] = (int) $filters['appealId'];
        }
        if (!empty($filters['categoryId'])) {
            $conditions[] = 'ap.category = ?';
            $params[] = (int) $filters['categoryId'];
        }
        if (!empty($filters['country'])) {
            $conditions[] = 'ap.country = ?';
            $params[] = $filters['country'];
        }

        $whereClause = implode(' AND ', $conditions);

        $sql = "
            SELECT
              ap.id,
              ap.name as appeal_name,
              ap.category,
              ap.country,
              cat.name as category_name,
              COUNT(DISTINCT t.id) as donation_count,
              SUM(t.totalamount) as total_amount,
              GROUP_CONCAT(DISTINCT f.name SEPARATOR ', ') as fund_names
            FROM `{$tables['appeal']}` ap
            LEFT JOIN `{$tables['category']}` cat ON cat.id = ap.category
            LEFT JOIN `{$tables['details']}` td ON td.appeal_id = ap.id
            LEFT JOIN `{$tables['transactions']}` t ON t.id = td.TID AND t.status IN ('Completed', 'pending')
            LEFT JOIN `{$tables['fundlist']}` f ON f.id = td.fundlist_id
            WHERE {$whereClause}
            GROUP BY ap.id, ap.name, ap.category, ap.country, cat.name
            ORDER BY total_amount DESC, ap.name ASC
        ";

        return collect(DB::select($sql, $params));
    }

    public function getFundsData(array $filters): Collection
    {
        $tables = $this->getTables();

        $conditions = ["t.status IN ('Completed', 'pending')"];
        $params = [];

        if (!empty($filters['fundId'])) {
            $conditions[] = 'td.fundlist_id = ?';
            $params[] = (int) $filters['fundId'];
        }
        if (!empty($filters['fromDate'])) {
            $conditions[] = 't.date >= ?';
            $params[] = $filters['fromDate'];
        }
        if (!empty($filters['toDate'])) {
            $conditions[] = 't.date <= ?';
            $params[] = $filters['toDate'];
        }

        $whereClause = implode(' AND ', $conditions);

        $sql = "
            SELECT
              f.id,
              f.name as fund_name,
              COUNT(DISTINCT t.id) as donation_count,
              SUM(t.totalamount) as total_amount
            FROM `{$tables['details']}` td
            LEFT JOIN `{$tables['transactions']}` t ON t.id = td.TID
            LEFT JOIN `{$tables['fundlist']}` f ON f.id = td.fundlist_id
            WHERE {$whereClause}
            GROUP BY f.id, f.name
            ORDER BY total_amount DESC
        ";

        return collect(DB::select($sql, $params));
    }

    protected function getTables(): array
    {
        return [
            'transactions' => TableResolver::prefixed('transactions'),
            'details' => TableResolver::prefixed('transaction_details'),
            'appeal' => TableResolver::prefixed('appeal'),
            'category' => TableResolver::prefixed('category'),
            'fundlist' => TableResolver::prefixed('fundlist'),
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
