<?php

namespace App\Models;

use App\Support\TableResolver;
use Illuminate\Database\Eloquent\Model;

/**
 * Eloquent base model that dynamically resolves the correct prefixed table.
 */
abstract class BasePrefixedModel extends Model
{
    public $timestamps = false;

    /**
    * Child classes set the logical base table name without prefix.
    * Example: protected static string $baseTable = 'appeal';
    */
    protected static string $baseTable;

    public function getTable()
    {
        return TableResolver::prefixed(static::$baseTable);
    }
}
