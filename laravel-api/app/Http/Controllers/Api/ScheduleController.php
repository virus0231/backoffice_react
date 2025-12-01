<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ScheduleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $transactionsTable = TableResolver::prefixed('transactions');
        $detailsTable = TableResolver::prefixed('transaction_details');
        $donorsTable = TableResolver::prefixed('donors');

        $status = $request->query('status');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');
        $search = $request->query('search');
        $frequency = $request->query('frequency');
        $offset = (int)$request->query('offset', 0);
        $limit = (int)$request->query('limit', 500);

        $conditions = ['td.freq IN (1, 2, 3)'];
        $params = [];

        if ($status) {
            $conditions[] = 't.status = ?';
            $params[] = $status;
        }
        if ($fromDate) {
            $conditions[] = 't.date >= ?';
            $params[] = $fromDate;
        }
        if ($toDate) {
            $conditions[] = 't.date <= ?';
            $params[] = $toDate;
        }
        if ($frequency !== null && $frequency !== '') {
            $conditions[] = 'td.freq = ?';
            $params[] = (int)$frequency;
        }
        if ($search) {
            $searchTerm = '%' . $search . '%';
            $conditions[] = '(d.firstname LIKE ? OR d.lastname LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = implode(' AND ', $conditions);

        $totalCount = 0;
        if ($offset === 0) {
            $countSql = "
                SELECT COUNT(DISTINCT t.id) as total
                FROM `{$transactionsTable}` t
                LEFT JOIN `{$detailsTable}` td ON t.id = td.TID
                LEFT JOIN `{$donorsTable}` d ON d.id = t.did
                WHERE {$whereClause}
            ";
            $totalCount = (int)DB::selectOne($countSql, $params)->total;
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
            FROM `{$transactionsTable}` t
            LEFT JOIN `{$detailsTable}` td ON t.id = td.TID
            LEFT JOIN `{$donorsTable}` d ON d.id = t.did
            WHERE {$whereClause}
            GROUP BY t.id, t.order_id, t.date, t.totalamount, td.freq, t.status, t.paymenttype, d.firstname, d.lastname, d.email, d.phone
            ORDER BY t.date DESC
            LIMIT ? OFFSET ?
        ";

        $rows = DB::select($sql, array_merge($params, [$limit, $offset]));

        $data = collect($rows)->map(function ($r) {
            return [
                'id' => (int)$r->id,
                'order_id' => $r->order_id,
                'donationType' => $r->donation_type ?? 'N/A',
                'startDate' => $r->start_date,
                'name' => trim(($r->firstname ?? '') . ' ' . ($r->lastname ?? '')) ?: 'N/A',
                'email' => $r->email ?? 'N/A',
                'phone' => $r->phone ?? 'N/A',
                'amount' => (float)$r->amount,
                'frequency' => $r->frequency_name,
                'status' => $r->status,
            ];
        });

        $response = [
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'message' => 'Retrieved schedules',
        ];

        if ($offset === 0) {
            $response['totalCount'] = $totalCount;
        }

        return response()->json($response);
    }

    public function export(Request $request): StreamedResponse
    {
        $transactionsTable = TableResolver::prefixed('transactions');
        $detailsTable = TableResolver::prefixed('transaction_details');
        $donorsTable = TableResolver::prefixed('donors');

        $status = $request->query('status');
        $fromDate = $request->query('from_date');
        $toDate = $request->query('to_date');
        $search = $request->query('search');
        $frequency = $request->query('frequency');

        $conditions = ['td.freq IN (1, 2, 3)'];
        $params = [];

        if ($status) {
            $conditions[] = 't.status = ?';
            $params[] = $status;
        }
        if ($fromDate) {
            $conditions[] = 't.date >= ?';
            $params[] = $fromDate;
        }
        if ($toDate) {
            $conditions[] = 't.date <= ?';
            $params[] = $toDate;
        }
        if ($frequency !== null && $frequency !== '') {
            $conditions[] = 'td.freq = ?';
            $params[] = (int)$frequency;
        }
        if ($search) {
            $searchTerm = '%' . $search . '%';
            $conditions[] = '(d.firstname LIKE ? OR d.lastname LIKE ? OR d.email LIKE ? OR d.phone LIKE ?)';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereClause = implode(' AND ', $conditions);

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
            FROM `{$transactionsTable}` t
            LEFT JOIN `{$detailsTable}` td ON t.id = td.TID
            LEFT JOIN `{$donorsTable}` d ON d.id = t.did
            WHERE {$whereClause}
            ORDER BY t.date DESC
        ";

        $rows = DB::select($sql, $params);

        $response = new StreamedResponse(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Order ID', 'Start Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Amount', 'Frequency', 'Status', 'Payment Method']);
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row->order_id,
                    $row->start_date,
                    $row->firstname ?? '',
                    $row->lastname ?? '',
                    $row->email ?? '',
                    $row->phone ?? '',
                    $row->amount,
                    $row->frequency,
                    $row->status,
                    $row->payment_method ?? '',
                ]);
            }
            fclose($out);
        });

        $filename = 'schedules_' . date('Y-m-d_His') . '.csv';
        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('Expires', '0');

        return $response;
    }
}
