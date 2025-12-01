<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FundController extends Controller
{
    public function list(Request $request): JsonResponse
    {
        $appealId = (int)$request->query('appeal_id', 0);
        if ($appealId <= 0) {
            return response()->json(['success' => false, 'error' => 'appeal_id is required'], 400);
        }

        $table = TableResolver::prefixed('fundlist');
        $rows = DB::table($table)
            ->where('appeal_id', $appealId)
            ->orderBy('sort')
            ->orderBy('id')
            ->get();

        $data = $rows->map(function ($r) {
            $disable = (int)($r->disable ?? 0);
            return [
                'id' => (int)$r->id,
                'appeal_id' => (int)$r->appeal_id,
                'name' => $r->name ?? '',
                'sort' => isset($r->sort) ? (int)$r->sort : 0,
                'status' => $disable === 0 ? 'Enable' : 'Disable',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'message' => 'Retrieved funds',
        ]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $appealId = (int)$request->input('appeal_id', 0);
        $funds = $request->input('funds', []);

        if ($appealId <= 0) {
            return response()->json(['success' => false, 'error' => 'appeal_id is required'], 400);
        }

        if (empty($funds) && $request->has('funds_count')) {
            // Support legacy form-data shape
            $count = (int)$request->input('funds_count', 0);
            for ($i = 1; $i <= $count; $i++) {
                $funds[] = [
                    'id' => $request->input("fund_id_{$i}"),
                    'name' => $request->input("fund_name_{$i}", ''),
                    'sort' => $request->input("fund_sort_{$i}", 0),
                    'status' => $request->input("fund_enable_{$i}", 0) == 0 ? 'Enable' : 'Disable',
                ];
            }
        }

        $table = TableResolver::prefixed('fundlist');

        foreach ($funds as $fund) {
            $id = isset($fund['id']) ? (int)$fund['id'] : null;
            $payload = [
                'appeal_id' => $appealId,
                'name' => $fund['name'] ?? '',
                'sort' => isset($fund['sort']) ? (int)$fund['sort'] : 0,
                'disable' => ($fund['status'] ?? 'Enable') === 'Enable' ? 0 : 1,
            ];

            if ($id) {
                DB::table($table)->where('id', $id)->update($payload);
            } else {
                DB::table($table)->insert($payload);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Funds saved',
        ]);
    }
}
