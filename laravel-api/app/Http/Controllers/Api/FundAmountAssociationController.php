<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FundAmountAssociationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $appealId = (int)$request->query('appeal_id', 0);
        if ($appealId <= 0) {
            return response()->json(['success' => false, 'error' => 'appeal_id is required'], 400);
        }

        $amountTable = TableResolver::prefixed('amount');
        $fundTable = TableResolver::prefixed('fundlist');
        $comboTable = TableResolver::prefixed('fund_amount_combo');

        $amounts = DB::table($amountTable)
            ->where('appeal_id', $appealId)
            ->orderBy('sort')
            ->orderBy('id')
            ->get(['id', 'name', 'amount']);

        $funds = DB::table($fundTable)
            ->where('appeal_id', $appealId)
            ->orderBy('sort')
            ->orderBy('id')
            ->get(['id', 'name']);

        $associations = DB::table($comboTable)
            ->where('appealid', $appealId)
            ->get(['amountid', 'fundlistid'])
            ->map(fn ($r) => [
                'amountId' => (int)$r->amountid,
                'fundId' => (int)$r->fundlistid,
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'amounts' => $amounts->map(fn ($r) => [
                    'id' => (int)$r->id,
                    'name' => $r->name ?? '',
                    'amount' => $r->amount ?? '',
                ]),
                'funds' => $funds->map(fn ($r) => [
                    'id' => (int)$r->id,
                    'name' => $r->name ?? '',
                ]),
                'associations' => $associations,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $appealId = (int)$request->input('appeal_id', 0);
        if ($appealId <= 0) {
            return response()->json(['success' => false, 'error' => 'appeal_id is required'], 400);
        }

        $associations = $request->input('associations', []);

        // Support legacy fund_ids shape like "appeal_amount_fund"
        if (empty($associations) && $request->has('fund_ids')) {
            $fundIds = $request->input('fund_ids', []);
            foreach ($fundIds as $fid) {
                $parts = explode('_', (string)$fid);
                if (count($parts) === 3) {
                    $associations[] = [
                        'appealId' => (int)$parts[0],
                        'amountId' => (int)$parts[1],
                        'fundId' => (int)$parts[2],
                    ];
                }
            }
        }

        $comboTable = TableResolver::prefixed('fund_amount_combo');

        // Replace associations for this appeal
        DB::table($comboTable)->where('appealid', $appealId)->delete();

        foreach ($associations as $assoc) {
            $amountId = (int)($assoc['amountId'] ?? 0);
            $fundId = (int)($assoc['fundId'] ?? 0);
            if ($amountId > 0 && $fundId > 0) {
                DB::table($comboTable)->insert([
                    'appealid' => $appealId,
                    'amountid' => $amountId,
                    'fundlistid' => $fundId,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Associations saved',
        ]);
    }
}
