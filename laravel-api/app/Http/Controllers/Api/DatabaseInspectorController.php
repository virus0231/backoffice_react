<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DatabaseInspectorController extends Controller
{
    /**
     * List all tables in the database
     */
    public function listTables(): JsonResponse
    {
        try {
            $tables = DB::select('SHOW TABLES');
            $databaseName = DB::getDatabaseName();
            $tableKey = "Tables_in_{$databaseName}";

            $tableList = array_map(function ($table) use ($tableKey) {
                return $table->$tableKey;
            }, $tables);

            return response()->json([
                'success' => true,
                'database' => $databaseName,
                'tables' => $tableList,
                'count' => count($tableList),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get detailed information about a specific table
     */
    public function inspectTable(Request $request, string $tableName): JsonResponse
    {
        try {
            // Check if table exists
            if (!Schema::hasTable($tableName)) {
                return response()->json([
                    'success' => false,
                    'error' => "Table '{$tableName}' does not exist",
                ], 404);
            }

            // Get column information
            $columns = DB::select("DESCRIBE {$tableName}");

            // Get table row count
            $rowCount = DB::table($tableName)->count();

            // Get indexes
            $indexes = DB::select("SHOW INDEX FROM {$tableName}");

            // Format column information
            $columnDetails = array_map(function ($column) {
                return [
                    'name' => $column->Field,
                    'type' => $column->Type,
                    'null' => $column->Null === 'YES',
                    'key' => $column->Key,
                    'default' => $column->Default,
                    'extra' => $column->Extra,
                ];
            }, $columns);

            // Format index information
            $indexDetails = [];
            foreach ($indexes as $index) {
                $keyName = $index->Key_name;
                if (!isset($indexDetails[$keyName])) {
                    $indexDetails[$keyName] = [
                        'name' => $keyName,
                        'unique' => $index->Non_unique == 0,
                        'type' => $index->Index_type,
                        'columns' => [],
                    ];
                }
                $indexDetails[$keyName]['columns'][] = $index->Column_name;
            }

            return response()->json([
                'success' => true,
                'table' => $tableName,
                'row_count' => $rowCount,
                'columns' => $columnDetails,
                'indexes' => array_values($indexDetails),
                'column_count' => count($columnDetails),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Quick column check for a specific table
     */
    public function getColumns(Request $request, string $tableName): JsonResponse
    {
        try {
            if (!Schema::hasTable($tableName)) {
                return response()->json([
                    'success' => false,
                    'error' => "Table '{$tableName}' does not exist",
                ], 404);
            }

            $columns = Schema::getColumnListing($tableName);

            return response()->json([
                'success' => true,
                'table' => $tableName,
                'columns' => $columns,
                'count' => count($columns),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get sample data from a table
     */
    public function getSampleData(Request $request, string $tableName): JsonResponse
    {
        try {
            if (!Schema::hasTable($tableName)) {
                return response()->json([
                    'success' => false,
                    'error' => "Table '{$tableName}' does not exist",
                ], 404);
            }

            $limit = (int) $request->query('limit', 5);
            $limit = min($limit, 50); // Max 50 rows

            $data = DB::table($tableName)->limit($limit)->get();

            return response()->json([
                'success' => true,
                'table' => $tableName,
                'sample_data' => $data,
                'count' => $data->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search for tables containing a specific column name
     */
    public function findTablesWithColumn(Request $request): JsonResponse
    {
        try {
            $columnName = $request->query('column');

            if (!$columnName) {
                return response()->json([
                    'success' => false,
                    'error' => 'Column name is required',
                ], 400);
            }

            $databaseName = DB::getDatabaseName();

            $tables = DB::select("
                SELECT DISTINCT TABLE_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = ?
                AND COLUMN_NAME = ?
            ", [$databaseName, $columnName]);

            $tableList = array_map(function ($table) {
                return $table->TABLE_NAME;
            }, $tables);

            return response()->json([
                'success' => true,
                'column' => $columnName,
                'tables' => $tableList,
                'count' => count($tableList),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
