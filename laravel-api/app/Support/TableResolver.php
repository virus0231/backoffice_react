<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

/**
 * Resolves the first available table between two legacy prefixes.
 */
class TableResolver
{
    public static function firstExisting(array $candidates): ?string
    {
        // SQLite (used in tests) doesn't expose information_schema; just return the first candidate.
        if (DB::getDriverName() === 'sqlite') {
            return $candidates[0] ?? null;
        }

        foreach ($candidates as $table) {
            $exists = DB::table('information_schema.tables')
                ->where('table_schema', DB::getDatabaseName())
                ->where('table_name', $table)
                ->exists();

            if ($exists) {
                return $table;
            }
        }

        return null;
    }

    public static function prefixed(string $base): string
    {
        $primary = config('yoc.prefix_primary');
        $fallback = config('yoc.prefix_fallback');

        $primaryName = $primary . $base;
        $fallbackName = $fallback . $base;

        return self::firstExisting([$primaryName, $fallbackName]) ?? $primaryName;
    }
}
