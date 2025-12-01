<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\TableResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CountryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $name = trim((string)$request->input('name', ''));
        if ($name === '') {
            return response()->json(['success' => false, 'error' => 'name is required'], 400);
        }

        $table = TableResolver::prefixed('country');
        $id = DB::table($table)->insertGetId(['name' => $name]);

        return response()->json([
            'success' => true,
            'message' => 'Country created',
            'data' => ['id' => $id, 'name' => $name],
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $name = trim((string)$request->input('name', ''));
        if ($name === '') {
            return response()->json(['success' => false, 'error' => 'name is required'], 400);
        }

        $table = TableResolver::prefixed('country');
        DB::table($table)->where('id', $id)->update(['name' => $name]);

        return response()->json([
            'success' => true,
            'message' => 'Country updated',
            'data' => ['id' => $id, 'name' => $name],
        ]);
    }
}
