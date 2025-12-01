<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function campaigns(Request $request): JsonResponse
    {
        $transactionsTable = TableResolver::prefixed('transactions');

        $campaigns = $request->query('campaigns');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');
        $donorEmail = $request->query('donor_email');

        $conditions = ["t.status IN ('Completed', 'pending')"];
        $params = [];

        if ($fromDate) {
            $conditions[] = 't.date >= ?';
            $params[] = $fromDate;
        }
        if ($toDate) {
            $conditions[] = 't.date <= ?';
            $params[] = $toDate;
        }
        if ($campaigns) {
            $conditions[] = 't.campaigns LIKE ?';
            $params[] = '%' . $campaigns . '%';
        }
        if ($donorEmail) {
            $conditions[] = 't.email = ?';
            $params[] = $donorEmail;
        }

        $whereClause = implode(' AND ', $conditions);

        $sql = "
            SELECT
              t.campaigns as campaign_name,
              COUNT(t.id) as donation_count,
              SUM(t.totalamount) as total_amount
            FROM `{$transactionsTable}` t
            WHERE {$whereClause}
            GROUP BY t.campaigns
            ORDER BY total_amount DESC
        ";

        $rows = DB::select($sql, $params);

        $data = collect($rows)->map(function ($r) {
            return [
                'name' => $r->campaign_name ?? 'Unknown',
                'totalAmount' => (float)$r->total_amount,
                'donations' => (int)$r->donation_count,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'total_amount' => array_sum(array_column($rows, 'total_amount')),
            'message' => 'Retrieved campaign report',
        ]);
    }

    public function causes(Request $request): JsonResponse
    {
        $appealTable = TableResolver::prefixed('appeal');
        $categoryTable = TableResolver::prefixed('category');
        $detailsTable = TableResolver::prefixed('transaction_details');
        $transactionsTable = TableResolver::prefixed('transactions');
        $fundTable = TableResolver::prefixed('fundlist');

        $appealId = $request->query('appeal_id');
        $categoryId = $request->query('category_id');
        $countryName = $request->query('country');
        $minAmount = $request->query('min_amount');
        $maxAmount = $request->query('max_amount');

        $conditions = ['1=1'];
        $params = [];

        if ($appealId) {
            $conditions[] = 'ap.id = ?';
            $params[] = (int)$appealId;
        }
        if ($categoryId) {
            $conditions[] = 'ap.category = ?';
            $params[] = (int)$categoryId;
        }
        if ($countryName) {
            $conditions[] = 'ap.country = ?';
            $params[] = $countryName;
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
            FROM `{$appealTable}` ap
            LEFT JOIN `{$categoryTable}` cat ON cat.id = ap.category
            LEFT JOIN `{$detailsTable}` td ON td.appeal_id = ap.id
            LEFT JOIN `{$transactionsTable}` t ON t.id = td.TID AND t.status IN ('Completed', 'pending')
            LEFT JOIN `{$fundTable}` f ON f.id = td.fundlist_id
            WHERE {$whereClause}
            GROUP BY ap.id, ap.name, ap.category, ap.country, cat.name
            ORDER BY total_amount DESC, ap.name ASC
        ";

        $rows = DB::select($sql, $params);

        $filteredRows = collect($rows)->filter(function ($row) use ($minAmount, $maxAmount) {
            $amount = (float)$row->total_amount;
            if ($minAmount !== null && $amount < (float)$minAmount) {
                return false;
            }
            if ($maxAmount !== null && $amount > (float)$maxAmount) {
                return false;
            }
            return true;
        });

        $data = $filteredRows->map(function ($r) {
            return [
                'id' => (int)$r->id,
                'appeal' => $r->appeal_name,
                'amount' => (float)($r->total_amount ?? 0),
                'fundList' => $r->fund_names ?? 'N/A',
                'category' => $r->category_name ?? 'N/A',
                'country' => $r->country ?? 'N/A',
                'donations' => (int)$r->donation_count,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'total_amount' => $filteredRows->sum('total_amount'),
            'message' => 'Retrieved causes report',
        ]);
    }

    public function funds(Request $request): JsonResponse
    {
        $detailsTable = TableResolver::prefixed('transaction_details');
        $transactionsTable = TableResolver::prefixed('transactions');
        $fundTable = TableResolver::prefixed('fundlist');

        $fundId = $request->query('fund_id');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');

        $conditions = ["t.status IN ('Completed', 'pending')"];
        $params = [];

        if ($fundId) {
            $conditions[] = 'td.fundlist_id = ?';
            $params[] = (int)$fundId;
        }
        if ($fromDate) {
            $conditions[] = 't.date >= ?';
            $params[] = $fromDate;
        }
        if ($toDate) {
            $conditions[] = 't.date <= ?';
            $params[] = $toDate;
        }

        $whereClause = implode(' AND ', $conditions);

        $sql = "
            SELECT
              f.id,
              f.name as fund_name,
              COUNT(DISTINCT t.id) as donation_count,
              SUM(t.totalamount) as total_amount
            FROM `{$detailsTable}` td
            LEFT JOIN `{$transactionsTable}` t ON t.id = td.TID
            LEFT JOIN `{$fundTable}` f ON f.id = td.fundlist_id
            WHERE {$whereClause}
            GROUP BY f.id, f.name
            ORDER BY total_amount DESC
        ";

        $rows = DB::select($sql, $params);

        $data = collect($rows)->map(function ($r) {
            return [
                'id' => (int)$r->id,
                'name' => $r->fund_name ?? 'Unknown Fund',
                'totalAmount' => (float)($r->total_amount ?? 0),
                'donations' => (int)$r->donation_count,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'total_amount' => array_sum(array_column($rows, 'total_amount')),
            'message' => 'Retrieved fund report',
        ]);
    }
}
