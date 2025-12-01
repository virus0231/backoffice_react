<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Amount;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AmountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $appealId = (int)$request->query('appeal_id', 0);
        if ($appealId <= 0) {
            return response()->json([
                'success' => false,
                'error' => 'appeal_id is required',
            ], 400);
        }

        $table = TableResolver::prefixed('amount');

        $rows = DB::table($table)
            ->where('appeal_id', $appealId)
            ->orderBy('sort')
            ->orderBy('id')
            ->get();

        $data = $rows->map(function ($r) {
            $disable = (int)($r->disable ?? 0);
            $featured = (int)($r->featured ?? 0);
            return [
                'id' => (int)$r->id,
                'appeal_id' => (int)$r->appeal_id,
                'name' => $r->name ?? '',
                'amount' => $r->amount ?? '',
                'donationtype' => $r->donationtype ?? '',
                'sort' => isset($r->sort) ? (int)$r->sort : 0,
                'featured' => $featured === 1 ? 'enabled' : 'disabled',
                'status' => $disable === 0 ? 'enabled' : 'disabled',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'message' => 'Retrieved amounts for appeal ' . $appealId,
        ]);
    }

    public function toggle(Request $request, Amount $amount): JsonResponse
    {
        $newStatus = $request->boolean('status', null);
        if ($newStatus === null) {
            return response()->json([
                'success' => false,
                'error' => 'status is required',
            ], 400);
        }

        // disable column is 0=enabled, 1=disabled
        $amount->disable = $newStatus ? 0 : 1;
        $amount->save();

        return response()->json([
            'success' => true,
            'message' => 'Status updated successfully',
            'data' => [
                'id' => $amount->id,
                'status' => $newStatus,
            ],
        ]);
    }
}
