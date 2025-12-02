<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ScheduleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ScheduleController extends Controller
{
    public function __construct(private readonly ScheduleService $scheduleService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $result = $this->scheduleService->getPaginatedSchedules($request->query());

        $response = [
            'success' => true,
            'data' => $result['data'],
            'count' => $result['count'],
            'message' => 'Retrieved schedules',
        ];

        if ($result['totalCount'] !== null) {
            $response['totalCount'] = $result['totalCount'];
        }

        return response()->json($response);
    }

    public function export(Request $request): StreamedResponse
    {
        $rows = $this->scheduleService->getSchedulesForExport($request->query());

        $response = new StreamedResponse(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Order ID', 'Start Date', 'First Name', 'Last Name', 'Email', 'Phone', 'Amount', 'Frequency', 'Status', 'Payment Method']);
            foreach ($rows as $row) {
                fputcsv($out, $row);
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
