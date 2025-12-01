<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class DonationExportController extends Controller
{
    public function data(Request $request): JsonResponse
    {
        // Implements legacy getReportData.php (donations section)
        if (!$request->has('GetReport')) {
            return response()->json(['success' => false, 'error' => 'GetReport is required'], 400);
        }

        [$txTable, $detailTable, $donorTable] = [
            TableResolver::prefixed('transactions'),
            TableResolver::prefixed('transaction_details'),
            TableResolver::prefixed('donors'),
        ];

        $startDate = (string)$request->input('startDate', '');
        $endDate = (string)$request->input('endDate', '');
        $status = (string)$request->input('status', '0');
        $paymentType = (string)$request->input('paymentType', '0');
        $frequency = (string)$request->input('frequency', '');
        $txtsearch = (string)$request->input('txtsearch', '');
        $orderid = (string)$request->input('orderid', '');
        $donationType = $request->input('donationType', []); // appeal ids array
        if (!is_array($donationType)) {
            $donationType = [$donationType];
        }

        if ($request->has('loadData')) {
            $startRow = (int)$request->input('loadData', 0);
            $chunkSize = min((int)$request->input('chunkSize', 50), 1000);

            $query = $this->baseQuery($txTable, $detailTable, $donorTable, $startDate, $endDate, $donationType, $status, $paymentType, $frequency, $txtsearch, $orderid);
            $rows = $query
                ->select([
                    "{$txTable}.*",
                    "{$donorTable}.firstname",
                    "{$donorTable}.lastname",
                    "{$donorTable}.email",
                    "{$donorTable}.phone",
                ])
                ->offset($startRow)
                ->limit($chunkSize)
                ->get();

            // Return raw array to match legacy expectations
            return response()->json($rows);
        }

        // Count only (return raw number)
        $count = $this->baseQuery($txTable, $detailTable, $donorTable, $startDate, $endDate, $donationType, $status, $paymentType, $frequency, $txtsearch, $orderid)
            ->distinct()
            ->count("{$txTable}.id");

        return response()->json($count);
    }

    public function export(Request $request): StreamedResponse
    {
        // btnexport_summary or btnexport (detail)
        $isSummary = $request->has('btnexport_summary');
        $isDetail = $request->has('btnexport') || $request->has('btnexport_detail');

        if (!$isSummary && !$isDetail) {
            return response()->stream(fn () => null, 400);
        }

        [$txTable, $detailTable, $donorTable, $appealTable, $amountTable, $fundTable] = [
            TableResolver::prefixed('transactions'),
            TableResolver::prefixed('transaction_details'),
            TableResolver::prefixed('donors'),
            TableResolver::prefixed('appeal'),
            TableResolver::prefixed('amount'),
            TableResolver::prefixed('fundlist'),
        ];

        $startDate = (string)$request->input('startDate', '');
        $endDate = (string)$request->input('endDate', '');
        $status = (string)$request->input('status', '0');
        $paymentType = (string)$request->input('paymentType', '0');
        $frequency = (string)$request->input('frequency', '');
        $txtsearch = (string)$request->input('txtsearch', '');
        $orderid = (string)$request->input('orderid', '');
        $donationType = $request->input('donationType', []); // appeal ids array
        if (!is_array($donationType)) {
            $donationType = [$donationType];
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=' . ($isSummary ? 'ExportSummary.csv' : 'ExportDetail.csv'),
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $callback = function () use (
            $isSummary,
            $txTable,
            $detailTable,
            $donorTable,
            $appealTable,
            $amountTable,
            $fundTable,
            $startDate,
            $endDate,
            $donationType,
            $status,
            $paymentType,
            $frequency,
            $txtsearch,
            $orderid
        ) {
            $handle = fopen('php://output', 'w');

            if ($isSummary) {
                fputcsv($handle, ['SNO', 'Date', 'First Name', 'Last Name', 'Email', 'Phone Number', 'City', 'Country', 'State', 'Postal Code', 'Card Fee', 'Total Amount', 'Charge Amount', 'Transaction ID', 'Order ID', 'Status', 'Notes']);

                $rows = $this->baseQuery($txTable, $detailTable, $donorTable, $startDate, $endDate, $donationType, $status, $paymentType, $frequency, $txtsearch, $orderid)
                    ->select([
                        "{$txTable}.id",
                        "{$txTable}.date",
                        "{$donorTable}.firstname",
                        "{$donorTable}.lastname",
                        "{$donorTable}.email",
                        "{$donorTable}.phone",
                        "{$donorTable}.city",
                        "{$donorTable}.country",
                        "{$donorTable}.add2 as state",
                        "{$donorTable}.postcode",
                        "{$txTable}.card_fee",
                        "{$txTable}.totalamount",
                        "{$txTable}.charge_amount",
                        "{$txTable}.TID",
                        "{$txTable}.order_id",
                        "{$txTable}.status",
                        "{$txTable}.notes",
                    ])
                    ->orderBy("{$txTable}.id")
                    ->get();

                $i = 1;
                foreach ($rows as $row) {
                    fputcsv($handle, [
                        $i++,
                        $row->date,
                        $row->firstname,
                        $row->lastname,
                        $row->email,
                        $row->phone,
                        $row->city,
                        $row->country,
                        $row->state,
                        $row->postcode,
                        $row->card_fee,
                        $row->totalamount,
                        $row->charge_amount,
                        $row->TID,
                        $row->order_id,
                        $row->status,
                        $row->notes,
                    ]);
                }
            } else {
                fputcsv($handle, [
                    'SNO', 'Date', 'Donation Name', 'Amount Type', 'Fund Type',
                    'Order ID', 'Frequency',
                    'Transaction ID', 'Amount', 'Quantity', 'Sub Total',
                    'Card Fee', 'Total Amount', 'First Name', 'Last Name', 'Email', 'Phone Number',
                    'Address', 'City', 'Country', 'State', 'Postal Code', 'Notes',
                    'Payment Type', 'Status'
                ]);

                $rows = $this->baseQuery($txTable, $detailTable, $donorTable, $startDate, $endDate, $donationType, $status, $paymentType, $frequency, $txtsearch, $orderid)
                    ->join($appealTable, "{$appealTable}.id", '=', "{$detailTable}.appeal_id")
                    ->join($amountTable, "{$amountTable}.id", '=', "{$detailTable}.amount_id")
                    ->join($fundTable, "{$fundTable}.id", '=', "{$detailTable}.fundlist_id")
                    ->select([
                        "{$txTable}.date",
                        "{$appealTable}.name as appeal_name",
                        "{$amountTable}.name as amount_name",
                        "{$fundTable}.name as fund_name",
                        "{$txTable}.order_id",
                        "{$detailTable}.freq",
                        "{$txTable}.TID",
                        "{$detailTable}.amount",
                        "{$detailTable}.quantity",
                        "{$txTable}.card_fee",
                        "{$txTable}.totalamount",
                        "{$donorTable}.firstname",
                        "{$donorTable}.lastname",
                        "{$donorTable}.email",
                        "{$donorTable}.phone",
                        "{$donorTable}.add1",
                        "{$donorTable}.city",
                        "{$donorTable}.country",
                        "{$donorTable}.add2",
                        "{$donorTable}.postcode",
                        "{$txTable}.notes",
                        "{$txTable}.paymenttype",
                        "{$txTable}.status",
                    ])
                    ->orderBy("{$detailTable}.TID", 'DESC')
                    ->get();

                $i = 1;
                foreach ($rows as $row) {
                    $sub = ($row->amount ?? 0) * ($row->quantity ?? 0);
                    $card = ($row->card_fee ?? 0) != 0 ? ($sub * 0.03) : 0;
                    $freqLabel = match ((string)$row->freq) {
                        '0' => 'One-Off',
                        '1' => 'Monthly',
                        '2' => 'Yearly',
                        '3' => 'Daily',
                        default => $row->freq,
                    };

                    fputcsv($handle, [
                        $i++,
                        $row->date,
                        $row->appeal_name,
                        $row->amount_name,
                        $row->fund_name,
                        $row->order_id,
                        $freqLabel,
                        $row->TID,
                        $row->amount,
                        $row->quantity,
                        $sub,
                        $card,
                        $sub + $card,
                        $row->firstname,
                        $row->lastname,
                        $row->email,
                        $row->phone,
                        $row->add1,
                        $row->city,
                        $row->country,
                        $row->add2,
                        $row->postcode,
                        $row->notes,
                        $row->paymenttype,
                        $row->status,
                    ]);
                }
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    private function baseQuery(string $tx, string $detail, string $donor, ?string $startDate, ?string $endDate, array $donationType, string $status, string $paymentType, string $frequency, string $txtsearch, string $orderid)
    {
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
}
