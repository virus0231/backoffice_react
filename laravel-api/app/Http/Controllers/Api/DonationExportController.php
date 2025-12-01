<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DonationExportController extends Controller
{
    public function data(Request $request): JsonResponse
    {
        // Lightweight placeholder; mirrors legacy behaviour:
        // - initial request expects a total count (number)
        // - subsequent requests expect an array of rows
        if ($request->has('loadData')) {
            return response()->json([]);
        }

        if ($request->has('GetReport')) {
            return response()->json(0);
        }

        $data = [
            'success' => true,
            'rows' => [],
        ];

        return response()->json($data);
    }

    public function export(Request $request): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="donations.csv"',
        ];

        $callback = function () {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Donor', 'Email', 'Amount', 'Date']);
            // No rows for now
            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }
}
