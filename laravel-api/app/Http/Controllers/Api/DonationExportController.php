<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DonationExportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DonationExportController extends Controller
{
    public function __construct(private readonly DonationExportService $donationExportService)
    {
    }

    public function data(Request $request)
    {
        if (! $request->has('GetReport')) {
            return response()->json(['success' => false, 'error' => 'GetReport is required'], 400);
        }

        $result = $this->donationExportService->getData($request->all());

        // Return raw count or raw array (legacy shape expected)
        return response()->json($result);
    }

    public function export(Request $request): StreamedResponse
    {
        $isSummary = $request->has('btnexport_summary');
        $isDetail = $request->has('btnexport') || $request->has('btnexport_detail');

        if (! $isSummary && ! $isDetail) {
            return response()->stream(fn () => null, 400);
        }

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=' . ($isSummary ? 'ExportSummary.csv' : 'ExportDetail.csv'),
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        $params = $request->all();

        $callback = function () use ($isSummary, $params) {
            $handle = fopen('php://output', 'w');

            if ($isSummary) {
                fputcsv($handle, ['SNO', 'Date', 'First Name', 'Last Name', 'Email', 'Phone Number', 'City', 'Country', 'State', 'Postal Code', 'Card Fee', 'Total Amount', 'Charge Amount', 'Transaction ID', 'Order ID', 'Status', 'Notes']);
                $rows = $this->donationExportService->generateSummaryCsv($params);
            } else {
                fputcsv($handle, [
                    'SNO', 'Date', 'Donation Name', 'Amount Type', 'Fund Type',
                    'Order ID', 'Frequency',
                    'Transaction ID', 'Amount', 'Quantity', 'Sub Total',
                    'Card Fee', 'Total Amount', 'First Name', 'Last Name', 'Email', 'Phone Number',
                    'Address', 'City', 'Country', 'State', 'Postal Code', 'Notes',
                    'Payment Type', 'Status'
                ]);
                $rows = $this->donationExportService->generateDetailCsv($params);
            }

            foreach ($rows as $row) {
                fputcsv($handle, $row);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
