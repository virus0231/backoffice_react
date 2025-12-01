<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FeaturedAmountController extends Controller
{
    public function index(): JsonResponse
    {
        $amountTable = TableResolver::prefixed('amount');
        $appealTable = TableResolver::prefixed('appeal');

        $rows = DB::table($amountTable . ' as a')
            ->leftJoin($appealTable . ' as ap', 'ap.id', '=', 'a.appeal_id')
            ->where('a.featured', 1)
            ->orderBy('a.sort')
            ->orderBy('a.name')
            ->get([
                'a.id',
                'a.name',
                'a.amount',
                'a.disable as status',
                'ap.name as appeal_name',
            ]);

        return response()->json([
            'success' => true,
            'data' => $rows->map(fn ($r) => [
                'id' => (int)$r->id,
                'name' => $r->name,
                'amount' => (float)$r->amount,
                'appeal_name' => $r->appeal_name ?? 'N/A',
                'status' => (int)($r->status ?? 0) === 0,
            ]),
            'count' => $rows->count(),
            'message' => 'Retrieved featured amounts',
        ]);
    }

    public function toggle(Request $request, int $id): JsonResponse
    {
        $status = $request->boolean('status', null);
        if ($status === null) {
            return response()->json(['success' => false, 'error' => 'status is required'], 400);
        }

        $amountTable = TableResolver::prefixed('amount');
        DB::table($amountTable)->where('id', $id)->update(['disable' => $status ? 0 : 1]);

        return response()->json([
            'success' => true,
            'message' => 'Status updated',
        ]);
    }
}
