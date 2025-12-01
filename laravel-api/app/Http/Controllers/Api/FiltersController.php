<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FiltersController extends Controller
{
    public function appeals(): JsonResponse
    {
        $table = TableResolver::prefixed('appeal');
        $rows = DB::table($table)->get();

        $data = $rows->map(function ($r) {
            $disable = (int)($r->disable ?? 0);
            return [
                'id' => (int)$r->id,
                'appeal_name' => $r->appeal_name ?? ($r->name ?? 'Unnamed Appeal'),
                'status' => $disable === 0 ? 'active' : 'inactive',
                'start_date' => isset($r->start_date) && $r->start_date ? date(DATE_ISO8601, strtotime($r->start_date)) : null,
                'end_date' => isset($r->end_date) && $r->end_date ? date(DATE_ISO8601, strtotime($r->end_date)) : null,
                'description' => $r->description ?? null,
                'image' => $r->image ?? null,
                'category' => $r->category ?? null,
                'goal' => isset($r->goal) ? (float)$r->goal : null,
                'sort' => isset($r->sort) ? (int)$r->sort : null,
                'ishome_v' => isset($r->ishome_v) ? (int)$r->ishome_v : null,
                'isfooter' => isset($r->isfooter) ? (int)$r->isfooter : null,
                'isdonate_v' => isset($r->isdonate_v) ? (int)$r->isdonate_v : null,
                'isother_v' => isset($r->isother_v) ? (int)$r->isother_v : null,
                'isquantity_v' => isset($r->isquantity_v) ? (int)$r->isquantity_v : null,
                'isdropdown_v' => isset($r->isdropdown_v) ? (int)$r->isdropdown_v : null,
                'isrecurring_v' => isset($r->isrecurring_v) ? (int)$r->isrecurring_v : null,
                'recurring_interval' => $r->recurring_interval ?? null,
                'isassociate' => isset($r->isassociate) ? (int)$r->isassociate : null,
                'type' => $r->type ?? null,
                'country' => $r->country ?? null,
                'cause' => $r->cause ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'message' => 'Retrieved appeals',
        ]);
    }

    public function funds(Request $request): JsonResponse
    {
        $table = TableResolver::prefixed('fundlist');
        $appealIdsParam = $request->query('appeal_ids', '');

        $query = DB::table($table);
        $ids = collect(explode(',', (string)$appealIdsParam))
            ->map(fn ($v) => (int)$v)
            ->filter(fn ($v) => $v > 0)
            ->values();

        if ($ids->isNotEmpty()) {
            $query->whereIn('appeal_id', $ids->all());
        }

        $rows = $query->get();

        $data = $rows->map(function ($r) {
            $disable = (int)($r->disable ?? 0);
            return [
                'id' => (int)$r->id,
                'fund_name' => $r->fund_name ?? ($r->name ?? 'Unnamed Fund'),
                'is_active' => $disable === 0,
                'appeal_id' => isset($r->appeal_id) ? (int)$r->appeal_id : null,
                'category' => $r->category ?? null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'count' => $data->count(),
            'filters' => ['appeal_ids' => $appealIdsParam],
            'message' => 'Retrieved funds',
        ]);
    }

    public function categories(): JsonResponse
    {
        $table = TableResolver::prefixed('category');
        $rows = DB::table($table)->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'success' => true,
            'data' => $rows->map(fn ($r) => ['id' => (int)$r->id, 'name' => $r->name]),
            'count' => $rows->count(),
            'message' => 'Retrieved categories',
        ]);
    }

    public function countries(): JsonResponse
    {
        $table = TableResolver::prefixed('country');
        $rows = DB::table($table)->orderBy('name')->get(['id', 'name']);

        return response()->json([
            'success' => true,
            'data' => $rows->map(fn ($r) => ['id' => (int)$r->id, 'name' => $r->name]),
            'count' => $rows->count(),
            'message' => 'Retrieved countries',
        ]);
    }
}
